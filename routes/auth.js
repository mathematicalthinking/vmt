/**
 * # Auth API
 * @description API passport authentication
 * @author Michael McVeigh
 */

const passport = require("passport");
const express = require("express");
const router = express.Router();
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
router.post("/enc", (req, res, next) => {});

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
