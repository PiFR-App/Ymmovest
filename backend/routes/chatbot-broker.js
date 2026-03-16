// backend/routes/chatbot-broker.js
/**
 * Routes pour les appels au chatbot via RabbitMQ Message Broker
 * Support des 3 modes: REST async, polling, SSE
 */
const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { sendMessage, publishMessage, consumeMessages, QUEUES } = require("../Service/MessageBroker");

// Store en-mémoire pour les réponses (optionnel avec Redis en prod)
const taskStore = new Map();

// Store des connexions SSE actives pour recevoir les réponses
const sseConnections = new Map();

/**
 * POST /api/chatbot/async
 * Mode async : envoie le message à la queue et répond immédiatement avec un task_id
 */
router.post("/async", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "prompt requis (string)" });
    }

    const taskId = uuidv4();
    console.log(`\n[🌐 API /chatbot/async] Requête reçue`);
    console.log(`[🌐 API /chatbot/async] TaskID: ${taskId}`);
    console.log(`[🌐 API /chatbot/async] Prompt: ${prompt.substring(0, 50)}...`);

    const message = {
      taskId,
      prompt,
      mode: "async",
      timestamp: new Date().toISOString(),
    };

    // Initialise le store de tâche
    taskStore.set(taskId, { status: "pending", result: null, error: null });

    // Envoie le message à la queue
    console.log(`[🌐 API /chatbot/async] → Envoi à RabbitMQ...`);
    await sendMessage(QUEUES.CHAT_REQUEST, message);
    console.log(`[✅ MessageBroker] Message accepté par la queue`);

    console.log(`[🌐 API /chatbot/async] ✅ Réponse 200 au client (taskId: ${taskId})\n`);
    res.json({ task_id: taskId, status: "accepted" });
  } catch (error) {
    console.error(`[❌ API /chatbot/async] Erreur:`, error.message);
    res.status(500).json({ error: "Erreur lors de la soumission" });
  }
});

/**
 * GET /api/chatbot/tasks/:taskId
 * Mode polling : retourne le status d'une tâche
 */
router.get("/tasks/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    console.log(`[🔍 API /chatbot/tasks] Poll reçu: ${taskId}`);

    const task = taskStore.get(taskId);

    if (!task) {
      console.log(`[🔍 API /chatbot/tasks] ❌ Tâche non trouvée: ${taskId}\n`);
      return res.status(404).json({ error: "Tâche non trouvée" });
    }

    console.log(`[🔍 API /chatbot/tasks] Status: ${task.status} (${taskId})`);
    console.log(`[🔍 API /chatbot/tasks] ✅ Réponse au client\n`);

    res.json({
      task_id: taskId,
      status: task.status,
      result: task.result,
      error: task.error,
    });
  } catch (error) {
    console.error(`[❌ API /chatbot/tasks] Erreur:`, error.message);
    res.status(500).json({ error: "Erreur lors de la récupération" });
  }
});

/**
 * POST /api/chatbot/stream
 * Mode SSE : envoie le message et stream les réponses
 */
router.post("/stream", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "prompt requis (string)" });
    }

    // Headers SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const taskId = uuidv4();
    console.log(`\n[🌐 API /chatbot/stream] ═══════════════════════════════════`);
    console.log(`[🌐 API /chatbot/stream] Requête SSE reçue`);
    console.log(`[🌐 API /chatbot/stream] TaskID: ${taskId}`);
    console.log(`[🌐 API /chatbot/stream] Prompt: ${prompt.substring(0, 50)}...`);
    console.log(`[🌐 API /chatbot/stream] → Headers SSE envoyés au client`);

    let isClientClosed = false;

    // Enregistre la connexion SSE
    sseConnections.set(taskId, { res, isActive: true });
    console.log(`[📡 SSE] Connexion enregistrée (${taskId})`);

    // Détecte la fermeture du client UNIQUEMENT via la réponse
    res.on("close", () => {
      console.log(`[❌ SSE] Response fermée par le client (${taskId})`);
      sseConnections.delete(taskId);
    });

    // Envoie le message initial
    res.write(`data: ${JSON.stringify({ taskId, status: "streaming" })}\n\n`);
    console.log(`[🌐 API /chatbot/stream] → Chunk initial envoyé au client`);

    // Envoie à la queue
    console.log(`[🌐 API /chatbot/stream] → Envoi à RabbitMQ...`);
    await publishMessage("sse.stream", {
      taskId,
      prompt,
      mode: "sse",
      timestamp: new Date().toISOString(),
    });
    console.log(`[✅ MessageBroker] Message publié sur sse.stream`);
    console.log(`[🌐 API /chatbot/stream] ═══════════════════════════════════\n`);

    // Timeout long pour attendre la réponse du worker
    const timeout = setTimeout(() => {
      if (!isClientClosed && sseConnections.has(taskId)) {
        console.log(`[⏱️  SSE] Timeout atteint (${taskId}), fermeture du stream`);
        sseConnections.delete(taskId);
        if (!res.writableEnded) {
          res.write("data: [DONE]\n\n");
          res.end();
        }
      }
    }, 300000); // 5 minutes de timeout

    // Heart beat pour maintenir la connexion ouverte
    const heartbeat = setInterval(() => {
      if (!isClientClosed && sseConnections.has(taskId) && !res.writableEnded) {
        res.write(": heartbeat\n\n");
        console.log(`[💓 SSE] Heart beat envoyé (${taskId})`);
      } else {
        clearInterval(heartbeat);
      }
    }, 30000); // Tous les 30 secondes

    res.on("close", () => {
      clearTimeout(timeout);
      clearInterval(heartbeat);
      console.log(`[❌ SSE] Response fermée (${taskId})`);
      sseConnections.delete(taskId);
    });

  } catch (error) {
    console.error(`[❌ API /chatbot/stream] Erreur:`, error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Erreur lors du streaming" });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
});

/**
 * Envoie un chunk SSE à une connexion active
 */
function sendSSEChunk(taskId, chunk) {
  const connection = sseConnections.get(taskId);
  if (connection && connection.isActive && !connection.res.writableEnded) {
    console.log(`[📤 SSE → client] Chunk envoyé (${taskId})`);
    connection.res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    return true;
  }
  return false;
}

/**
 * Ferme une connexion SSE
 */
function closeSSEConnection(taskId) {
  const connection = sseConnections.get(taskId);
  if (connection && connection.isActive) {
    console.log(`[🔒 SSE] Fermeture de la connexion (${taskId})`);
    connection.res.write("data: [DONE]\n\n");
    connection.res.end();
    sseConnections.delete(taskId);
  }
}

module.exports = router;
module.exports.sendSSEChunk = sendSSEChunk;
module.exports.closeSSEConnection = closeSSEConnection;
module.exports.sseConnections = sseConnections;
module.exports.taskStore = taskStore;


