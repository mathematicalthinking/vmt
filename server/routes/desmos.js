const axios = require('axios');
const express = require('express');

const router = express.Router();
const errors = require('../middleware/errors');

router.get('/', (req, res) => {
  axios({
    method: 'GET',
    url: req.query.url,
    headers: { Accept: 'application/json' },
  })
    .then((result) => {
      res.json({
        result: result.data,
      });
    })
    .catch((err) => {
      console.log(err);
      return errors.sendError.InternalError(null, res);
    });
});

module.exports = router;
