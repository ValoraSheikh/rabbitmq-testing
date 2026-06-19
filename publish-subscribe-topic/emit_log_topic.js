import { connect } from "amqplib";

async function main() {
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchange = "topic_logs";
  const args = process.argv.slice(2);
  const routingKey = args.length > 0 ? args[0] : "anonymous.info";
  const msg = args.slice(1).join(" ") || "Hello World!, I am Aman";

  await channel.assertExchange(exchange, "topic", {
    durable: false,
  });
  channel.publish(exchange, routingKey, Buffer.from(msg));
  console.log(" [x] Sent %s: '%s'", routingKey, msg);

  setTimeout(function () {
    connection.close();
    process.exit(0); // 0 will not show any error message, 1 will show an error message in here
  }, 500);
}

main();
