const express = require('express')
const router = express.Router()
const errors = require('../middleware/errors');

router.get('/disconnect', (req, res, next) => {
  res.status(200)
  return process.exit()
})


module.exports = router;