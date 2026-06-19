import { connect } from "amqplib";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: receive_logs_topic.js <facility>.<severity>");
  process.exit(1);
}

async function main() {
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchange = "topic_logs";

  await channel.assertExchange(exchange, "topic", {
    durable: false,
  });

  const q = await channel.assertQueue("", {
    exclusive: true, // the queue will be deleted when the connection is closed
  });
  console.log(" [*] Waiting for logs. To exit press CTRL+C");

  for (const key of args) {
    await channel.bindQueue(q.queue, exchange, key);
  }

  channel.consume(
    q.queue,
    function (msg) {
      console.log(
        " [x] %s:'%s'",
        msg.fields.routingKey,
        msg.content.toString(),
      );
    },
    {
      noAck: true,
    },
  );
}

main();
