/**
 * # Auth API
 * @description API auth authentication
 * @author Michael McVeigh
 */

const express = require('express');

const router = express.Router();
const jwt = require('jsonwebtoken');
const { isNil, isEqual } = require('lodash');
const controllers = require('../controllers');
// const Course = require('../models/Course');
const User = require('../models/User');
const errors = require('../middleware/errors');
const {
  getUser,
  setSsoCookie,
  setSsoRefreshCookie,
  clearAccessCookie,
  clearRefreshCookie,
} = require('../middleware/utils/request');
const userController = require('../controllers/UserController');

const { extractBearerToken } = require('../middleware/mt-auth');

const {
  isValidMongoId,
  areObjectIdsEqual,
} = require('../middleware/utils/helpers');

const Room = require('../models/Room');

const ssoService = require('../services/sso');

const secret = process.env.MT_USER_JWT_SECRET;

const addDefaultPassword = (req) => ({
  ...req,
  body: { ...req.body, password: process.env.VMT_LOGIN_DEFAULT },
});

// login by using the default password (used in client/ClassCode.js)
router.post('/loginSpecial', async (req, res) => {
  return login(addDefaultPassword(req), res);
});

router.post('/login', async (req, res) => {
  return login(req, res);
});

const login = async (req, res) => {
  try {
    const { message, accessToken, refreshToken } = await ssoService.login(
      req.body
    );
    if (message) {
      return errors.sendError.InvalidCredentialsError(message, res);
    }

    const verifiedToken = await jwt.verify(accessToken, secret);
    const vmtUser = await User.findById(verifiedToken.vmtUserId)
      .populate({
        path: 'courses',
        populate: { path: 'members.user', select: 'username' },
      })
      .populate({
        path: 'rooms',
        select: '-currentState',
        populate: {
          path: 'tabs members.user',
          select: 'username tabType name instructions',
        },
      })
      .populate({
        path: 'activities',
        populate: { path: 'tabs', select: 'tabType desmosLink name' },
      })
      .populate({
        path: 'notifications',
        populate: { path: 'fromUser', select: '_id username' },
      })
      .lean()
      .exec();

    setSsoCookie(res, accessToken);
    setSsoRefreshCookie(res, refreshToken);

    const data = vmtUser;
    return res.json(data);
  } catch (err) {
    return errors.sendError.InternalError(null, res);
  }
};

// signing up by using the default password (used in client/ClassCode.js).
// i.e., for users created by the Import facility
router.post('/signupSpecial', async (req, res) => {
  return signup(addDefaultPassword(req), res);
});

router.post('/signup', async (req, res) => {
  return signup(req, res);
});

const signup = async (req, res) => {
  try {
    const { message, accessToken, refreshToken } = await ssoService.signup(
      req.body
    );

    if (message) {
      return errors.sendError.InvalidCredentialsError(message, res);
    }

    const verifiedToken = await jwt.verify(accessToken, secret);

    setSsoCookie(res, accessToken);
    setSsoRefreshCookie(res, refreshToken);

    const user = await User.findById(verifiedToken.vmtUserId)
      .lean()
      .exec();

    const wasFromTempUser = Array.isArray(user.rooms) && user.rooms.length > 0;

    if (wasFromTempUser) {
      // update the room
      const tempRoom = await Room.findById(user.rooms[0]);
      // verify the found room exists and is temp (not a pending user)
      if (tempRoom && tempRoom.tempRoom) {
        tempRoom.tempRoom = false;

        let foundUser = false;

        const { members } = tempRoom;
        members.forEach((member) => {
          if (isEqual(member.user, user._id)) {
            if (member.role !== 'facilitator') {
              member.role = 'facilitator';
            }
            foundUser = true;
          }
        });

        // will this ever happen?
        if (!foundUser) {
          members.push({ user: user._id, role: 'facilitator' });
        }
        await tempRoom.save();
      }
    }

    return res.json(user);
  } catch (err) {
    console.log('err signup', err);
    return errors.sendError.InternalError(null, res);
  }
};

router.post('/logout/:userId', (req, res) => {
  User.findByIdAndUpdate(req.params.userId, { socketId: null })
    .lean()
    .then(() => {
      try {
        clearAccessCookie(res);
        clearRefreshCookie(res);

        res.json({ result: 'success' });
      } catch (err) {
        console.log(('logout err', err));
        errors.sendError.InternalError(err, res);
      }
    })
    .catch((err) => errors.sendError.InternalError(err, res));
});

router.get('/currentUser', (req, res) => {
  const currentUser = getUser(req);

  if (currentUser === null) {
    return res.json({ user: null });
  }
  return userController
    .getById(currentUser._id)
    .then((result) => {
      res.json({ result });
    })
    .catch((err) => errors.sendError.InternalError(err, res));
});

router.post('/newMtUser', async (req, res) => {
  try {
    const authToken = extractBearerToken(req);

    await jwt.verify(authToken, secret);
    const wasFromTempUser =
      Array.isArray(req.body.rooms) && isValidMongoId(req.body.rooms[0]);
    if (wasFromTempUser) {
      const results = await Promise.all([
        Room.findByIdAndUpdate(req.body.rooms[0], {
          tempRoom: false,
          /** @todo this would overwrite the room list with just this user...if  there is in fact
           * a members list and not just a currentMembers list. but this raises the larger question o
           * how do we want to handle this? would it be bad to have tempUsers in a members list??
           */
          members: [{ user: req.body._id, role: 'facilitator' }],
        }),
        User.findByIdAndUpdate(req.body._id, req.body, {
          new: true,
        }),
      ]);
      return res.json(results[1]);
    }

    const newUser = await User.create(req.body);

    return res.json(newUser);
  } catch (err) {
    // invalid token
    return errors.sendError.InvalidCredentialsError(
      'Unauthorized request',
      res
    );
  }
});

router.post('/forgotPassword', async (req, res) => {
  try {
    const results = await ssoService.forgotPassword(req.body);
    res.json(results);
  } catch (err) {
    console.error(`Error auth/forgot: ${err}`);
    console.trace();
    errors.handleError(err, res);
  }
});

router.get('/resetPassword/validate/:token', async (req, res) => {
  try {
    const results = await ssoService.validateResetPasswordToken(
      req.params.token
    );
    res.json(results);
  } catch (err) {
    errors.handleError(err, res);
  }
});

router.post('/resetPassword/:token', async (req, res) => {
  try {
    const {
      user,
      accessToken,
      refreshToken,
      message,
    } = await ssoService.resetPassword(req.body, req.params.token);

    if (message) {
      res.json({ message });
      return;
    }
    // await jwt.verify(accessToken, process.env.MT_USER_JWT_SECRET);

    const vmtUser = await User.findById(user.vmtUserId)
      .populate({
        path: 'courses',
        populate: { path: 'members.user', select: 'username' },
      })
      .populate({
        path: 'rooms',
        select: '-currentState',
        populate: {
          path: 'tabs members.user',
          select: 'username name tabType',
        },
      })
      .populate({
        path: 'activities',
        populate: { path: 'tabs', select: 'name tabType' },
      })
      .populate({
        path: 'notifications',
        populate: { path: 'fromUser', select: '_id username' },
      })
      .lean()
      .exec();

    setSsoCookie(res, accessToken);
    setSsoRefreshCookie(res, refreshToken);

    res.json(vmtUser);
  } catch (err) {
    console.error(`Error resetPassword: ${err}`);
    console.trace();
    errors.handleError(err, res);
  }
});

router.post('/resetPassword/user', async (req, res) => {
  try {
    const reqUser = getUser(req);
    if (!reqUser) {
      return errors.sendError.InvalidCredentialsError(null, res);
    }
    // need to be admin or be teacher and resetting one of your students
    // TODO: update this to only let you reset one of your student's passwords
    const isSelf = areObjectIdsEqual(reqUser._id, req.body.id);

    const hasPermission = reqUser.isAdmin || isSelf;

    if (!hasPermission) {
      return errors.sendError.NotAuthorizedError(
        'You are not authorized.',
        res
      );
    }

    const results = await ssoService.resetPasswordById(req.body, reqUser);
    return res.json(results);
  } catch (err) {
    return errors.handleError(err, res);
  }
});

router.get('/confirmEmail/confirm/:token', async (req, res) => {
  try {
    const results = await ssoService.confirmEmail(req.params.token);
    const currentUser = getUser(req);
    const isLoggedIn = !isNil(currentUser);
    const confirmedUser = results.user;

    const wasSuccess = results.isValid && !isNil(confirmedUser);

    if (!wasSuccess) {
      return res.json(results);
    }
    // front end only needs updated user if user was already logged in
    if (!isLoggedIn) {
      delete results.user;
    } else {
      // there is an existing user logged in
      // check if the user whose email was confirmed is the same as the logged in user
      const isSameUser = areObjectIdsEqual(currentUser._id, confirmedUser._id);

      if (!isSameUser) {
        delete results.user;
      }
    }
    return res.json(results);
  } catch (err) {
    console.log('err conf em: ', err.message);
    return errors.handleError(err, res);
  }
});

router.get('/confirmEmail/resend', async (req, res) => {
  try {
    const reqUser = getUser(req);

    if (!reqUser) {
      return errors.sendError.InvalidCredentialsError(null, res);
    }

    const results = await ssoService.resendConfirmEmail(reqUser);
    return res.json(results);
  } catch (err) {
    console.log('err resend conf: ', err.message);
    return errors.handleError(err, res);
  }
});

router.put('/sso/user/:id', async (req, res) => {
  try {
    const authToken = extractBearerToken(req);
    await jwt.verify(authToken, secret);
    const vmtUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    return res.json(vmtUser);
  } catch (err) {
    return errors.handleError(err, res);
  }
});

module.exports = router;
