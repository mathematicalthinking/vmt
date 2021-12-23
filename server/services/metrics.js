const express = require('express');

const router = express.Router();
const client = require('prom-client');
const socketInit = require('../socketInit');

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'VMT_' + process.env.NODE_ENV + '_',
});
// const prefix = 'VMT_' + process.env.NODE_ENV + '_';

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

const sockets = socketInit;
const totalSocketconnections = new client.Gauge({
  name: 'socket_connections',
  help: 'current socket connections',
  collect() {
    // Invoked when the registry collects its metrics' values.
    // This can be synchronous or it can return a promise/be an async function.
    if (sockets.io) this.set(sockets.io.engine.clientsCount);
  },
});
// Register the histogram
register.registerMetric(totalSocketconnections);

// const disconnectCount = new client.Counter({
//   name: 'socket_disconnects',
//   help: 'number of socket disconnects',
// });
// if (sockets.io) {
//   sockets.io.on('connection', (socket) => {
//     socket.on('disconnecting', () => {
//       disconnectCount.inc();
//     });
//   });
// }

// register.registerMetric(disconnectCount);

router.get('/', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

module.exports = router;
