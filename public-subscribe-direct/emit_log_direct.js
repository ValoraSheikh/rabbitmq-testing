import { connect } from "amqplib";

async function send() {
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchange = "direct_logs";
  const msg = process.argv.slice(2).join(" ") || "Hello World!";

  await channel.assertExchange(exchange, "direct", { durable: false }); // Direct exchange means messages are routed to queues based on the routing key
  
  const routingKey = process.argv[2] || "info";
  
  channel.publish(exchange, routingKey, Buffer.from(msg)); // Empty string is here telling the we don't need to route the message to a specific queue

  channel.publish(exchange, 'white', Buffer.from('Wall is White'))

  console.log(` [x] Sent ${msg} with routing key ${routingKey}`);
}

send();
