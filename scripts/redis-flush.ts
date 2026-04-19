import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
});

redis
  .flushdb()
  .then(() => {
    console.log("Redis database flushed successfully");
    redis.quit();
  })
  .catch((err) => {
    console.error("Error flushing Redis:", err);
    redis.quit();
    process.exit(1);
  });
