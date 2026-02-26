// backend/Service/Groq.js
const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function chatWithGroq(messages) {
    const chatCompletion = await groq.chat.completions.create({
        messages,
        model: "groq/compound",
    });

    return chatCompletion.choices[0]?.message?.content || "";
}

module.exports = { chatWithGroq };
