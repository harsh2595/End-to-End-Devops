const express = require("express");
const { publishOrder } = require("./queue/producer");

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 7000;

app.post("/order", async (req, res) => {
    const order = req.body;

    await publishOrder(order);

    res.json({
        message: "Order received and queued",
    });
});

app.get("/health", (req, res) => res.send("Orders Service OK"));

app.listen(PORT, () => console.log(`Orders Service running on port ${PORT}`));
