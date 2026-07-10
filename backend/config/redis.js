const { createClient } = require('redis');

let redisClient = null;

const connectRedis = async () => {
  if (!process.env.REDIS_URI) {
    console.log('No REDIS_URI provided. Running without Redis cache.');
    return;
  }

  const url = process.env.REDIS_URI;
  const client = createClient({ url });

  client.on('error', (err) => console.error('Redis Client Error:', err));
  client.on('connect', () => console.log('Redis connected successfully'));
  client.on('reconnecting', () => console.log('Redis reconnecting...'));

  try {
    await client.connect();
    redisClient = client; // Only expose client if connection is successful
  } catch (error) {
    console.error('Failed to connect to Redis:', error.message);
  }
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
