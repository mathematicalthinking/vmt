const express = require("express");
const router = express.Router();
const controllers = require("../controllers");
const path = require("path");
const errors = require("../middleware/errors");
const _ = require("lodash");

router.get("/search", (req, res, next) => {
  let { username, resourceName } = req.query;
  controllers.user
    .getUserResources(username, {
      resources: "acitivities rooms",
      resourceName
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

router.get("/replayer", (req, res, next) => {
  res.sendFile(path.join(__dirname, "/client/encompassBuild/static/"));
});

module.exports = router;
