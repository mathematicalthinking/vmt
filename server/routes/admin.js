const express = require('express');

const User = require('../models/User');
const ssoService = require('../services/sso');
const errors = require('../middleware/errors');
const { getUser } = require('../middleware/utils/request');
const { validateAdmin, validateId } = require('../middleware/api');
const { forceUserLogout } = require('../middleware/admin');

const router = express.Router();

router.use(validateAdmin);
router.param('id', validateId);

router.post('/forceUserLogout/:id', async (req, res) => {
  try {
    const reqUser = getUser(req);
    const results = await forceUserLogout(req.params.id, reqUser);
    return res.json(results);
  } catch (err) {
    console.log('err admin force logout: ', err.message);
    return errors.handleError(err, res);
  }
});

router.post('/suspendUser/:id', async (req, res) => {
  try {
    const reqUser = getUser(req);

    const userToBeSuspended = await User.findById(req.params.id);

    if (!userToBeSuspended) {
      return errors.sendError.NotFoundError(null, res);
    }

    const results = await ssoService.suspendUser(
      userToBeSuspended.ssoId,
      reqUser
    );

    if (results.isSuccess) {
      const updatedVmtUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          isSuspended: true,
        },
        { new: true }
      );
      results.user = updatedVmtUser;
    }

    return res.json(results);
  } catch (err) {
    console.log('err admin suspend user: ', err.message);
    return errors.handleError(err, res);
  }
});

router.post('/reinstateUser/:id', async (req, res) => {
  try {
    const reqUser = getUser(req);

    const userToBeReinstated = await User.findById(req.params.id);

    if (!userToBeReinstated) {
      return errors.sendError.NotFoundError(null, res);
    }

    const results = await ssoService.reinstateUser(
      userToBeReinstated.ssoId,
      reqUser
    );

    if (results.isSuccess) {
      const updatedVmtUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          isSuspended: false,
        },
        { new: true }
      );
      results.user = updatedVmtUser;
    }

    return res.json(results);
  } catch (err) {
    console.log('err admin reinstate user: ', err.message);
    return errors.handleError(err, res);
  }
});

// update usernames in sso
router.put('/updateUsernames', async (req, res) => {
  // given a list of users ({local id, new username}), update their username in sso
  try {
    const { users } = req.body;
    const reqUser = getUser(req);

    const usernameMap = new Map(users.map((user) => [user._id, user.username]));
    const userIds = [...usernameMap.keys()];
    const usersFromDB = await User.find({ _id: { $in: userIds } });
    const idToSsoIdMap = new Map(
      usersFromDB.map((user) => [user._id.toString(), user.ssoId])
    );

    // Create the new array keyed by ssoIds rather than _ids
    const usersWithSSOIds = users.map((user) => {
      const ssoId = idToSsoIdMap.get(user._id);
      const username = usernameMap.get(user._id);
      return { _id: ssoId, username };
    });

    const results = await ssoService.updateUsernames(usersWithSSOIds, reqUser);
    return res.json(results);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('err admin update username: ', err.message);
    return errors.handleError(err, res);
  }
});

module.exports = router;
