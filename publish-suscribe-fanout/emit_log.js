import { connect } from "amqplib";

async function send() {
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchange = "logs";
  const msg = process.argv.slice(2).join(" ") || "Hello World!";

  await channel.assertExchange(exchange, "fanout", { durable: false }); // Fanout exchange means all messages are broadcast to all queues bound to it
  
  channel.publish(exchange, "", Buffer.from(msg)); // Empty string is here telling the we don't need to route the message to a specific queue

  console.log(` [x] Sent ${msg}`);
}

send();
