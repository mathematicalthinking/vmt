const mongoose = require('mongoose');
const data = require('./index');

const dbURI = `mongodb://localhost:27017/vmt-test`;

const clearDB = () => {
  return mongoose
    .connect(dbURI, { useNewUrlParser: true })
    .then(() => mongoose.connection.db.dropDatabase());
};

const seedCollection = (db, collectionName, data) => {
  return db.collection(collectionName).insertMany(data);
};
const seed = async (collections = Object.keys(data)) => {
  try {
    await clearDB();

    const db = mongoose.connection;

    const seededCollections = collections.map((collectionName) => {
      return seedCollection(db, collectionName, data[collectionName]).then(
        (writeResults) => {
          return `${collectionName}: ${writeResults.result.n}`;
        }
      );
    });

    await Promise.all(seededCollections);

    console.log('Done seeding vmt-test');
    mongoose.connection.close();
  } catch (err) {
    console.log('Error seeding: ', err);
  }
};

module.exports.seed = seed;
