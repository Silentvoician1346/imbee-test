import amqplib from "amqplib";
import dotenv from "dotenv";
import firebase from "./firebase.js";
import { saveFcmJob } from "../models/fcmJob.js";
dotenv.config();

async function connectRabbitMQ() {
  for (let i = 0; i < 10; i++) {
    try {
      const conn = await amqplib.connect(
        process.env.RABBITMQ_URL || "amqp://guest:guest@rabbitmq:5672"
      );
      console.log("Connected to RabbitMQ");
      return conn;
    } catch (err) {
      console.error("Error connecting to RabbitMQ, retrying in 5 seconds...", err);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
  throw new Error("Failed to connect to RabbitMQ after 10 attempts.");
}

connectRabbitMQ();

export async function consumeMessages() {
  try {
    const conn = await connectRabbitMQ();
    const channel = await conn.createChannel();
    await channel.assertQueue(process.env.RABBITMQ_QUEUE, { durable: true });
    console.log(
      `|\n|\n|\n|\n|\n|Waiting for messages in queue: ${process.env.RABBITMQ_QUEUE}\n|\n|\n|\n|\n|`
    );
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
  // * uncomment this code to proceed to send notification to specific deviceID
  //   const fcmMessage = {
  //     notification: {
  //       title: "Incoming message",
  //       body: message.text,
  //     },
  //     token: message.deviceId,
  //   };

  const fcmMessage = {
    notification: {
      title: "Incoming message",
      body: message.text,
    },
    topic: message.topic,
  };

  try {
    const response = await firebase.messaging().send(fcmMessage);
    console.log("Successfully sent message to topic:", response);
    return response;
  } catch (error) {
    console.error("Error sending topic message:", error);
  }
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
