// backend/Service/Groq.js
const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function chatWithGroq(messages) {
    const chatCompletion = await groq.chat.completions.create({
        messages,
        model: "compound-beta",
    });

    return chatCompletion.choices[0]?.message?.content || "";
}

async function chatWithGroqStream(messages, res, clientClosed) {
    try {
        // Envoie un chunk initial pour indiquer le début du streaming
        res.write(`data: ${JSON.stringify({ role: "assistant", content: "" })}\n\n`);

        const stream = await groq.chat.completions.create({
            messages,
            model: "llama-3.3-70b-versatile",
            stream: true,
        });

        for await (const chunk of stream) {
            // Arrête si le client s'est fermé
            if (clientClosed) {
                console.log("[SSE] Client déconnecté, arrêt du stream");
                break;
            }

            const delta = chunk.choices[0]?.delta;
            const content = delta?.content;

            console.log("[SSE CHUNK]", JSON.stringify({ content }));

            // N'envoie que les chunks avec contenu
            if (typeof content === "string" && content.length > 0) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        // Signale la fin du stream
        res.write("data: [DONE]\n\n");
        res.end();
    } catch (error) {
        console.error("[SSE ERROR]", error.message);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
}

module.exports = { chatWithGroq, chatWithGroqStream };
