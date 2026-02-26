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
} from "@mui/material";
import { Send, SmartToy, Person } from "@mui/icons-material";

interface Message {
  role: "user" | "assistant";
  content: string;
  latency_ms?: number;
  tokens_used?: number;
  polls?: number;
  task_id?: string;
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
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, pollStatus]);

  // Nettoyage du polling si le composant est démonté
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const sendMessage = async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;

    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setLoading(true);
    setPollStatus({ label: "Soumission en cours…", polls: 0 });

    try {
      // 1. Soumission — réponse immédiate avec task_id
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

      // 2. Polling
      let pollCount = 0;
      intervalRef.current = setInterval(async () => {
        pollCount++;
        setPollStatus({ label: `Traitement en cours (poll #${pollCount})…`, polls: pollCount });

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
          setError(pollErr instanceof Error ? pollErr.message : "Erreur de polling");
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={600} mb={1}>
        Assistant immobilier
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Architecture REST asynchrone — le serveur répond immédiatement, le
        résultat est récupéré par polling toutes les {POLL_INTERVAL_MS} ms.
      </Typography>

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

            {msg.role === "assistant" && msg.latency_ms !== undefined && (
              <Stack direction="row" spacing={1} mt={0.5} ml={5} flexWrap="wrap">
                <Chip label={`Groq : ${msg.latency_ms} ms`} size="small" variant="outlined" />
                <Chip label={`${msg.tokens_used} tokens`} size="small" variant="outlined" />
                <Chip label={`${msg.polls} polls`} size="small" variant="outlined" color="primary" />
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
          onClick={sendMessage}
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
