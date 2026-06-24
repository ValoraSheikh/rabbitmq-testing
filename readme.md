# 🐇 RabbitMQ — Learning Journey

A hands-on exploration of **RabbitMQ messaging patterns** using **Node.js** and **amqplib**. Each directory demonstrates a progressively advanced pattern, from a simple queue to RPC.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://docker.com/)

### Start RabbitMQ

```bash
docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4.2-alpine
```

| Port | Purpose |
|------|---------|
| `5672` | AMQP (messaging) |
| `15672` | Management UI (guest/guest) |

> **Tip:** Run this in a separate terminal — it stays running while you test the patterns below.

### Install Dependencies

```bash
npm install
```

---

## 📦 Patterns Overview

### 1. Hello World — Simple Queue

The most basic setup: one producer, one queue, one consumer.

```
┌──────────┐     ┌───────┐     ┌───────────┐
│  send.js │ ──→ │ hello │ ──→ │ receive.js│
│(Producer)│     │ Queue │     │(Consumer) │
└──────────┘     └──────┘     └───────────┘
```

```bash
node hello/receive.js      # Terminal 1 — start consumer
node hello/send.js         # Terminal 2 — send a message
```

**Key takeaway:** Queue is **non-durable**, consumer uses **auto-ack**.

---

### 2. Work Queue — Fair Task Distribution

Distributes time-consuming tasks across multiple workers using round-robin dispatch.

```
┌────────────┐     ┌────────────┐
│ new_task.js│ ──→ │ task_queue │ ──→ worker.js 1
│ (Producer) │     │ (Quorum)   │ ──→ worker.js 2
└────────────┘     └────────────┘ ──→ worker.js 3
```

```bash
node work_queue/worker.js              # Terminal 1 — start Worker A
node work_queue/worker.js              # Terminal 2 — start Worker B
node work_queue/new_task.js First..... # Terminal 3 — task with 5s duration
node work_queue/new_task.js Second..   # Terminal 3 — task with 2s duration
```

**Key takeaway:** Durable **quorum queue**, **persistent messages**, **manual ACK**, and **prefetch(1)** for fair dispatch.

---

### 3. Fanout Exchange — Publish / Subscribe

Broadcasts every message to **all** consumers. Perfect for notifications, logging, or live feeds.

```
┌──────────┐     ┌──────────────────┐     ┌────────────────┐
│ emit_log │ ──→ │ Exchange: logs   │ ──→ │ Queue (temp 1) │ ──→ receive 1
│(Producer)│     │ (fanout)         │ ──→ │ Queue (temp 2) │ ──→ receive 2
└──────────┘     └──────────────────┘     └────────────────┘
```

```bash
node publish-subscribe-fanout/receive_logs.js  # Terminal 1
node publish-subscribe-fanout/receive_logs.js  # Terminal 2
node publish-subscribe-fanout/emit_log.js "Hi everyone!"  # Terminal 3
```

**Key takeaway:** Routing key is **ignored** in fanout — every bound queue gets every message.

---

### 4. Direct Exchange — Selective Routing

Routes messages to queues whose **binding key** exactly matches the message's **routing key**.

```
┌────────────────┐     ┌──────────────────┐     ┌────────────────┐
│ emit_log_direct│ ──→ │ Exchange: direct │ ──→ │ "info" queue   │
│  (Producer)    │     │   _logs (direct)  │ ──→ │ "white" queue  │
└────────────────┘     └──────────────────┘     └────────────────┘
```

```bash
node public-subscribe-direct/receive_logs_direct.js info    # Terminal 1 — listens for "info"
node public-subscribe-direct/receive.js white               # Terminal 2 — listens for "white"
node public-subscribe-direct/emit_log_direct.js error "Oops!" # Terminal 3
```

**Key takeaway:** Only queues with a **matching binding key** receive the message. Messages with unmatched keys are **lost**.

---

### 5. Topic Exchange — Pattern‑based Routing

Routes messages using wildcard patterns (`*` = one word, `#` = zero or more words).

```
         ┌──────────────────┐
         │  Exchange: topic │
         │    _logs (topic) │
         └────────┬─────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
   "kern.*"           "*.critical"
        │                    │
   kernel msgs          critical msgs
```

```bash
node publish-subscribe-topic/receive_logs_topic.js "kern.*" "*.critical"  # Terminal 1
node publish-subscribe-topic/emit_log_topic.js "kern.critical" "Kernel panic!"  # Terminal 2
```

**Key takeaway:** `*` matches exactly **one** word (dot-separated), `#` matches **zero or more** words.

---

### 6. RPC — Remote Procedure Call

Requests a remote computation (Fibonacci) and waits for a response — all over RabbitMQ.

```
┌────────────┐     ┌──────────┐     ┌────────────┐
│ rpc_client │ ──→ │ rpc_queue│ ──→ │ rpc_server │
│ (Producer) │     │ (Quorum) │     │ (Consumer) │
└──────┬─────┘     └──────────┘     └──────┬─────┘
       │  correlationId + replyTo          │
       └───────────────────────────────────┘
         Direct Reply-to (amq.rabbitmq.reply-to)
```

```bash
node rpc/rpc_server.js              # Terminal 1 — start RPC server
node rpc/rpc_client.js 10           # Terminal 2 — request fib(10)
node rpc/rpc_client.js 20           # Terminal 2 — request fib(20)
```

**Key takeaway:** Uses `correlationId` to match requests to responses and RabbitMQ's **Direct Reply-to** (`amq.rabbitmq.reply-to`) instead of declaring a callback queue.

---

## 🧠 Concepts Learned

| Concept | Pattern | Description |
|---------|---------|-------------|
| Producer | All | Sends messages to an exchange or queue |
| Consumer | All | Receives and processes messages |
| Queue | Hello, Work Queue | Named message buffer |
| Exchange | Fanout, Direct, Topic | Routes messages to queues |
| Binding | Fanout, Direct, Topic | Links a queue to an exchange |
| Routing Key | Direct, Topic | Determines which queue gets a message |
| ACK | Work Queue, RPC | Confirms message was processed |
| Prefetch | Work Queue, RPC | Limits unacked messages per consumer |
| Durability | Work Queue, RPC | Queue/message survives broker restart |
| Quorum Queue | Work Queue, RPC | Replicated, highly-available queue type |
| Correlation ID | RPC | Matches requests to responses |
| Direct Reply-to | RPC | RabbitMQ built-in reply mechanism |

---

## 🗺️ Learning Progression

```
Hello World   ──→   Work Queue   ──→   Fanout  ──→   Direct  ──→   Topic  ──→   RPC
(simple)        (distribution)       (broadcast)   (routing)    (patterns)   (request/reply)
```

Each pattern builds on the previous, introducing **one or two new RabbitMQ concepts** at a time.

---

## 🛠 Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Broker:** RabbitMQ (via Docker)
- **Client:** [amqplib](https://www.npmjs.com/package/amqplib) ^2.0.1

---

## 📁 Project Structure

```
rabbitmq/
├── hello/                          # Pattern 1: Simple Queue
│   ├── send.js
│   └── receive.js
├── work_queue/                     # Pattern 2: Work Queue
│   ├── new_task.js
│   └── worker.js
├── publish-subscribe-fanout/       # Pattern 3: Fanout Exchange
│   ├── emit_log.js
│   └── receive_logs.js
├── public-subscribe-direct/        # Pattern 4: Direct Exchange
│   ├── emit_log_direct.js
│   ├── receive_logs_direct.js
│   └── receive.js
├── publish-subscribe-topic/        # Pattern 5: Topic Exchange
│   ├── emit_log_topic.js
│   └── receive_logs_topic.js
├── rpc/                            # Pattern 6: RPC
│   ├── rpc_client.js
│   └── rpc_server.js
├── package.json
└── readme.md
```
