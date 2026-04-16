const { connectQueue } = require("../../../messaging/rabbitmq");

async function consumeOrders() {
    try {
        const channel = await connectQueue();

        // durable queue (IMPORTANT)
        await channel.assertQueue("orders", { durable: true });

        console.log("🟢 Waiting for messages in 'orders' queue...");

        channel.consume("orders", (msg) => {
            if (msg !== null) {
                try {
                    const order = JSON.parse(msg.content.toString());

                    console.log("📦 Processing order:", order);

                    // simulate processing
                    // (later: DB insert, payment, etc.)

                    channel.ack(msg); // acknowledge success
                } catch (err) {
                    console.error("❌ Error processing order:", err);

                    // optional: requeue or discard
                    channel.nack(msg, false, false);
                }
            }
        });
    } catch (error) {
        console.error("❌ RabbitMQ connection failed:", error);
    }
}

consumeOrders();