import { publishOrder } from "../../../../backend/producer/orderProducer";

export async function POST(req) {
    const body = await req.json();

    await publishOrder(body);

    return Response.json({
        message: "Order sent to queue 🚀",
        data: body,
    });
}