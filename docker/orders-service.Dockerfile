FROM node:20-alpine

WORKDIR /app/services/orders-service

COPY services/orders-service/package*.json ./
RUN npm ci --omit=dev

WORKDIR /app/services/messaging
COPY services/messaging/package*.json ./
RUN npm ci --omit=dev

WORKDIR /app/services/orders-service
COPY services/orders-service/src ./src
COPY services/messaging /app/services/messaging

EXPOSE 7000

CMD ["node", "src/index.js"]
