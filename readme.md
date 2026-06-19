# 🐇 RabbitMQ Learning Journey

This repository contains my RabbitMQ learning notes and practical implementations using **Node.js** and **amqplib**.

The goal of this repository is to understand how message brokers work and how RabbitMQ helps build asynchronous, reliable, and scalable backend systems.

---

## Why RabbitMQ?

In normal backend systems:

```
Client
  |
  ↓
API Server
  |
  ↓
Database / External Services
```

The API often performs everything synchronously:

- Generate invoices
- Send emails
- Process heavy jobs
- Run background tasks

RabbitMQ helps move these operations into background workers:

```
API Server (Producer)

        ↓

     RabbitMQ

        ↓

 Workers / Consumers
```

This improves:

- API response time
- System scalability
- Fault tolerance

---

# Topics Covered

## 1. Hello World Queue

Basic Producer → Queue → Consumer flow.

Architecture:

```
Producer

   ↓

 Queue

   ↓

Consumer
```

Concepts learned:

- Creating RabbitMQ connection
- Creating channels
- Queue declaration
- Sending messages
- Receiving messages

Implemented:

- `send.js`
- `receive.js`

---

# 2. Work Queues

Used for distributing time-consuming tasks among multiple workers.

Architecture:

```
             Producer

                 ↓

              Queue

        /         \

   Worker 1     Worker 2
```

Concepts learned:

- Multiple consumers
- Task distribution
- Round-robin dispatch
- Background job processing

Example:

```
Task 1 → Worker 1
Task 2 → Worker 2
Task 3 → Worker 1
```

---

# 3. Message Acknowledgement (ACK)

Ensuring messages are not lost when workers fail.

Without ACK:

```
Worker receives message

       ↓

Worker crashes ❌

       ↓

Message lost
```

With ACK:

```
Worker receives message

       ↓

Process completed

       ↓

channel.ack(message)

       ↓

RabbitMQ removes message
```

Concepts:

- noAck
- Manual acknowledgement
- Message reliability

---

# 4. Durable Queues & Persistent Messages

Making queues and messages survive RabbitMQ restarts.

Queue durability:

```javascript
channel.assertQueue("task_queue", {
  durable:true
});
```

Message persistence:

```javascript
channel.sendToQueue(
 queue,
 Buffer.from(message),
 {
   persistent:true
 }
);
```

Concepts:

- Durable queues
- Persistent messages
- Reliable delivery

---

# 5. Fair Dispatch

Preventing one worker from getting overloaded.

Implemented using:

```javascript
channel.prefetch(1);
```

Before:

```
Worker 1
Task 1
Task 3
Task 5


Worker 2
Task 2
Task 4
```

After:

RabbitMQ sends new work only when a worker finishes previous work.

Concepts:

- Worker load balancing
- Prefetch count
- Unacknowledged messages

---

# 6. Exchanges

Instead of sending directly to queues:

```
Producer

   ↓

Exchange

   ↓

Queue

   ↓

Consumer
```

Exchange decides where messages should go.

Learned exchange types:

- Fanout Exchange
- Direct Exchange

---

# 7. Fanout Exchange (Publish / Subscribe)

Broadcast one message to multiple consumers.

Architecture:

```
             Producer

                 ↓

              Exchange

          /       |       \

      Queue1   Queue2   Queue3

        ↓        ↓        ↓

    Consumer Consumer Consumer
```

Concepts:

- Publish / Subscribe pattern
- Broadcasting messages
- Temporary queues
- Queue bindings

Used for:

- Notifications
- Logging systems
- Event broadcasting

---

# 8. Direct Exchange

Routing messages using routing keys.

Architecture:

```
Producer

   ↓
   
Exchange

   ↓ routing key match

Queue

   ↓

Consumer
```

Example:

Producer:

```
routingKey = "error"
```

Bindings:

```
info_queue  -> info

error_queue -> error
```

Only matching queues receive messages.

Concepts:

- Routing keys
- Binding keys
- Selective message routing

---

# RabbitMQ Concepts Learned

✔ Producer  
✔ Consumer  
✔ Worker  
✔ Queue  
✔ Channel  
✔ Exchange  
✔ Binding  
✔ Routing Key  
✔ Work Queue Pattern  
✔ Publish/Subscribe Pattern  
✔ Fanout Exchange  
✔ Direct Exchange  
✔ Message Acknowledgement  
✔ Durable Queue  
✔ Persistent Message  
✔ Fair Dispatch  
✔ Prefetch  

---

# Tech Stack

- Node.js
- RabbitMQ
- amqplib
- Docker

---

# Future Topics

Things I plan to explore:

- Topic Exchange
- Dead Letter Queue (DLQ)
- Retry Pattern
- Delayed Messages
- RabbitMQ with Microservices
- Production RabbitMQ Patterns

---

## Goal

Understand how real-world backend systems use messaging patterns to build scalable event-driven architectures.