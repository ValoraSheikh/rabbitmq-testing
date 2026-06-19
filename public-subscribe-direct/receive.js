import { connect } from "amqplib";

async function receiveLogs() {
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchange = "direct_logs";
  await channel.assertExchange(exchange, "direct", { durable: false });

  const q = await channel.assertQueue("", { exclusive: true });
  
  const routingKey = process.argv[2] || "white";
  await channel.bindQueue(q.queue, exchange, routingKey);

  console.log(` [x] Waiting for messages in ${q.queue} with routing key ${routingKey}`);

  channel.consume(
    q.queue,
    (msg) => {
      console.log(" [x] %s", msg.content.toString());
    },
    { noAck: true },
  );
}

receiveLogs();
