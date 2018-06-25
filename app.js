// REQUIRE MODULES
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const configure = require('')
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
require('dotenv').config();

// REQUIRE FILES
const api = require('./routes/api');
const auth = require('./routes/auth');

const app = express();

// SETUP DATABASE & SESSION
mongoose.connect(process.env.MONGO_URI, (err, res) => {
  if (err){console.log('DB CONNECTION FAILED: '+err)}
  else{console.log('DB CONNECTION SUCCESS')}
});

app.use(require('express-session')({
  secret: 'my-secret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection: mongoose.connection, stringify: false})
}))

//serve react files in a production enviornment
app.use(express.static(path.join(__dirname, 'client/build')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// MIDDLEWARE
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// PASSPORT
configure(passport); // SETUP STRATEGIES ./middleware/passport
app.use(passport.initialize());
app.use(passport.session());

// CONNECT ROUTES
app.use('/auth', auth);
app.use('/api', api);

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
  res.status(err.status || 500);
  // res.render('error');
});

module.exports = app;
