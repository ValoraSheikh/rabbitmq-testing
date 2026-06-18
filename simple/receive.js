import { connect } from "amqplib";

async function receive() {
  const connection = await connect("amqp://localhost:5672");
  const channel = await connection.createChannel();

  const queue = "hello";
  await channel.assertQueue(queue, { durable: false });

  console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
  channel.consume(
    queue,
    function (msg) {
      console.log(" [x] Received %s", (msg.content));
      // channel.ack(msg);
    },
    { noAck: true },
  );
}

receive();
