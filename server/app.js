// REQUIRE MODULES
const express = require('express');
const path = require('path');
const fs = require('fs');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const promBundle = require('express-prom-bundle');
require('dotenv').config();

// REQUIRE FILES
const mtAuth = require('./middleware/mt-auth');
const api = require('./routes/api');
const auth = require('./routes/auth');
const desmos = require('./routes/desmos');
const enc = require('./routes/enc');
const admin = require('./routes/admin');
const cors = require('./middleware/cors');
const { router: metrics } = require('./services/metrics');

const app = express();
console.log('NODE_ENV=', process.env.NODE_ENV);
// SETUP DATABASE & SESSION

const mongoURI = process.env.MONGO_URI;
const isSecure = !mongoURI.includes('localhost');
let mongoOptions = { useNewUrlParser: true, poolSize: 10 };
if (isSecure) {
  mongoOptions = {
    ...mongoOptions,
    ssl: true,
    sslValidate: true,
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASS,
    sslKey: fs.readFileSync(process.env.MONGO_SSL_KEY_DIR),
    sslCert: fs.readFileSync(process.env.MONGO_SSL_CERT_DIR),
    authSource: process.env.MONGO_AUTHDB,
  };
}

mongoose.connect(mongoURI, mongoOptions, (err) => {
  if (err) {
    console.log(`DB CONNECTION FAILED: ${err}`);
  } else {
    console.log(`DB CONNECTION SUCCESS ${mongoURI}`);
  }
});

// MIDDLEWARE
// COLLECT AND EXPOSE METRICS
const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);
app.use('/metrics', metrics);

// Morgan configuration
if (process.env.NODE_ENV === 'development') {
  app.use(logger('dev'));
} else {
  // only log errors on deployment
  app.use(
    logger('dev', {
      skip: function(req, res) {
        return res.statusCode < 400;
      },
    })
  );
}
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(cookieParser());
app.use(cors);

// Mathematical Thinking Auth middleware
app.use(mtAuth.prep);
app.use(mtAuth.prepareMtUser);
app.use(mtAuth.prepareVmtUser);

// CONNECT ROUTES
app.use('/desmos', desmos);
app.use('/auth', auth);
app.use('/api', api);
app.use('/enc', enc);
app.use('/admin', admin);

// This route is called by the script tag in the client index.html (client/public/index.html). Returns javascript that sets up environment
// variables defined in server/.env that are used by the client. Creates a window.env object that holds all the server-provided variables.
app.use('/env.js', (req, res) => {
  const commands = Object.keys(process.env).reduce(
    (acc, curr) =>
      curr.includes('REACT_APP_')
        ? acc.concat(`window.env.${curr}="${process.env[curr]}";`)
        : acc,
    `window.env={};`
  );
  res.send(commands);
});

if (process.env.ENCOMPASS) {
  app.use(express.static(path.join(__dirname, '../client/encompassBuild')));
} else if (
  process.env.NODE_ENV === 'travistest' ||
  process.env.NODE_ENV === 'production' ||
  process.env.NODE_ENV === 'staging'
) {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('/*', (req, res) => {
  if (process.env.ENCOMPASS) {
    res.sendFile(path.join(__dirname, '../client/encompassBuild/index.html'));
  } else if (
    process.env.NODE_ENV === 'travistest' ||
    process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'staging'
  ) {
    res.locals({ config2: 'stuff' });
    res.sendFile(path.join(__dirname, '../client/build/index.html'), {
      config: JSON.stringify('config stuff'),
    });
  }
});

// catch 404 and forward to error handler
app.use((_, __, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.error('ERROR: ', err);
  // render the error page
  res.status(500).json({ errorMessage: 'Internal Error' });
  // res.render('error');
});

module.exports = app;
