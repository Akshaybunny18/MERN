const { createClient } = require('redis');

let redisClient;

const connectRedis = async () => {
  const url = process.env.REDIS_URI || 'redis://localhost:6379';
  
  redisClient = createClient({ url });

  redisClient.on('error', (err) => console.error('Redis Client Error:', err));
  redisClient.on('connect', () => console.log('Redis connected successfully'));
  redisClient.on('reconnecting', () => console.log('Redis reconnecting...'));

  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error.message);
    // Don't crash the server if Redis fails, just proceed without caching
  }
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
