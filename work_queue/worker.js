import { connect } from "amqplib";

async function worker() {
  const connection = await connect("amqp://localhost:5672");
  const channel = await connection.createChannel();

  const queue = "task_queue";
  await channel.assertQueue(queue, {
    durable: true,
    arguments: {
      "x-queue-type": "quorum",
    },
  });

  // declaring the queue in received file is helpful for when I start the consumer script first and need to ensure the queue exists before consuming messages
  

  console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
  channel.prefetch(1);
  channel.consume(
    queue,
    function (msg) {
      const secs = msg.content.toString().split(".").length - 1;

      console.log(" [x] Received %s", msg.content.toString());
      console.log(" [x] Will take %s seconds", secs);

      setTimeout(function () {
        console.log("[x] Done");
        channel.ack(msg);
      }, secs * 1000);
    },
    { noAck: false },
  );
}

worker();
