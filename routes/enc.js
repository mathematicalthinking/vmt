const express = require("express");
const fs = require("fs");
const _ = require("lodash");
const controllers = require("../controllers");
const path = require("path");
const errors = require("../middleware/errors");
const router = express.Router();

router.get("/search", (req, res, next) => {
  let { username, resourceName } = req.query;
  let token = req.headers.authorization;
  console.log("TOKEN: ", token);
  controllers.user
    .getUserResources(username, token, {
      resourceName,
      resources: "activities rooms"
    })
    .then(({ activities, rooms }, err) => {
      if (err) {
        return errors.sendError.InternalError(err, res);
      }
      res.json({ activities, rooms });
    })
    .catch(err => {
      console.log(err);
      errors.sendError.InternalError(err, res);
    });
});

router.get("/replayer/:asset", (req, res, next) => {
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

function encompassAuthentication(req, res, next) {
  User.findOne({ token: req.headers.Authorization })
    .then(res => {})
    .catch(err => {
      return errors.sendError.NotAuthorizedError(err, res);
    });
}

module.exports = router;
