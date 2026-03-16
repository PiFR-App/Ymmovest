// backend/Service/MessageBroker.js
const amqp = require("amqplib");

let connection = null;
let channel = null;

const QUEUES = {
  CHAT_REQUEST: "chat.request",
  CHAT_RESPONSE: "chat.response",
  SSE_STREAM: "sse.stream",
};

const EXCHANGES = {
  CHAT: "chat.exchange",
};

/**
 * Connecte à RabbitMQ et initialise les queues/exchanges
 */
async function connect() {
  try {
    if (connection && !connection.closed) {
      console.log("[🟢 MessageBroker] Déjà connecté à RabbitMQ");
      return channel;
    }

    const url = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
    console.log("[🔗 MessageBroker] Connexion à:", url.replace(/:[^@]*@/, ":***@"));

    connection = await amqp.connect(url);
    channel = await connection.createChannel();

    console.log("[✅ MessageBroker] CONNECTÉ à RabbitMQ");

    // Crée les exchanges
    await channel.assertExchange(EXCHANGES.CHAT, "topic", { durable: true });
    console.log(`[📤 MessageBroker] Exchange '${EXCHANGES.CHAT}' créé/vérifié`);

    // Crée les queues durables
    await channel.assertQueue(QUEUES.CHAT_REQUEST, { durable: true });
    console.log(`[📥 MessageBroker] Queue '${QUEUES.CHAT_REQUEST}' créée/vérifiée`);

    await channel.assertQueue(QUEUES.CHAT_RESPONSE, { durable: true });
    console.log(`[📥 MessageBroker] Queue '${QUEUES.CHAT_RESPONSE}' créée/vérifiée`);

    await channel.assertQueue(QUEUES.SSE_STREAM, { durable: true });
    console.log(`[📥 MessageBroker] Queue '${QUEUES.SSE_STREAM}' créée/vérifiée`);

    // Bind les queues à l'exchange
    await channel.bindQueue(QUEUES.CHAT_REQUEST, EXCHANGES.CHAT, "chat.request");
    await channel.bindQueue(QUEUES.CHAT_RESPONSE, EXCHANGES.CHAT, "chat.response");
    await channel.bindQueue(QUEUES.SSE_STREAM, EXCHANGES.CHAT, "sse.stream");
    console.log("[🔗 MessageBroker] Bindings configurés");

    // Gestion de la déconnexion
    connection.on("error", (err) => {
      console.error("[❌ MessageBroker] Erreur de connexion:", err.message);
      connection = null;
      channel = null;
    });

    console.log("[🟢 MessageBroker] Prêt à envoyer/recevoir des messages\n");
    return channel;
  } catch (error) {
    console.error("[❌ MessageBroker] ERREUR DE CONNEXION:", error.message);
    throw error;
  }
}

/**
 * Envoie un message à une queue
 */
async function sendMessage(queueName, message) {
  try {
    if (!channel) await connect();

    const msg = Buffer.from(JSON.stringify(message));
    const sent = channel.sendToQueue(queueName, msg, {
      persistent: true,
      contentType: "application/json",
    });

    if (!sent) {
      console.warn(`[⚠️  MessageBroker] Queue ${queueName} pleine, attente...`);
    } else {
      console.log(`[📤 MessageBroker → ${queueName}] Message envoyé:`, message.taskId || message);
    }

    return true;
  } catch (error) {
    console.error(`[❌ MessageBroker] Erreur d'envoi à ${queueName}:`, error.message);
    throw error;
  }
}

/**
 * Consomme les messages d'une queue
 */
async function consumeMessages(queueName, handler) {
  try {
    if (!channel) await connect();

    await channel.prefetch(1); // Traite 1 message à la fois
    console.log(`[👂 MessageBroker] Consommateur lancé pour ${queueName}`);

    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log(`[📥 MessageBroker ← ${queueName}] Message reçu:`, content.taskId || content);

          await handler(content);
          channel.ack(msg); // Acquitte le message
          console.log(`[✅ MessageBroker] Message traité et acquitté (${queueName})`);
        } catch (error) {
          console.error(`[❌ MessageBroker] Erreur traitement (${queueName}):`, error.message);
          channel.nack(msg, false, true); // Remet en queue
        }
      }
    });

  } catch (error) {
    console.error(`[❌ MessageBroker] Erreur consommateur (${queueName}):`, error.message);
    throw error;
  }
}

/**
 * Publie un message sur un exchange (topic)
 */
async function publishMessage(routingKey, message) {
  try {
    if (!channel) await connect();

    const msg = Buffer.from(JSON.stringify(message));
    channel.publish(EXCHANGES.CHAT, routingKey, msg, {
      persistent: true,
      contentType: "application/json",
    });

    console.log(`[🎯 MessageBroker → ${routingKey}] Message publié:`, message.taskId || message);
    return true;
  } catch (error) {
    console.error(`[❌ MessageBroker] Erreur publication (${routingKey}):`, error.message);
    throw error;
  }
}

/**
 * Ferme la connexion
 */
async function disconnect() {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log("[MessageBroker] Déconnecté de RabbitMQ");
  } catch (error) {
    console.error("[MessageBroker] Erreur déconnexion:", error.message);
  }
}

module.exports = {
  connect,
  sendMessage,
  consumeMessages,
  publishMessage,
  disconnect,
  QUEUES,
  EXCHANGES,
};

