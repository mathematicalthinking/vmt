const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { getUser } = require('../middleware/utils/request');

router.get('/return', (req, res) => {
    const currentUser = getUser(req);

    await User.findByIdAndUpdate(currentUser._id, {
      lastLogin: new Date(),
    });

  res.sendStatus(200);
});

module.exports = router;
