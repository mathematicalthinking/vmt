/**
 * # Auth API
 * @description API passport authentication
 * @author Michael McVeigh
 */

const passport = require('passport');
const express = require('express')
const router = express.Router()

router.post('/login', (req, res, next) => {
  passport.authenticate('local-login', (err, user, info) => {
    if (user) {
      return req.login(user, (err) => {
        // console.log(res)
        res.json(user)
      })
    }
    if (info) {
      // if (info.errorMessage) return res.status(401).send({message: info})
      return res.json(info)
    }
    res.status(401).send({message: info})
    // res.json({message: 'success'})
  })(req, res, next);
});


router.post('/signup', (req, res, next) => {
  passport.authenticate('local-signup', (err, user, info) => {
    if (user) {
      return req.login(user, err => {
        if (err) {
          return console.log(err)
        }
        res.json(user)
      })
    }
    if (info) {
      // For some reason I couldn't my error message
      // with a 400 status code
      return res.json(info)
    }
    return res.status(500).end()
  })(req, res, next);
});

router.get('/googleAuth', (req, res, next) => {
  passport.authenticate('google', {
     scope:["https://www.googleapis.com/auth/plus.login",
     "https://www.googleapis.com/auth/plus.profile.emails.read"
    ]
  })(req,res,next);
});

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', {
    failureRedirect: "/#/login",
    successRedirect: "/"
  })(req, res, next)
})

const googleReturn = (req, res, next) => {

};

const logout = (req, res, next) => {
  req.logout();
  res.redirect('/');
};

module.exports = router;
