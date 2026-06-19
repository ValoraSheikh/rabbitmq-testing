import { connect } from "amqplib";

async function receiveLogs() {
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchange = "direct_logs";
  await channel.assertExchange(exchange, "direct", { durable: false });

  const q = await channel.assertQueue("", { exclusive: true });
  
  const bindingKey = process.argv[2] || "info";
  await channel.bindQueue(q.queue, exchange, bindingKey);

  console.log(` [x] Waiting for messages in ${q.queue} with binding key ${bindingKey}`);

  channel.consume(
    q.queue,
    (msg) => {
      console.log(" [x] %s", msg.content.toString());
    },
    { noAck: true },
  );
}

receiveLogs();
