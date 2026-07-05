const express = require("express");
const cors = require("cors");
const rateLimiter = require("./middleware/rateLimiter");
const verifyToken = require("./middleware/auth");

// ✅ IMPORTANT: Add this if using Node < 18
const axios = require("axios");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// ✅ Environment-based service URL
const ORDER_SERVICE_URL =
    process.env.ORDER_SERVICE_URL || "http://localhost:7000";

// -----------------------------------
// ✅ Health Check
// -----------------------------------
app.get("/health", (req, res) => {
    res.json({ status: "API Gateway Healthy 🚀" });
});

app.get("/api/health", (req, res) => {
    res.json({ status: "API Gateway Healthy 🚀" });
});

// -----------------------------------
// ✅ Root Route
// -----------------------------------
app.get("/", (req, res) => {
    res.json({
        service: "API Gateway",
        status: "Running",
        health: "/health",
        order: "/order",
        protected: "/protected",
    });
});

app.get("/api", (req, res) => {
    res.json({
        service: "API Gateway",
        status: "Running",
        health: "/api/health",
        order: "/api/order",
        protected: "/api/protected",
    });
});

// -----------------------------------
// ✅ Protected Route Example
// -----------------------------------
app.get("/protected", verifyToken, (req, res) => {
    res.json({
        message: "Protected data ✅",
        user: req.user || "Authorized",
    });
});

app.get("/api/protected", verifyToken, (req, res) => {
    res.json({
        message: "Protected data ✅",
        user: req.user || "Authorized",
    });
});

// -----------------------------------
// ✅ Order Route (Gateway → Orders Service)
// -----------------------------------
app.post("/order", async (req, res) => {
    try {
        console.log("👉 Sending request to Orders Service...");
        console.log("👉 URL:", `${ORDER_SERVICE_URL}/order`);
        console.log("👉 Body:", req.body);

        const response = await axios.post(
            `${ORDER_SERVICE_URL}/order`,
            req.body,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: req.headers.authorization || "",
                },
            }
        );

        console.log("👉 Response status:", response.status);
        console.log("👉 Response data:", response.data);

        res.status(response.status).json(response.data);

    } catch (error) {
        console.error("❌ Gateway Error FULL:", error.message);

        // 🔥 Important: log deeper error
        if (error.response) {
            console.error("❌ Response error:", error.response.data);
        }

        res.status(500).json({
            error: "Orders service unavailable",
        });
    }
});

app.post("/api/order", async (req, res) => {
    try {
        console.log("👉 Sending request to Orders Service...");
        console.log("👉 URL:", `${ORDER_SERVICE_URL}/order`);
        console.log("👉 Body:", req.body);

        const response = await axios.post(
            `${ORDER_SERVICE_URL}/order`,
            req.body,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: req.headers.authorization || "",
                },
            }
        );

        console.log("👉 Response status:", response.status);
        console.log("👉 Response data:", response.data);

        res.status(response.status).json(response.data);

    } catch (error) {
        console.error("❌ Gateway Error FULL:", error.message);

        if (error.response) {
            console.error("❌ Response error:", error.response.data);
        }

        res.status(500).json({
            error: "Orders service unavailable",
        });
    }
});

// -----------------------------------
// ❌ Fallback Route
// -----------------------------------
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found",
    });
});

// -----------------------------------
// 🚀 Start Server
// -----------------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
});
