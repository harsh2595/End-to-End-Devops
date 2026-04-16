const { connectQueue } = require("../../../messaging/rabbitmq");

async function publishOrder(order) {
    const channel = await connectQueue();

    await channel.assertQueue("orders");

    channel.sendToQueue("orders", Buffer.from(JSON.stringify(order)));
}

module.exports = { publishOrder };