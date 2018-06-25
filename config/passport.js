//REQUIRE MODULES
const passport = require('passport');
const flash = require('connect-flash');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

//PASSWORD ENCRYPTION
const bcrypt = require('bcrypt');

//USER MODEL
const models = require('../models');
const User = models.User;

// =========================================================================
// passport session setup ==================================================
// =========================================================================
// required for persistent login sessions
// passport needs ability to serialize and unserialize users out of session

// used to serialize the user for the session
module.exports = (passport) => {
  passport.serializeUser((user, next) => {
    next(null, user.id);
  });

  passport.deserializeUser((id, next) => {
    User.findById(id, (err, user) => {
      if (err) {
        return next(err);
      }
      next(null, user);
    });
  });

  passport.use('local-signup', new LocalStrategy((username, password, next) => {
    process.nextTick(() => {
      User.findOne({ 'username':  username }, (err, user) => {
        if (err)  return next(err);
        if (user) {return next(null, false, {message: 'That email is already taken.'});}
        else {
          var newUser = new User();
          newUserusername = username;
          newUser.password = password;
          newUser.save(function(err) {
            if (err)
              throw err;
            return next(null, newUser);
          });
        }
      });
    });
  }));

  passport.use('local-login', new LocalStrategy((username, password, next) => {
    console.log(username, password, " <-- un and pw")
    User.findOne({ 'username':  username }, (err, user) => {
      if (err) return next(err);
      if (!user) return next(null, false, {message: 'No user found.'});
      // if (!user.validPassword(password)) return next(null, false, {message: 'Oops! Wrong password.'});
      return next(null, user);
    });
  }));



  //GOOGLE STRATEGY
  passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  }, (accessToken, refreshToken, profile, done) => {
    console.log('profileid', profile.id);
    User.findOne({
      googleId: profile.id
    }, (err, user) => {
      if (err) {
        console.log('in err block', err);
        return done(err);
      }
      if (user) {
        console.log('found google user', user);
        return done(null, user);
      }

      const newUser = new User({
        googleId: profile.id,
        name: profile.name.givenName + " " + profile.name.familyName,
        username: profile.emails[0].value,
        email: profile.emails[0].value,
        isAuthorized: true
      });
      console.log('new user', newUser);
      newUser.save((err) => {
        if (err) {
          console.log('error saving', err);
          return done(err);
        }
        done(null, newUser);
      });
    });

  }));
};
