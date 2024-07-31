const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { getUser } = require('../middleware/utils/request');

router.get('/return', async (req, res) => {
  console.log('handling redirect correctly');
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
