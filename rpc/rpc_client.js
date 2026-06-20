import { connect } from "amqplib";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: rpc_client.js num");
  process.exit(1);
}

async function main() {
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();

  const correlationId = generateUuid();
  const num = parseInt(args[0]);

  console.log(" [x] Requesting fib(%d)", num);

  const result = await new Promise((resolve) => {
    // Consume from the Direct Reply-to pseudo-queue (automatic acknowledgement mode is mandatory)
    channel.consume(
      "amq.rabbitmq.reply-to",
      (msg) => {
        if (msg.properties.correlationId === correlationId) {
          resolve(msg.content.toString());
        }
      },
      { noAck: true },
    );

    channel.sendToQueue("rpc_queue", Buffer.from(num.toString()), {
      correlationId: correlationId, // this is used to correlate the request with the reply, server will use this to send the reply back to the client
      replyTo: "amq.rabbitmq.reply-to", // this is the pseudo-queue name used for direct replies
    });
  });

  console.log(" [.] Got %s", result);
  await connection.close();
}

function generateUuid() {
  return (
    Math.random().toString() +
    Math.random().toString() +
    Math.random().toString()
  );
}

main();
