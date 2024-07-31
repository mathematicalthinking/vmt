const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { getUser } = require('../middleware/utils/request');

router.all('/return', async (req, res) => {
  const currentUser = getUser(req);

  User.findByIdAndUpdate(currentUser._id, {
    lastLogin: new Date(),
  })
    .then(() => res.sendStatus(200))
    .catch((err) => {
      console.log('Error in timestamping Google login', err);
      res.sendStatus(500);
    });
});

module.exports = router;
