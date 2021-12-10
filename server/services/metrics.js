// const axios = require('axios');
const express = require('express');

const router = express.Router();
const client = require('prom-client');

// const errors = require('../middleware/errors');

const collectDefaultMetrics = client.collectDefaultMetrics;
const Registry = client.Registry;
const register = new Registry();
collectDefaultMetrics({ register });

router.get('/', async (req, res) => {
  //   axios({
  //     method: 'GET',
  //     // headers: { Accept: 'application/json' },
  //   })
  //     .then((res) => {
  // Return all metrics the Prometheus exposition format
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
  // })
  // .catch((err) => {
  //   console.log(err);
  //   return errors.sendError.InternalError(null, res);
  // });
});

module.exports = router;
