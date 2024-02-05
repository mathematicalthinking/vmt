const redisClient = require('./redisClient');

const redisUserKey = (userId) => `userSockets:${userId}`;
const redisActivityKey = (userId) => `userActivity:${userId}`;

function clearStaleSocketEntries() {
  clearStaleSocketEntriesHelper(redisUserKey('*'));
  clearStaleSocketEntriesHelper(redisActivityKey('*'));
}

async function clearStaleSocketEntriesHelper(pattern) {
  try {
    const keys = await redisClient.keys(pattern);
    console.log(`stale entries of ${pattern} are ${keys}`);
    const deletePromises = keys.map((key) => redisClient.del(key));
    await Promise.all(deletePromises);
  } catch (err) {
    console.error(`Error clearing stale socket entries ${pattern} ${err}`);
  }
}

module.exports = {
  clearStaleSocketEntries,
  redisUserKey,
  redisActivityKey,
  redisClient,
};
