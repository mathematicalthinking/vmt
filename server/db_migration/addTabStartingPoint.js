const mongoose = require('mongoose');
const Models = require('../models');

mongoose.connect(`mongodb://localhost/vmt_prod`);

function addStartingPoint() {
  return new Promise((resolve, reject) => {
    Models.Tab.updateMany(
      {
        $or: [
          { startingPoint: '' },
          { startingPoint: null },
          { startingPoint: { $exists: false } },
        ],
      },
      { $set: { startingPoint: ' ' } }
    )
      .then(tabs => {
        console.log(`${tabs.length} tabs updated`);
        resolve();
      })
      .catch(err => reject(err));
  });
}

addStartingPoint()
  .then(() => {
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('something went wrong: ', err);
  });
