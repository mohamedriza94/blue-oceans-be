import { createClient } from "redis";
import { envData } from "../constants/env-data";

const redisClient = createClient({
  password: envData.redis.password,
  socket: {
    host: envData.redis.host,
    port: Number(envData.redis.port) || 6379,
  },
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Redis connected");
  } catch (err) {
    console.error("Redis connection error:", err);
  }
};

export { redisClient, connectRedis };
