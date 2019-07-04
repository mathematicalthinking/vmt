/**
 * # Auth API
 * @description API passport authentication
 * @author Michael McVeigh
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const errors = require('../middleware/errors');
const { getUser, setSsoCookie } = require('../middleware/utils/request');
const userController = require('../controllers/UserController');

const axios = require('axios');
const jwt = require('jsonwebtoken');

const { getMtSsoUrl } = require('../config/app-urls');
const { extractBearerToken } = require('../middleware/mt-auth');

const { isValidMongoId } = require('../middleware/utils/helpers');

const Room = require('../models/Room');

router.post('/login', async (req, res, next) => {
  try {
    let url = `${getMtSsoUrl()}/auth/login`;
    let mtLoginResults = await axios.post(url, req.body);

    let { message, mtToken } = mtLoginResults.data;
    if (message) {
      return errors.sendError.InvalidCredentialsError(message, res);
    }

    let verifiedToken = await jwt.verify(
      mtToken,
      process.env.MT_USER_JWT_SECRET
    );
    let vmtUser = await User.findById(verifiedToken.vmtUserId)
      .populate({
        path: 'courses',
        populate: { path: 'members.user', select: 'username' },
      })
      .populate({
        path: 'rooms',
        select: '-currentState',
        populate: { path: 'tabs members.user', select: 'username tabType' },
      })
      .populate({
        path: 'activities',
        populate: { path: 'tabs' },
      })
      .populate({ path: 'notifications', populate: { path: 'fromUser' } })
      .lean()
      .exec();

    setSsoCookie(res, mtToken, verifiedToken);

    let data = vmtUser;
    return res.json(data);
  } catch (err) {
    return errors.sendError.InternalError(null, res);
  }
});

router.post('/signup', async (req, res, next) => {
  try {
    let url = `${getMtSsoUrl()}/auth/signup/vmt`;
    let mtSignupResults = await axios.post(url, req.body);

    let { message, mtToken } = mtSignupResults.data;
    if (message) {
      return errors.sendError.InvalidCredentialsError(message, res);
    }

    let verifiedToken = await jwt.verify(
      mtToken,
      process.env.MT_USER_JWT_SECRET
    );

    setSsoCookie(res, mtToken, verifiedToken);

    let user = await User.findById(verifiedToken.vmtUserId)
      .lean()
      .exec();

    return res.json(user);
  } catch (err) {
    return errors.sendError.InternalError(null, res);
  }
});

/** Authentication for Encompass users who want to import rooms into the Encompass account **/
router.post('/enc', (req, res, next) => {
  let { username, password } = req.body;
  User.findOne({ username })
    .then(user => {
      if (!user) {
        return res.json({ errorMessage: 'Incorrect username' });
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return res.json({ errorMessage: 'Incorrect password' });
      } else {
        let userSummary = {};
        userSummary.username = user.username;
        userSummary._id = user._id;
        crypto.randomBytes(20, (err, buff) => {
          if (err) return errors.sendError.InternalError(err, res);
          userSummary.token = buff.toString('hex');
          user.token = userSummary.token;
          user.tokenExpiryDate = Date.now() + 3600000; // 1 Day
          user.save();
          return res.json({ user: userSummary });
        });
      }
    })
    .catch(err => {
      console.log('ERROR ', err);
      return errors.sendError.InternalError(err, res);
    });
});

router.post('/logout/:userId', (req, res, next) => {
  User.findByIdAndUpdate(req.params.userId, { socketId: null })
    .lean()
    .then(() => {
      try {
        res.cookie('mtToken', '', { httpOnly: true, maxAge: 0 });

        res.json({ result: 'success' });
      } catch (err) {
        console.log(('logout err', err));
        return errors.sendError.InternalError(err, res);
      }
    })
    .catch(err => errors.sendError.InternalError(err, res));
});

// router.get('/googleAuth', (req, res, next) => {
//   passport.authenticate('google', {
//     scope: [
//       'https://www.googleapis.com/auth/plus.login',
//       'https://www.googleapis.com/auth/plus.profile.emails.read',
//     ],
//   })(req, res, next);
// });

// router.get('/google/callback', (req, res, next) => {
//   passport.authenticate('google', {
//     failureRedirect: '/#/login',
//     successRedirect: '/',
//   })(req, res, next);
// });

// const logout = (req, res, next) => {
//   req.logout();
//   res.redirect('/');
// };

router.get('/currentUser', (req, res, next) => {
  let currentUser = getUser(req);

  if (currentUser === null) {
    return res.json({ user: null });
  }
  return userController
    .getById(currentUser._id)
    .then(result => {
      res.json({ result });
    })
    .catch(err => errors.sendError.InternalError(err, res));
});

router.post('/newMtUser', async (req, res, next) => {
  try {
    let authToken = extractBearerToken(req);

    let verifiedToken = await jwt.verify(
      authToken,
      process.env.MT_USER_JWT_SECRET
    );
    let wasFromTempUser =
      Array.isArray(req.body.rooms) && isValidMongoId(req.body.rooms[0]);
    if (wasFromTempUser) {
      let [updatedRoom, updatedUser] = await Promise.all([
        Room.findByIdAndUpdate(req.body.rooms[0], {
          tempRoom: false,
          members: [{ user: req.body._id, role: 'facilitator' }],
        }),
        User.findByIdAndUpdate(req.body._id, req.body, {
          new: true,
        }),
      ]);
      return res.json(updatedUser);
    }

    let newUser = await User.create(req.body);

    return res.json(newUser);
  } catch (err) {
    // invalid token
    return errors.sendError.InvalidCredentialsError(
      'Unauthorized request',
      res
    );
  }
});

module.exports = router;
