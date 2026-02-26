// backend/routes/groq.js
const express = require("express");
const router = express.Router();
const { chatWithGroq } = require("../Service/Groq.js");

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

module.exports = router;
