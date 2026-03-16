// backend/Service/Groq.js

const Groq = require("groq-sdk");

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY manquante dans .env");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  timeout: 30000,
});

// ==============================
// Chat classique (non streaming)
// ==============================
async function chatWithGroq(messages) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.7,
    max_tokens: 2048,
  });

  return completion.choices[0]?.message?.content || "";
}

// ==============================
// Streaming ultra rapide
// ==============================
async function streamWithGroq(messages, onToken) {
  const stream = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.7,
    stream: true,
  });

  let fullResponse = "";

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content;
    if (token) {
      fullResponse += token;
      onToken(token);
    }
  }

  return fullResponse;
}

module.exports = {
  chatWithGroq,
  streamWithGroq,
};