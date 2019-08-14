const mongoose = require('mongoose');
const models = require('../models');

mongoose.connect(`mongodb://localhost/vmt`);

function addIsTrashed() {
  const modelNames = Object.keys(models);
  return Promise.all(
    modelNames.map((name) => {
      return models[name]
        .update(
          { isTrashed: { $exists: false } },
          { $set: { isTrashed: false } },
          { multi: true }
        )
        .exec()
        .then((results) => {
          if (results) {
            const { n, nModified } = results;
            console.log(
              `Found ${n} ${name} without isTrashed field and updated ${nModified} of them.`
            );
          }
          return results;
        });
    })
  );
}

addIsTrashed()
  .then(() => {
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('something went wrong: ', err);
    mongoose.connection.close();
  });
