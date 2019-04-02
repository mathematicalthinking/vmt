/**
 * # Auth API
 * @description API passport authentication
 * @author Michael McVeigh
 */

const passport = require("passport");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/User");
const errors = require("../middleware/errors");

router.post("/login", (req, res, next) => {
  passport.authenticate("local-login", (err, user, info) => {
    if (user) {
      return req.login(user, err => {
        if (err) {
          return errors.sendError.InternalError(null, res);
        }
        res.json(user);
      });
    }
    let msg;

    if (info && info.message) {
      msg = info.message;
    } else {
      msg = info;
    }
    return errors.sendError.InvalidCredentialsError(msg, res);
  })(req, res, next);
});

router.post("/signup", (req, res, next) => {
  passport.authenticate("local-signup", (err, user, info) => {
    if (user) {
      return req.login(user, err => {
        if (err) {
          errors.sendError.InternalError(null, res);
        }
        res.json(user);
      });
    }
    let msg;
    if (info && info.message) {
      msg = info.message;
    } else {
      msg = info;
    }

    return errors.sendError.InvalidCredentialsError(msg, res);
  })(req, res, next);
});

/** Authentication for Encompass users who want to import rooms into the Encompass account **/
router.post("/enc", (req, res, next) => {
  let { username, password } = req.body;
  User.findOne({ username })
    .then(user => {
      if (!user) {
        return res.json({errorMessage: 'Incorrect username'});
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return res.json({errorMessage: 'Incorrect password'});
      } else {
        let userSummary = {};
        userSummary.username = user.username;
        userSummary._id = user._id;
        crypto.randomBytes(20, (err, buff) => {
          if (err) return errors.sendError.InternalError(err, res);
          userSummary.token = buff.toString("hex");
          user.token = userSummary.token;
          user.tokenExpiryDate = Date.now() + 3600000; // 1 Day
          user.save();
          return res.json({ user: userSummary });
        });
      }
    })
    .catch(err => {
      console.log("ERROR ", err);
      return errors.sendError.InternalError(err, res);
    });
});

router.get("/googleAuth", (req, res, next) => {
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/plus.login",
      "https://www.googleapis.com/auth/plus.profile.emails.read"
    ]
  })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", {
    failureRedirect: "/#/login",
    successRedirect: "/"
  })(req, res, next);
});

const googleReturn = (req, res, next) => {};

const logout = (req, res, next) => {
  req.logout();
  res.redirect("/");
};

module.exports = router;
