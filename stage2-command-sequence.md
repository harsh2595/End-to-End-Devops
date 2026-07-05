# Stage 2 Command Sequence

Stage 2 runs the full application as Docker containers. All services run inside Docker Compose, including Redis and RabbitMQ.

## 1. Start Stage 2

Run this from the project root:

```bash
docker compose up --build
```

What starts:

- frontend
- api-gateway
- auth-service
- orders-service
- order-consumer
- redis
- rabbitmq

## 2. Verify Stage 2

Open the frontend:

```text
http://localhost:3000
```

Run the smoke test from the project root:

```bash
./smoke-test.sh
```

The smoke test checks:

- frontend
- API gateway
- auth service
- orders service
- login flow
- order submission through the gateway
- queue processing in the `order-consumer` logs

You can override the test values if needed:

```bash
TEST_USER=harsh TEST_ITEM=my-order TEST_QUANTITY=2 ./smoke-test.sh
```

If you only want the HTTP checks:

```bash
VERIFY_QUEUE_LOGS=false ./smoke-test.sh
```

## 3. Shut Down Stage 2

Before moving on to Stage 3, stop the full Docker stack:

```bash
docker compose down
```

Confirm no containers remain:

```bash
docker compose ps
```

## 4. Launch Stage 3

Only after Stage 2 is stopped, move to the Terraform workflow in Stage 3.

