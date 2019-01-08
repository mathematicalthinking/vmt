  // REQUIRE MODULES
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
require('dotenv').config();

// REQUIRE FILES
const configure = require('./config/passport');
const api = require('./routes/api');
const auth = require('./routes/auth');
const desmos = require('./routes/desmos');

const app = express();

console.log("NODE_ENV=",process.env.NODE_ENV)
// SETUP DATABASE & SESSION
let mongoURI;
if (process.env.NODE_ENV === 'dev') {
  mongoURI = process.env.MONGO_DEV_URI;
} else if (process.env.NODE_ENV === 'production') {
  mongoURI = process.env.MONGO_PROD_URI;
} else if (process.env.NODE_ENV === 'staging') {
  mongoURI = process.env.MONGO_STAGING_URI;
} else if (process.env.NODE_ENV) {
  mongoURI = process.env.MONGO_TEST_URI;
}
mongoose.connect(mongoURI, (err, res) => {
  if (err){console.log('DB CONNECTION FAILED: '+err)}
  else{console.log('DB CONNECTION SUCCESS' + mongoURI)}
});

app.use(require('express-session')({
  secret: 'my-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    // secure: true,
  },
  store: new MongoStore({mongooseConnection: mongoose.connection, stringify: false})
}))


// DO WE NEED THIS?
if (process.env.NODE_ENV === 'travistest' || process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/client/build')));
} else {
  app.use(express.static(path.join(__dirname, '/client/public')));
}

// MIDDLEWARE
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Add headers to bypass CORS issues -->
// @TODO remove before going to production
// app.use(function (req, res, next) {
  //     // Website you wish to allow to connect
  //     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  //     // Request methods you wish to allow
  //     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     // Pass to next layer of middleware
//     next();
// });

// PASSPORT
configure(passport); // SETUP STRATEGIES ./middleware/passport
app.use(passport.initialize());
app.use(passport.session());

// CONNECT ROUTES
app.use('/desmos', desmos);
app.use('/auth', auth);
app.use('/api', api);

app.get('*', (req, res) => {
  if (process.env.NODE_ENV === 'travistest' || proces.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '/client/build/index.html'))
  } else {
    res.sendFile(path.join(__dirname, '/client/public/index.html'));
  }
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(500).json({errorMessage: 'Internal Error'})
  // res.render('error');
});

module.exports = app;
