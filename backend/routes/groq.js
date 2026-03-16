// backend/routes/groq.js
const express = require("express");
const router = express.Router();
const { chatWithGroq, chatWithGroqStream } = require("../Service/Groq.js");

// POST /api/groq/chat
router.post("/chat", async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "messages requis (tableau)" });
        }

        const response = await chatWithGroq(messages);
        res.json({ response });
    } catch (error) {
        console.error("Groq error:", error);
        res.status(500).json({ error: "Erreur Groq" });
    }
});

// POST /api/groq/chat-stream  →  SSE (Server-Sent Events)
router.post("/chat-stream", async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "messages requis (tableau)" });
        }

        // En-têtes SSE obligatoires
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no"); // Désactive buffering Nginx
        res.flushHeaders(); // Envoie les en-têtes immédiatement

        // Gestion de la déconnexion du client (ne pas terminer prématurément)
        let clientClosed = false;
        req.on("close", () => {
            clientClosed = true;
        });

        await chatWithGroqStream(messages, res, clientClosed);
    } catch (error) {
        console.error("Groq stream error:", error);
        if (!res.headersSent) {
            res.write(`data: ${JSON.stringify({ error: "Erreur Groq stream" })}\n\n`);
        }
        res.end();
    }
});

module.exports = router;
