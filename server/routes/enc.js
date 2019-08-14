const express = require('express');
const fs = require('fs');
const path = require('path');
const errors = require('../middleware/errors');

const router = express.Router();
const { getUser } = require('../middleware/utils/request');
const db = require('../models');

const getAccessCriteria = (user, query, resourceType, options = {}) => {
  const allowedResources = ['room', 'activity'];

  if (!user || !allowedResources.includes(resourceType)) {
    return null;
  }

  const text = typeof query === 'string' ? query.trim() : '';
  const regex = new RegExp(text, 'i');

  const criteria = { isTrashed: false, name: regex };

  const { isAdmin } = user;
  const { doIncludeTrashed, doIncludeRoomlessActivities } = options;

  // admins can see everything and have option to see trashed rooms and activities
  if (isAdmin) {
    if (doIncludeTrashed) {
      delete criteria.isTrashed;
    }
    return criteria;
  }

  const { rooms, activities } = user;

  // for non admins
  // room - public or in user's room's array
  // activity - public or in user's activities array
  criteria.$or = [{ privacySetting: 'public' }];

  if (resourceType === 'activity' && !doIncludeRoomlessActivities) {
    criteria.rooms = { $ne: [] };
  }

  // can't use $in with empty array
  if (resourceType === 'room' && (Array.isArray(rooms) && rooms.length > 0)) {
    criteria.$or.push({ _id: { $in: rooms } });
  } else if (
    resourceType === 'activity' &&
    (Array.isArray(activities) && activities.length > 0)
  ) {
    criteria.$or.push({ _id: { $in: activities } });
  }

  return criteria;
};
router.get('/search', (req, res) => {
  const { resourceName } = req.query;
  const reqUser = getUser(req);

  if (!reqUser) {
    return errors.sendError.InvalidCredentialsError('No user logged in', res);
  }

  const roomCriteria = getAccessCriteria(reqUser, resourceName, 'room');
  const activityCriteria = getAccessCriteria(reqUser, resourceName, 'activity');
  // should never happen
  if (roomCriteria === undefined || activityCriteria === undefined) {
    return errors.sendError.InternalError(null, res);
  }

  const rooms = db.Room.find(roomCriteria, {
    name: 1,
    members: 1,
    image: 1,
    instructions: 1,
    activity: 1,
  })
    .populate({
      path: 'members.user',
      select: 'username',
    })
    .populate({
      path: 'activity',
      select: 'name instructions',
    })
    .lean();

  const activities = db.Activity.find(activityCriteria, {
    name: 1,
    members: 1,
    instructions: 1,
    image: 1,
    rooms: 1,
  })
    .populate({
      path: 'members.user',
      select: 'username',
    })
    .populate({
      path: 'rooms',
      populate: {
        path: 'members.user',
        select: 'username',
      },
    })
    .lean();

  return Promise.all([rooms, activities])
    .then(([rooms, activities]) => {
      return res.json({
        activities,
        rooms,
      });
    })
    .catch((err) => {
      console.log('enc search err', err);
      errors.sendError.InternalError(err, res);
    });
});

router.get('/replayer/:asset', (req, res) => {
  const { asset } = req.params;
  fs.readdir(
    path.join(__dirname, `../client/encompassBuild/static/${asset}`),
    (err, files) => {
      if (err) {
        console.log(err);
        return errors.sendError.InternalError(err, res);
      }
      return res.sendFile(
        path.join(
          __dirname,
          `../client/encompassBuild/static/${asset}/${files[0]}`
        )
      );
    }
  );
});

module.exports = router;
