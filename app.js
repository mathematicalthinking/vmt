// REQUIRE MODULES
const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
require("dotenv").config();

// REQUIRE FILES
const configure = require("./config/passport");
const api = require("./routes/api");
const auth = require("./routes/auth");
const desmos = require("./routes/desmos");
const enc = require("./routes/enc");
// const test = require('./routes/test');

const app = express();

console.log("NODE_ENV=", process.env.NODE_ENV);
console.log("ENCOMPASS: ", process.env.ENCOMPASS);
// SETUP DATABASE & SESSION
let mongoURI;
if (process.env.NODE_ENV === "dev") {
  mongoURI = process.env.MONGO_DEV_URI;
} else if (process.env.TRAVIS) {
  mongoURI = process.env.MONGO_TEST_URI;
} else if (process.env.NODE_ENV === "production") {
  mongoURI = process.env.MONGO_PROD_URI;
} else if (process.env.NODE_ENV === "staging") {
  mongoURI = process.env.MONGO_STAGING_URI;
} else if (process.env.NODE_ENV === "test") {
  mongoURI = process.env.MONGO_TEST_URI;
}

console.log("mongoURI ", mongoURI);

mongoose.connect(mongoURI, (err, res) => {
  if (err) {
    console.log("DB CONNECTION FAILED: " + err);
  } else {
    console.log("DB CONNECTION SUCCESS" + mongoURI);
  }
});

app.use(
  require("express-session")({
    secret: "my-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      // secure: true,
    },
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      stringify: false
    })
  })
);

// MIDDLEWARE
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// PASSPORT
configure(passport); // SETUP STRATEGIES ./middleware/passport
app.use(passport.initialize());
app.use(passport.session());

// CONNECT ROUTES
app.use("/desmos", desmos);
app.use("/auth", auth);
app.use("/api", api);
app.use("/enc", enc);

if (process.env.ENCOMPASS) {
  app.use(express.static(path.join(__dirname, "/client/encompassBuild")));
} else if (
  process.env.NODE_ENV === "travistest" ||
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "staging"
) {
  app.use(express.static(path.join(__dirname, "/client/build")));
}

app.get("/*", (req, res) => {
  console.log("request made: ", req.user);
  if (process.env.ENCOMPASS) {
    res.sendFile(path.join(__dirname, "/client/encompassBuild/index.html"));
  } else if (
    process.env.NODE_ENV === "travistest" ||
    process.env.NODE_ENV === "production" ||
    process.env.NODE_ENV === "staging"
  ) {
    res.sendFile(path.join(__dirname, "/client/build/index.html"));
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(500).json({ errorMessage: "Internal Error" });
  // res.render('error');
});

module.exports = app;
