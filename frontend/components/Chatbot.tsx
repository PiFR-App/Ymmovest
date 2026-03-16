import { useState, useRef, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  IconButton,
  Paper,
  CircularProgress,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { Send, SmartToy, Person } from "@mui/icons-material";

const MODE_LABELS: Record<string, string> = {
  async: "REST asynchrone",
  polling: "REST polling",
  sse: "HTTP SSE",
  websocket: "WebSocket",
};

interface Message {
  role: "user" | "assistant";
  content: string;
  id?: string;
  latency_ms?: number;
  tokens_used?: number;
  polls?: number;
  task_id?: string;
  mode?: string;
}

interface PollStatus {
  label: string;
  polls: number;
}

const POLL_INTERVAL_MS = 1500;

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pollStatus, setPollStatus] = useState<PollStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState("async");
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, pollStatus]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const sendMessageRest = async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;

    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setLoading(true);

    try {
      const res = await fetch("/api/groq/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `Erreur ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response, mode: "async" },
      ]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const sendMessageRestPoll = async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;

    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setLoading(true);
    setPollStatus({ label: "Soumission en cours…", polls: 0 });

    try {
      const submitRes = await fetch("/api/chat/async", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!submitRes.ok) {
        const err = await submitRes.json().catch(() => ({}));
        throw new Error(err.detail ?? `Erreur ${submitRes.status}`);
      }

      const { task_id } = await submitRes.json();
      setPollStatus({ label: "En attente de traitement…", polls: 0 });

      let pollCount = 0;
      intervalRef.current = setInterval(async () => {
        pollCount++;
        setPollStatus({
          label: `Traitement en cours (poll #${pollCount})…`,
          polls: pollCount,
        });

        try {
          const pollRes = await fetch(`/api/tasks/${task_id}`);
          const taskData = await pollRes.json();

          if (taskData.status === "done") {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: taskData.result,
                latency_ms: taskData.latency_ms,
                tokens_used: taskData.tokens_used,
                polls: pollCount,
                task_id,
                mode: "polling",
              },
            ]);
            setPollStatus(null);
            setLoading(false);
          } else if (taskData.status === "error") {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            throw new Error(taskData.error ?? "Erreur inconnue du serveur");
          }
        } catch (pollErr: unknown) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setError(
              pollErr instanceof Error ? pollErr.message : "Erreur de polling"
          );
          setPollStatus(null);
          setLoading(false);
        }
      }, POLL_INTERVAL_MS);
    } catch (e: unknown) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setError(e instanceof Error ? e.message : "Erreur inconnue");
      setPollStatus(null);
      setLoading(false);
    }
  };

  const sendMessageSSE = async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;

    setInput("");
    setError(null);
    setLoading(true);

    // Identifiant unique pour retrouver le bon message assistant
    const assistantId = Date.now().toString();

    // Ajoute le message user ET le message assistant vide en un seul setMessages
    setMessages((prev) => [
      ...prev,
      { role: "user", content: prompt },
      { role: "assistant", content: "", mode: "sse", id: assistantId },
    ]);

    try {
      const res = await fetch("/api/groq/chat-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `Erreur ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;

          const raw = trimmed.slice(5).trim();
          if (!raw || raw === "[DONE]") continue;

          try {
            const parsed = JSON.parse(raw);
            const content = parsed?.content;
            // Accepte les chunks avec content (même vide au premier message)
            if (typeof content === "string") {
              // Cible le message assistant via son id unique
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId
                    ? { ...msg, content: msg.content + content }
                    : msg
                )
              );
            }
          } catch {
            // Chunk JSON malformé — on ignore
          }
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const sendMessageWebSocket = async () => {
    alert("Option non implémentée dans ce prototype");
  };

  const handleSend = () => {
    if (selectedOption === "polling") sendMessageRestPoll();
    else if (selectedOption === "async") sendMessageRest();
    else if (selectedOption === "sse") sendMessageSSE();
    else if (selectedOption === "websocket") sendMessageWebSocket();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={600} mb={1}>
          Assistant immobilier
        </Typography>
        <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
        >
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Architecture</InputLabel>
            <Select
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                label="Architecture"
            >
              <MenuItem value="async">REST asynchrone</MenuItem>
              <MenuItem value="polling">REST polling</MenuItem>
              <MenuItem value="sse">HTTP SSE</MenuItem>
              <MenuItem value="websocket">WebSocket</MenuItem>
            </Select>
          </FormControl>

          <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "right" }}
          >
            {selectedOption === "async" &&
                `Architecture REST asynchrone — le serveur répond immédiatement`}
            {selectedOption === "polling" &&
                `Architecture REST polling — requêtes périodiques au serveur, le résultat est récupéré par polling toutes les ${POLL_INTERVAL_MS} ms.`}
            {selectedOption === "sse" &&
                "Architecture HTTP SSE — streaming server-sent events."}
            {selectedOption === "websocket" &&
                "Architecture WebSocket — communication bidirectionnelle en temps réel."}
          </Typography>
        </Box>

        {/* Zone de messages */}
        <Paper
            variant="outlined"
            sx={{
              p: 2,
              minHeight: 400,
              maxHeight: 520,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mb: 2,
            }}
        >
          {messages.length === 0 && !loading && (
              <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
              >
                <Typography color="text.secondary" textAlign="center">
                  Commencez par poser une question…
                </Typography>
              </Box>
          )}

          {messages.map((msg, i) => (
              <Box
                  key={i}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
              >
                <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      flexDirection: msg.role === "user" ? "row-reverse" : "row",
                      maxWidth: "85%",
                    }}
                >
                  <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor:
                            msg.role === "user" ? "secondary.main" : "primary.main",
                        color: "white",
                        flexShrink: 0,
                        mt: 0.5,
                      }}
                  >
                    {msg.role === "user" ? (
                        <Person sx={{ fontSize: 18 }} />
                    ) : (
                        <SmartToy sx={{ fontSize: 18 }} />
                    )}
                  </Box>

                  <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        bgcolor:
                            msg.role === "user" ? "secondary.main" : "action.hover",
                        color: msg.role === "user" ? "white" : "text.primary",
                        borderRadius: 2,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                  >
                    <Typography variant="body2">{msg.content}</Typography>
                  </Paper>
                </Box>

                {msg.role === "assistant" && (
                    <Stack
                        direction="row"
                        spacing={1}
                        mt={0.5}
                        ml={5}
                        flexWrap="wrap"
                    >
                      {msg.mode && (
                          <Chip
                              label={MODE_LABELS[msg.mode] ?? msg.mode}
                              size="small"
                              color="secondary"/>
                      )}
                      {msg.latency_ms !== undefined && (
                          <Chip
                              label={`Groq : ${msg.latency_ms} ms`}
                              size="small"
                              variant="outlined"
                          />
                      )}
                      {msg.tokens_used !== undefined && (
                          <Chip
                              label={`${msg.tokens_used} tokens`}
                              size="small"
                              variant="outlined"
                          />
                      )}
                      {msg.polls !== undefined && (
                          <Chip
                              label={`${msg.polls} polls`}
                              size="small"
                              variant="outlined"color="primary"
                          />
                      )}
                    </Stack>
                )}
              </Box>
          ))}

          {/* Indicateur de polling en temps réel */}
          {pollStatus && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 1 }}>
                <CircularProgress size={18} />
                <Typography variant="body2" color="text.secondary">
                  {pollStatus.label}
                </Typography>
              </Box>
          )}

          {error && (
              <Typography variant="body2" color="error" sx={{ pl: 1 }}>
                Erreur : {error}
              </Typography>
          )}

          <div ref={bottomRef} />
        </Paper>

        {/* Zone de saisie */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
          <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Votre question… (Entrée pour envoyer)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              size="small"
          />
          <IconButton
              onClick={handleSend}
              disabled={loading || !input.trim()}
              sx={{
                bgcolor: "secondary.main",
                color: "white",
                "&:hover": { bgcolor: "secondary.dark" },
                "&:disabled": { bgcolor: "action.disabledBackground" },
                width: 42,
                height: 42,
              }}
          >
            <Send fontSize="small" />
          </IconButton>
        </Box>
      </Container>
  );
}
