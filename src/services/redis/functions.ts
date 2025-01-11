import { redisClient } from "../../configurations/redis";

// ================================================================================================

export const SetDataInRedis = async (
  key: string,
  data: any,
  ttlInMinutes: number = 0
) => {
  try {
    const serializedData =
      typeof data === "string" ? data : JSON.stringify(data);

    const ttlInSeconds = ttlInMinutes * 60;

    await redisClient.set(
      key,
      serializedData,
      ttlInSeconds ? { EX: ttlInSeconds } : undefined
    );

    console.log(`Data stored under key: ${key}`);
  } catch (err) {
    console.error("Error storing data in Redis:", err);
  }
};

// ================================================================================================

export const GetDataFromRedis = async (key: string): Promise<any | null> => {
  try {
    const data = await redisClient.get(key);

    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    }

    return null;
  } catch (err) {
    console.error("Error retrieving data from Redis:", err);
    return null;
  }
};

// ================================================================================================

export const DeleteDataFromRedis = async (keys: string[]): Promise<boolean> => {
  try {
    const result = await redisClient.del(keys);
    return result > 0;
  } catch (err) {
    console.error("Error deleting data from Redis:", err);
    return false;
  }
};

// ================================================================================================

export const IsKeyInRedis = async (key: string): Promise<boolean> => {
  try {
    const result = await redisClient.exists(key);
    return result === 1;
  } catch (err) {
    console.error("Error checking key existence in Redis:", err);
    return false;
  }
};

// ================================================================================================

export const ClearEntireRedisCache = async (): Promise<boolean> => {
  try {
    await redisClient.flushAll();
    console.log("Redis cache cleared.");
    return true;
  } catch (err) {
    console.error("Error clearing Redis cache:", err);
    return false;
  }
};

// ================================================================================================

export const MatchAndGetKeysFromRedis = async (
  pattern: string = "*"
): Promise<string[]> => {
  const keys: string[] = [];
  let cursor: number = 0;

  do {
    const { cursor: nextCursor, keys: matchingKeys } = await redisClient.scan(
      cursor,
      {
        MATCH: pattern,
        COUNT: 100,
      }
    );
    cursor = nextCursor;
    keys.push(...matchingKeys);
  } while (cursor !== 0);

  return keys;
};

// ================================================================================================

export const MatchAndDeleteKeysFromRedis = async (
  prefixes: string[]
): Promise<boolean> => {
  try {
    const allKeysToDelete: string[] = [];

    for (const prefix of prefixes) {
      const matchingKeys = await MatchAndGetKeysFromRedis(`${prefix}*`);
      allKeysToDelete.push(...matchingKeys);
    }

    if (allKeysToDelete.length > 0) {
      const result = await DeleteDataFromRedis(allKeysToDelete);
      return result;
    }

    return false;
  } catch (err) {
    console.error("Error matching and deleting keys from Redis:", err);
    return false;
  }
};
