// backend/workers/chatbot-consumer.js
/**
 * Worker qui consomme les messages du chatbot depuis RabbitMQ
 * et envoie les réponses vers le client
 */
const { consumeMessages, QUEUES, publishMessage } = require("../Service/MessageBroker");
const { chatWithGroq, chatWithGroqStream } = require("../Service/Groq");
const { sendSSEChunk, closeSSEConnection, taskStore } = require("../routes/chatbot-broker");

// Store global pour les connexions WebSocket actives
const wsConnections = new Map();

/**
 * Lance le consommateur des messages de requête chatbot
 */
async function startChatbotConsumer() {
  try {
    console.log("\n[🚀 Chatbot Worker] Démarrage du consommateur...");

    // Consumer 1 : Traite les requêtes async et WebSocket
    await consumeMessages(QUEUES.CHAT_REQUEST, async (message) => {
      const { taskId, prompt, mode, wsId } = message;

      console.log(`\n[⚡ Chatbot Worker] ════════════════════════════════`);
      console.log(`[⚡ Chatbot Worker] TRAITEMENT: ${taskId}`);
      console.log(`[⚡ Chatbot Worker] Mode: ${mode}`);
      console.log(`[⚡ Chatbot Worker] Prompt: ${prompt.substring(0, 50)}...`);
      console.log(`[⚡ Chatbot Worker] ════════════════════════════════`);

      try {
        if (mode === "async") {
          console.log(`[🔄 Chatbot Worker] Mode ASYNC → Appel Groq...`);
          const response = await chatWithGroq([
            { role: "user", content: prompt },
          ]);

          console.log(`[📝 Chatbot Worker] Réponse reçue: ${response.substring(0, 50)}...`);
          console.log(`[📤 Chatbot Worker] → Publication sur chat.response`);

          await publishMessage("chat.response", {
            taskId,
            status: "done",
            result: response,
            latency_ms: Date.now(),
          });

          console.log(`[✅ Chatbot Worker] ✅ Réponse async traitée (${taskId})\n`);
        } else if (mode === "websocket") {
          console.log(`[🔌 Chatbot Worker WebSocket] Mode WebSocket → Streaming...`);
          console.log(`[🔌 Chatbot Worker WebSocket] wsId: ${wsId}`);

          const mockRes = {
            write: (data) => {
              try {
                // Parse le format SSE "data: {...}\n\n"
                const lines = data.split("\n");
                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    const raw = line.slice(6).trim();
                    if (!raw || raw === "[DONE]") {
                      console.log(`[🔌 Chatbot Worker WebSocket] [DONE] signal reçu`);
                      return;
                    }

                    const parsed = JSON.parse(raw);
                    if (parsed.content !== undefined && parsed.content !== "") {
                      console.log(`[🔌 Chatbot Worker WebSocket] Token: "${parsed.content}"`);

                      // Envoie le token au WebSocket
                      const sent = sendWebSocketToken(wsId, parsed.content);
                      if (sent) {
                        console.log(`[✅ Chatbot Worker WebSocket → Client] Token relayé`);
                      } else {
                        console.warn(`[⚠️  Chatbot Worker WebSocket] WebSocket non actif (${wsId})`);
                      }
                    }
                  }
                }
              } catch (e) {
                console.error(`[❌ Chatbot Worker WebSocket] Parse error:`, e.message);
              }
            },
            end: () => {
              console.log(`[🔌 Chatbot Worker WebSocket] res.end() appelé`);
              const ws = wsConnections.get(wsId);
              if (ws && ws.readyState === 1) {
                ws.send(JSON.stringify({ type: "done" }));
              }
            }
          };

          console.log(`[🔄 Chatbot Worker WebSocket] → Démarrage du streaming Groq`);
          await chatWithGroqStream([{ role: "user", content: prompt }], mockRes);

          console.log(`[✅ Chatbot Worker WebSocket] ✅ Stream WebSocket complété (${taskId})\n`);
        }
      } catch (error) {
        console.error(`[❌ Chatbot Worker] ERREUR (${taskId}):`, error.message);

        if (mode === "websocket") {
          const ws = wsConnections.get(wsId);
          if (ws && ws.readyState === 1) {
            ws.send(JSON.stringify({ type: "error", message: error.message }));
          }
        } else {
          await publishMessage("chat.response", {
            taskId,
            status: "error",
            error: error.message,
          });
        }
      }
    });

    console.log("[✅ Chatbot Worker] Consumer 1 (chat.request) lancé et en écoute\n");

    // Consumer 2 : Traite les requêtes SSE depuis sse.stream
    await consumeMessages(QUEUES.SSE_STREAM, async (message) => {
      const { taskId, prompt, mode } = message;

      console.log(`\n[📡 Chatbot Worker SSE] ════════════════════════════════`);
      console.log(`[📡 Chatbot Worker SSE] STREAMING: ${taskId}`);
      console.log(`[📡 Chatbot Worker SSE] Prompt: ${prompt.substring(0, 50)}...`);
      console.log(`[📡 Chatbot Worker SSE] ════════════════════════════════`);

      try {
        console.log(`[🔄 Chatbot Worker SSE] Mode SSE → Streaming...`);

        const mockRes = {
          write: (data) => {
            try {
              // Parse le format SSE "data: {...}\n\n"
              const lines = data.split("\n");
              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const raw = line.slice(6).trim();
                  if (!raw || raw === "[DONE]") {
                    console.log(`[📡 Chatbot Worker SSE] [DONE] signal reçu`);
                    return; // Ignore [DONE]
                  }
                  
                  const parsed = JSON.parse(raw);
                  if (parsed.content !== undefined) {
                    console.log(`[📤 Chatbot Worker SSE] Chunk: "${parsed.content || ""}"`);
                    
                    // Envoie le chunk à la connexion SSE active
                    const sent = sendSSEChunk(taskId, parsed);
                    if (sent) {
                      console.log(`[✅ Chatbot Worker SSE → Client] Chunk relayé`);
                    }
                  }
                }
              }
            } catch (e) {
              console.error(`[❌ Chatbot Worker SSE] Parse error:`, e.message);
            }
          },
          end: () => {
            console.log(`[📡 Chatbot Worker SSE] res.end() appelé`);
          }
        };

        console.log(`[🔄 Chatbot Worker SSE] → Démarrage du streaming Groq`);
        await chatWithGroqStream([{ role: "user", content: prompt }], mockRes);

        console.log(`[📤 Chatbot Worker SSE] → Fermeture de la connexion SSE`);
        closeSSEConnection(taskId);

        console.log(`[✅ Chatbot Worker SSE] ✅ Stream SSE complété (${taskId})\n`);
      } catch (error) {
        console.error(`[❌ Chatbot Worker SSE] ERREUR (${taskId}):`, error.message);

        sendSSEChunk(taskId, { error: error.message });
        closeSSEConnection(taskId);
      }
    });

    console.log("[✅ Chatbot Worker] Consumer 2 (sse.stream) lancé et en écoute\n");

    // Consumer 3 : Traite les réponses async et met à jour le taskStore
    await consumeMessages(QUEUES.CHAT_RESPONSE, async (message) => {
      const { taskId, status, result, error } = message;

      console.log(`\n[💾 Chatbot Worker Response] ════════════════════════════════`);
      console.log(`[💾 Chatbot Worker Response] TaskID: ${taskId}`);
      console.log(`[💾 Chatbot Worker Response] Status: ${status}`);

      try {
        // Met à jour le taskStore pour que le polling puisse récupérer la réponse
        if (taskStore && typeof taskStore.set === 'function') {
          taskStore.set(taskId, {
            status: status,
            result: result,
            error: error,
          });
          console.log(`[✅ Chatbot Worker Response] TaskStore mis à jour (${taskId})`);
        } else {
          console.warn(`[⚠️  Chatbot Worker Response] taskStore non disponible`);
        }
      } catch (err) {
        console.error(`[❌ Chatbot Worker Response] Erreur (${taskId}):`, err.message);
      }
    });

    console.log("[✅ Chatbot Worker] Consumer 3 (chat.response) lancé et en écoute\n");

    // Consumer 4 : Traite les requêtes WebSocket mode streaming
    // Note: Les messages WebSocket sont envoyés sur CHAT_REQUEST avec mode: "websocket"
    // Ils sont traités dans le consumer 1, mais on peut ajouter un traitement spécifique ici si nécessaire

  } catch (error) {
    console.error("[❌ Chatbot Worker] Erreur démarrage:", error.message);
    process.exit(1);
  }
}

/**
 * Enregistre une connexion WebSocket active
 */
function registerWebSocketConnection(taskId, ws) {
  wsConnections.set(taskId, ws);
  console.log(`[📡 WebSocket] Connexion enregistrée (${taskId})`);

  ws.on("close", () => {
    wsConnections.delete(taskId);
    console.log(`[❌ WebSocket] Connexion fermée (${taskId})`);
  });
}

/**
 * Envoie un token WebSocket
 */
function sendWebSocketToken(taskId, token) {
  const ws = wsConnections.get(taskId);
  if (ws && ws.readyState === 1) { // 1 = OPEN
    ws.send(JSON.stringify({
      type: "stream",
      token,
    }));
    return true;
  }
  return false;
}

module.exports = {
  startChatbotConsumer,
  registerWebSocketConnection,
  sendWebSocketToken,
  wsConnections,
};

