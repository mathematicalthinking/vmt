const express = require('express');
const fs = require('fs');
const _ = require('lodash');
const controllers = require('../controllers');
const path = require('path');
const errors = require('../middleware/errors');
const router = express.Router();
const { getUser } = require('../middleware/utils/request');

router.get('/search', (req, res, next) => {
  let { resourceName } = req.query;
  let reqUser = getUser(req);

  controllers.user
    .getUserResources(reqUser._id, {
      resourceName,
      resources: 'activities rooms',
    })
    .then(({ activities, rooms, isInvalidToken }, err) => {
      if (err) {
        return errors.sendError.InternalError(err, res);
      }
      res.json({ activities, rooms, isInvalidToken });
    })
    .catch(err => {
      console.log(err);
      errors.sendError.InternalError(err, res);
    });
});

router.get('/replayer/:asset', (req, res, next) => {
  let { asset } = req.params;
  fs.readdir(
    path.join(__dirname, `../client/encompassBuild/static/${asset}`),
    (err, files) => {
      if (err) {
        console.log(err);
        return errors.sendError.InternalError(err, res);
      }
      res.sendFile(
        path.join(
          __dirname,
          `../client/encompassBuild/static/${asset}/${files[0]}`
        )
      );
    }
  );
});

module.exports = router;
