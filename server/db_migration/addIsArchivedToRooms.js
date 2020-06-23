//To run in dev mode:
//NODE_ENV=dev node addIsArchivedToRooms.js
//
//staging mode:
//NODE_ENV=staging node addIsArchivedToRooms.js
//
//prod mode:
//NODE_ENV=production node addIsArchivedToRooms.js
const mongoose = require('mongoose');
const models = require('../models');
const { Room } = models;
require('dotenv').config({ path: '../.env' });

/**
 * Connect with the version of the database
 * to be updated (e.g., production, dev, etc).
**/
console.log("NODE_ENV=", process.env.NODE_ENV)
console.log("MONGO_DEV_URI=", process.env.MONGO_DEV_URI)
let mongoURI;
if (process.env.NODE_ENV === 'dev') {
  mongoURI = process.env.MONGO_DEV_URI;
} else if (process.env.TRAVIS) {
  mongoURI = process.env.MONGO_TEST_URI;
} else if (process.env.NODE_ENV === 'production') {
  mongoURI = process.env.MONGO_PROD_URI;
} else if (process.env.NODE_ENV === 'staging') {
  mongoURI = process.env.MONGO_STAGING_URI;
} else if (process.env.NODE_ENV === 'test') {
  mongoURI = process.env.MONGO_TEST_URI;
}
console.log("mongoURI:", mongoURI);
mongoose.connect(mongoURI, { useNewUrlParser: true }, (err) => {
  if (err) {
    console.log(`DB CONNECTION FAILED: ${err}`);
  } else {
    console.log(`DB CONNECTION SUCCESS${mongoURI}`);
  }
});

/**
 * [addIsArchivedToRooms]
 * Set the "isArchived" field in all Room records
 * for which that field is not yet defined.
 * @return a Promise
 */
function addIsArchivedToRooms() {
  return new Promise((resolve, reject) => {
    Room.updateMany(
      { isArchived: { $exists: false } },
      { $set: { isArchived: false } }
    )
    .exec()
    .then((results) => {
      if (results) {
        const { n, nModified } = results;
        console.log(
          `Found ${n} Rooms without isArchived field and updated ${nModified} of them.`
        );
      }
      resolve(results);
    });
  });
}

addIsArchivedToRooms()
  .then(() => {
    mongoose.connection.close();
    console.log("Closed db connection.")
  })
  .catch((err) => {
    console.error('something went wrong: ', err);
    mongoose.connection.close();
  });