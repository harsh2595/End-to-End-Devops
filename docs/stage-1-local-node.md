# Stage 1: Local Node.js Development

Stage 1 runs the application services directly with Node.js on the host machine. Redis and RabbitMQ run as Docker containers so the app can use real queue and cache dependencies without containerizing every service yet.

## Goal

- Run each app service locally.
- Use Docker only for Redis and RabbitMQ.
- Confirm that login, order submission, and queue processing work end to end.

## Services

| Service | Runtime | URL or port |
| --- | --- | --- |
| Frontend | Local Node.js / Next.js | `http://localhost:3000` |
| API gateway | Local Node.js | `http://localhost:5000` |
| Auth service | Local Node.js | `http://localhost:4000` |
| Orders service | Local Node.js | `http://localhost:7000` |
| Order consumer | Local Node.js | No public port |
| Redis | Docker Compose | `redis://localhost:6379` |
| RabbitMQ | Docker Compose | `amqp://localhost:5672` |
| RabbitMQ UI | Docker Compose | `http://localhost:15672` |

## Prerequisites

- Node.js installed.
- Docker and Docker Compose installed.
- Dependencies installed for each Node service.

Install dependencies once if needed:

```bash
cd services/auth-service && npm ci
cd ../api-gateway && npm ci
cd ../orders-service && npm ci
cd ../messaging && npm ci
cd ../frontend && npm ci
cd ../..
```

## 1. Start Dependencies

Run from the project root:

```bash
docker compose up -d redis rabbitmq
```

Check that both containers are healthy:

```bash
docker compose ps
```

## 2. Start App Services

Open a separate terminal for each service.

### Auth Service

```bash
cd services/auth-service
PORT=4000 JWT_SECRET=secret REDIS_URL=redis://localhost:6379 node src/index.js
```

### Orders Service

```bash
cd services/orders-service
PORT=7000 RABBITMQ_URL=amqp://localhost node src/index.js
```

### Order Consumer

```bash
cd services/orders-service
RABBITMQ_URL=amqp://localhost node src/queue/consumer.js
```

### API Gateway

```bash
cd services/api-gateway
PORT=5000 JWT_SECRET=secret ORDER_SERVICE_URL=http://localhost:7000 node src/index.js
```

### Frontend

```bash
cd services/frontend
PORT=3000 GATEWAY_SERVICE_URL=http://localhost:5000 AUTH_SERVICE_URL=http://localhost:4000 ORDERS_SERVICE_URL=http://localhost:7000 npm run dev
```

## 3. Verify

Open the frontend:

```text
http://localhost:3000
```

Run the smoke test from the project root:

```bash
VERIFY_QUEUE_LOGS=false ./smoke-test.sh
```

For Stage 1, check the order consumer terminal manually and confirm it logs the submitted order.

Useful direct checks:

```bash
curl http://localhost:4000/health
curl http://localhost:5000/health
curl http://localhost:7000/health
```

## 4. Shutdown

Stop all local Node.js processes with `Ctrl+C` in their terminals.

Then stop Redis and RabbitMQ:

```bash
docker compose down
```

Confirm no Stage 1 containers remain:

```bash
docker compose ps
```

## Completion Checklist

- Redis and RabbitMQ start successfully.
- Frontend opens on port `3000`.
- Auth service returns a token from `/login`.
- API gateway forwards order requests to the orders service.
- Orders service publishes the order to RabbitMQ.
- Order consumer receives and logs the order.
- Smoke test passes with `VERIFY_QUEUE_LOGS=false`.
