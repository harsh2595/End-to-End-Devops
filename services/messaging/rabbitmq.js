const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const MAX_RETRIES = Number(process.env.RABBITMQ_MAX_RETRIES || 10);
const RETRY_DELAY_MS = Number(process.env.RABBITMQ_RETRY_DELAY_MS || 3000);

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectQueue() {
    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
        try {
            const connection = await amqp.connect(RABBITMQ_URL);
            const channel = await connection.createChannel();
            return channel;
        } catch (error) {
            lastError = error;
            console.error(
                `❌ RabbitMQ connection attempt ${attempt}/${MAX_RETRIES} failed:`,
                error.message
            );

            if (attempt < MAX_RETRIES) {
                await wait(RETRY_DELAY_MS);
            }
        }
    }

    throw lastError;
}

module.exports = { connectQueue };
