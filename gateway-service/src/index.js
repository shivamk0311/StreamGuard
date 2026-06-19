const express = require("express");
const rateLimiter = require("./rateLimiter");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({"status":"ok", "name": "gateway-service"})
})

app.get("/api/data", rateLimiter, (req, res) => {
    res.json({"message" : "Request Allowed"})
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Service running on PORT: ${PORT}`);
});