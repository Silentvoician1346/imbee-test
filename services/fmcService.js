const amqplib = require("amqplib");
const firebase = require("./firebase");
const db = require("../models/db");
const { saveFcmJob } = require("../models/fcmJob");
const dotenv = require("dotenv");
dotenv.config();

async function consumeMessages() {
  try {
    const conn = await amqplib.connect(process.env.RABBITMQ_URL);
    const channel = await conn.createChannel();
    await channel.assertQueue(process.env.RABBITMQ_QUEUE, { durable: true });

    console.log(`Waiting for messages in queue: ${process.env.RABBITMQ_QUEUE}`);

    channel.consume(process.env.RABBITMQ_QUEUE, async (msg) => {
      if (msg !== null) {
        const content = JSON.parse(msg.content.toString());

        // Validate the message
        if (validateMessage(content)) {
          // Acknowledge the message
          channel.ack(msg);

          // Send FCM message
          const fcmResponse = await sendFcm(content);

          // Log success and save to database
          const deliverAt = new Date().toISOString();
          await saveFcmJob(content.identifier, deliverAt);

          // Publish result to RabbitMQ
          await publishResult(content.identifier, deliverAt);
        }
      }
    });
  } catch (error) {
    console.error("Error consuming messages:", error);
  }
}

function validateMessage(message) {
  return (
    message.identifier &&
    typeof message.identifier === "string" &&
    message.type &&
    typeof message.type === "string" &&
    message.deviceId &&
    typeof message.deviceId === "string" &&
    message.text &&
    typeof message.text === "string"
  );
}

async function sendFcm(message) {
  const fcmMessage = {
    notification: {
      title: "Incoming message",
      body: message.text,
    },
    token: message.deviceId,
  };

  return firebase.messaging().send(fcmMessage);
}

async function publishResult(identifier, deliverAt) {
  const conn = await amqplib.connect(process.env.RABBITMQ_URL);
  const channel = await conn.createChannel();
  const topicName = process.env.RABBITMQ_TOPIC;

  const payload = {
    identifier,
    deliverAt,
  };

  await channel.assertExchange(topicName, "topic", { durable: true });
  channel.publish(topicName, "", Buffer.from(JSON.stringify(payload)));

  console.log(`Published result to ${topicName}:`, payload);
}

module.exports = {
  consumeMessages,
};
