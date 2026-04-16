const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// login route
app.post("/login", (req, res) => {
    const { username } = req.body;

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
});

app.get("/health", (req, res) => res.send("Auth Service OK"));

app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
