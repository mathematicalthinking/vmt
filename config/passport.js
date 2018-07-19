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

  passport.use('local-signup', new LocalStrategy({
    passReqToCallback: true,
  },(req, username, password, next) => {
    console.log(req.body)
    process.nextTick(() => {
      User.findOne({ 'username':  username }, (err, user) => {
        if (err)  return next(err);
        if (user) {return next(null, false, {message: 'That username is already taken.'});}
        else {
          console.log('did not find user')
          var newUser = new User();
          newUser.username = username;
          newUser.email = req.body.email;
          newUser.firstName = req.body.firstName;
          newUser.lastName = req.body.lastName;
          newUser.password = bcrypt.hashSync(password, bcrypt.genSaltSync(12), null);
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
    User.findOne({ 'username':  username }, (err, user) => {
      if (err) return next(err);
      if (!user) return next(null, false, {message: 'No user found.'});
      if (!bcrypt.compareSync(password, user.password)) return next(null, false, {message: 'Oops! Wrong password.'});
      return next(null, user);
    }).populate('rooms').populate('courses').lean();
  }));



  //GOOGLE STRATEGY
  passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  }, (accessToken, refreshToken, profile, done) => {
    console.log("ANything here?")
    console.log('profileid', profile.id);
    User.findOne({
      googleId: profile.id
    }, (err, user) => {
      if (err) {
        console.log('in err block', err);
        return done(err);
      }
      if (user) {
        return done(null, user);
      }

      const newUser = new User({
        googleId: profile.id,
        name: profile.name.givenName + " " + profile.name.familyName,
        username: profile.emails[0].value,
        email: profile.emails[0].value,
        isAuthorized: true
      });
      newUser.save((err) => {
        if (err) {
          return done(err);
        }
        return done(null, newUser);
      });
    });

  }));
};
