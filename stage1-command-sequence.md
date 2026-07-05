# Stage 1 Command Sequence

Stage 1 runs the app services locally with Node.js and uses Docker container only for Redis and RabbitMQ.

## 1. Start Stage 1 Dependencies

Run this from the project root:

```bash
docker compose up -d redis rabbitmq
```

Check that both containers are healthy:

```bash
docker compose ps
```

## 2. Start Stage 1 Services

Open separate terminals for each service.

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

## 3. Verify Stage 1

Open the frontend:

```text
http://localhost:3000
```

Run the smoke test from the project root:

```bash
VERIFY_QUEUE_LOGS=false ./smoke-test.sh
```

For Stage 1, confirm queue processing by checking the order consumer terminal output.

## 4. Shut Down Stage 1

Before launching Stage 2, Stage 1 must be shut down because both stages use the same local ports:

- frontend: `3000`
- auth service: `4000`
- API gateway: `5000`
- orders service: `7000`
- Redis: `6379`
- RabbitMQ: `5672` and `15672`

Stop the local Node.js and frontend processes with `Ctrl+C` in each service terminal.

Then stop Redis and RabbitMQ:

```bash
docker compose down
```

Confirm no Stage 1 containers remain:

```bash
docker compose ps
```

## 5. Launch Stage 2

Only after Stage 1 is stopped, launch the fully containerized Stage 2 stack:

```bash
docker compose up --build
```

In Stage 2, all services run as containers:

- frontend
- api-gateway
- auth-service
- orders-service
- order-consumer
- redis
- rabbitmq

Verify Stage 2:

```bash
./smoke-test.sh
```
