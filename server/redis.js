const redisClient = require('./redisClient');

const redisActivityKey = (userId) => `userActivity:${userId}`;

function clearStaleSocketEntries() {
  clearStaleSocketEntriesHelper(redisActivityKey('*'));
}

async function clearStaleSocketEntriesHelper(pattern) {
  try {
    const keys = await redisClient.keys(pattern);
    const deletePromises = keys.map((key) => redisClient.del(key));
    await Promise.all(deletePromises);
  } catch (err) {
    console.error(`Error clearing stale socket entries ${pattern} ${err}`);
  }
}

module.exports = {
  clearStaleSocketEntries,
  redisActivityKey,
  redisClient,
};
