const Redis = require('ioredis');

const redisClient = new Redis(process.env.PUB_CLIENT_URL);

redisClient.on('connect', () => console.log('Connected to Redis'));
redisClient.on('error', (err) => console.error('Redis Client Error', err));

module.exports = redisClient;
