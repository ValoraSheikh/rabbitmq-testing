import { connect } from "amqplib";

async function newTask() {
  const connection = await connect("amqp://localhost:5672");
  const channel = await connection.createChannel();

  const queue = "task_queue";
  const message = process.argv.slice(2).join(" ") || "Hello World!";

  await channel.assertQueue(queue, {
    durable: true,
    arguments: {
      "x-queue-type": "quorum",
    },
  });

  channel.sendToQueue(queue, Buffer.from(message), { persistent: true });

  console.log(` [x] Sent ${message}`);

  setTimeout(function () {
    connection.close();
    process.exit(0);
  }, 500);
}

newTask();
