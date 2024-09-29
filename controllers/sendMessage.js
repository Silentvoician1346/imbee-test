import amqp from "amqplib";
import dotenv from "dotenv";
dotenv.config();

async function sendMessageToQueue(queueName, message) {
  try {
    // Connect to RabbitMQ server
    const connection = await amqp.connect("amqp://guest:guest@rabbitmq:5672");

    // Create a channel
    const channel = await connection.createChannel();

    // Ensure the queue exists before publishing to it
    await channel.assertQueue(queueName, {
      durable: true, // Queue will survive RabbitMQ server restarts
    });

    // Send a message to the queue
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
      persistent: true, // Make sure message survives RabbitMQ server restarts
    });

    console.log(`Sent message to queue: ${queueName}`, message);

    // Close the connection after a brief delay to ensure the message is sent
    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error("Error sending message to RabbitMQ:", error);
  }
}

// Example usage
const queueName = "notification.fcm";
const message = {
  identifier: "fcm-msg-a1beff5ac",
  type: "device",
  deviceId: "140049bb-94a4-4ca8-9949-7ecd09004874",
  topic: "news",
  text: "Notification Message",
};

sendMessageToQueue(queueName, message);
