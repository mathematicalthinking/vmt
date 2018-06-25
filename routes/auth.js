/**
 * # Auth API
 * @description This is the API passport authentication
 * @author Michael McVeigh
 */

//REQUIRE MODULES
const passport = require('passport');

//REQUIRE FILES
const express = require('express')
const router = express.Router()
const controllers = require('../controllers')

router.post('/login', (req, res, next) => {
  console.log("logging in");
  passport.authenticate('local-login', {
      successRedirect: '/',
      failureRedirect: '/#/auth/login',
      // failureFlash: true,
      // passReqToCallback: true
  });
});

router.post('/signup', (req, res, next) => {
  passport.authenticate('local-signup', {
      successRedirect: '/',
      failureRedirect: '/#/auth/signup',
  })(req, res, next);
});

router.post('/googleAuth', (req, res, next) => {
  passport.authenticate('google', {
     scope:["https://www.googleapis.com/auth/plus.login",
     "https://www.googleapis.com/auth/plus.profile.emails.read"
   ]
  })(req,res,next);
});

const googleReturn = (req, res, next) => {
  passport.authenticate('google', {
    failureRedirect: "/#/login",
    successRedirect: "/"
  })(req, res, next);
};

const logout = (req, res, next) => {
  console.log('LOGGING OUT!');
  req.logout();
  res.redirect('/');
};

module.exports = router;
