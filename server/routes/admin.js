const express = require('express');

const User = require('../models/User');
const ssoService = require('../services/sso');
const errors = require('../middleware/errors');
const { getUser } = require('../middleware/utils/request');
const { validateAdmin, validateId } = require('../middleware/api');

const router = express.Router();

router.use(validateAdmin);
router.param('id', validateId);

router.post('/forceUserLogout/:id', async (req, res) => {
  try {
    const reqUser = getUser(req);
    const userToBeLoggedOut = await User.findById(req.params.id);

    if (!userToBeLoggedOut) {
      return errors.sendError.NotFoundError(null, res);
    }

    const results = await ssoService.forceLogout(
      userToBeLoggedOut.ssoId,
      reqUser
    );

    if (results.isSuccess) {
      const updatedVmtUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          doForceLogout: true,
        },
        { new: true }
      );
      results.user = updatedVmtUser;
    }

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

module.exports = router;
