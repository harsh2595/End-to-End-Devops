FROM node:20-alpine

WORKDIR /app

COPY services/api-gateway/package*.json ./
RUN npm ci --omit=dev

COPY services/api-gateway/src ./src

EXPOSE 5000

CMD ["node", "src/index.js"]
