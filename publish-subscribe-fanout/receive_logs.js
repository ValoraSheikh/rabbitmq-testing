import { connect } from "amqplib";

async function receiveLogs() {
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchange = "logs";
  await channel.assertExchange(exchange, "fanout", { durable: false });

  const q = await channel.assertQueue("", { exclusive: true });
  await channel.bindQueue(q.queue, exchange, "");

  console.log(` [x] Waiting for messages in ${q.queue}`);

  channel.consume(
    q.queue,
    (msg) => {
      console.log(" [x] %s", msg.content.toString());
    },
    { noAck: true },
  );
}

receiveLogs();
