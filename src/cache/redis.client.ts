import Redis from "ioredis";

class RedisClient {
  private static instance: Redis | null = null;
  private static enabled: boolean = process.env.REDIS_ENABLED === "true";
  private static failureCount = 0;
  private static readonly MAX_FAILURES = 5;

  static getInstance(): Redis | null {
    if (!this.enabled) return null;

    if (!this.instance) {
      this.instance = new Redis({
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: Number(process.env.REDIS_DB) || 0,
        retryStrategy: (times) => {
          if (times > 3) {
            console.error("Redis retry limit exceeded");
            return null;
          }
          return Math.min(times * 50, 2000);
        },
        lazyConnect: true,
        maxRetriesPerRequest: 3,
      });

      this.instance.on("error", (err) => {
        console.error("Redis error:", err);
        this.recordFailure();
      });

      this.instance.on("connect", () => {
        console.log("Redis connected successfully");
        this.recordSuccess();
      });

      this.instance.on("ready", () => {
        console.log("Redis ready to accept commands");
      });
    }

    return this.instance;
  }

  static async disconnect(): Promise<void> {
    if (this.instance) {
      await this.instance.quit();
      this.instance = null;
    }
  }

  static isEnabled(): boolean {
    return this.enabled;
  }

  private static recordFailure() {
    this.failureCount++;
    if (this.failureCount >= this.MAX_FAILURES) {
      console.error("Redis circuit breaker opened - too many failures");
      this.enabled = false;
    }
  }

  private static recordSuccess() {
    this.failureCount = Math.max(0, this.failureCount - 1);
  }
}

export default RedisClient;
