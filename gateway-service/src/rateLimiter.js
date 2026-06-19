require("dotenv").config()

const redis = require("redis");
const client = redis.createClient({
    url: process.env.REDIS_URL,
});

client.connect().catch(console.error);

const RATE_LIMIT = Number(process.env.RATE_LIMIT || 10);
const WINDOW_SECONDS = Number(process.env.WINDOW_SECONDS || 60);

module.exports = async function rateLimiter(req, res, next) {

    try {
        const clientId = req.headers["x-api-key"] || req.ip;
        const key = `rate-limit: ${clientId}`

        const requests = await client.incr(key);

        if(requests === 1){
            await client.expire(key, WINDOW_SECONDS);
        }

        const ttl = await client.ttl(key)

        res.setHeader("X-RateLimit-Limit", RATE_LIMIT)
        res.setHeader("X-RateLimit-Remaining", Math.max(RATE_LIMIT-requests, 0))
        res.setHeader("X-RateLimit-Reset", ttl)

        if(requests > RATE_LIMIT){
            return res.status(429).json({
                error: "Too Many Requets",
                retryAfter: ttl
            })
        }
        next();
    } catch (error) {
        console.error("Rate Limiter error ; ", error)
        return res.status(500).json({error: "Rate Limiter failed"})
    }

}
