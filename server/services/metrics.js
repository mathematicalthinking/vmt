const express = require('express');

const router = express.Router();
const client = require('prom-client');
const sockets = require('../socketInit');

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'VMT_' + process.env.NODE_ENV,
});
// const prefix = 'VMT_' + process.env.NODE_ENV + '_';

// Enable the collection of default metrics
client.collectDefaultMetrics();

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

// const totalSocketevents = new client.Gauge({
//   name: 'socket_events',
//   help: 'total socket events',
//   collect() {
//     // Invoked when the registry collects its metrics' values.
//     // This can be synchronous or it can return a promise/be an async function.
//     if (sockets.io) this.set(sockets.io.eventCount);
//   },
// });
// // Register the histogram
// register.registerMetric(totalSocketevents);

const socketMetricInc = (type) => {
  if (type === 'disconnect') {
    disconnectCount.inc();
  }
  if (type === 'reconnect') {
    reconnectCount.inc();
  }
  if (type === 'mounting') {
    mountingCount.inc();
  }
  if (type === 'updating') {
    updatingCount.inc();
  }
  if (type === 'connect') {
    connectCount.inc();
  }
  if (type === 'roomjoin') {
    roomJoinCount.inc();
  }
  if (type === 'roomleave') {
    roomLeaveCount.inc();
  }
  if (type === 'sync') {
    socketSyncCount.inc();
  }
  if (type === 'msgsend') {
    msgSendCount.inc();
  }
  if (type === 'msgpend') {
    msgPendCount.inc();
  }
  if (type === 'controltake') {
    controlTakeCount.inc();
  }
  if (type === 'controlrelease') {
    controlReleaseCount.inc();
  }
  if (type === 'eventsend') {
    roomEventCount.inc();
  }
  if (type === 'tabswitch') {
    tabSwitchCount.inc();
  }
  if (type === 'tabsnew') {
    tabNewCount.inc();
  }
  if (type === 'refupdated') {
    refUpdateCount.inc();
  }
};

const reconnectCount = new client.Counter({
  name: 'socket_reconnects',
  help: 'number of syncs due to socket reconnects',
});
register.registerMetric(reconnectCount);

const mountingCount = new client.Counter({
  name: 'component_mounts',
  help: 'number of syncs due to component mount',
});
register.registerMetric(mountingCount);

const updatingCount = new client.Counter({
  name: 'component_updating',
  help: 'number of syncs due to component updating',
});
register.registerMetric(updatingCount);

const disconnectCount = new client.Counter({
  name: 'socket_disconnects',
  help: 'number of socket disconnects',
});
register.registerMetric(disconnectCount);

const connectCount = new client.Counter({
  name: 'socket_connects',
  help: 'number of socket connection events',
});
register.registerMetric(connectCount);

const roomJoinCount = new client.Counter({
  name: 'socket_roomJoins',
  help: 'number of room join events',
});
register.registerMetric(roomJoinCount);

const roomLeaveCount = new client.Counter({
  name: 'socket_roomLeaves',
  help: 'number of room leave events',
});
register.registerMetric(roomLeaveCount);

const socketSyncCount = new client.Counter({
  name: 'socket_socketSyncs',
  help: 'number of socket sync events',
});
register.registerMetric(socketSyncCount);

const msgSendCount = new client.Counter({
  name: 'socket_msgSend',
  help: 'number of socket message events',
});
register.registerMetric(msgSendCount);

const msgPendCount = new client.Counter({
  name: 'socket_msgPend',
  help: 'number of socket message pending events',
});
register.registerMetric(msgPendCount);

const controlTakeCount = new client.Counter({
  name: 'socket_controlTake',
  help: 'number of took control events',
});
register.registerMetric(controlTakeCount);

const controlReleaseCount = new client.Counter({
  name: 'socket_controlRelease',
  help: 'number of release control events',
});
register.registerMetric(controlReleaseCount);

const roomEventCount = new client.Counter({
  name: 'socket_roomEvents',
  help: 'number of room events sent',
});
register.registerMetric(roomEventCount);

const tabSwitchCount = new client.Counter({
  name: 'socket_tabSwitches',
  help: 'number of tab switch events',
});
register.registerMetric(tabSwitchCount);

const tabNewCount = new client.Counter({
  name: 'socket_tabNew',
  help: 'number of new tab events',
});
register.registerMetric(tabNewCount);

const refUpdateCount = new client.Counter({
  name: 'socket_refUpdate',
  help: 'number of reference update events',
});
register.registerMetric(refUpdateCount);

router.get('/', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

module.exports = {
  router,
  socketMetricInc,
};
