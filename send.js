import { connect } from "amqplib";

async function send() {
  const connection = await connect("amqp://localhost:5672");
  const channel = await connection.createChannel();

  const queue = "hello";
  const message = { text: "Hello World!", desc: "This is a test message for first time" };

  await channel.assertQueue(queue, { durable: false });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)))

  console.log(" [x] Sent '%s'", message);
  
  // await channel.close();
  // await connection.close();
}

send();
