const express = require('express');

const router = express.Router();
const multer = require('multer');
const _ = require('lodash');
const controllers = require('../controllers');
const middleware = require('../middleware/api');
const errors = require('../middleware/errors');
const multerMw = require('../middleware/multer');

const {
  getUser,
  getResource,
  getParamsId,
  setResource,
  setParamsId,
} = require('../middleware/utils/request');
const { findAllMatching } = require('../middleware/utils/helpers');
const status = require('../constants/status');

router.param('resource', middleware.validateResource);
router.param('id', middleware.validateId);

router.get(
  '/:resource/getFieldsUnpopulated',
  middleware.validateUser,
  (req, res) => {
    const resource = getResource(req);
    const controller = controllers[resource];
    const { fields, skip, limit } = req.query;
    controller
      .getFieldsUnpopulated(fields, skip, limit)
      .then((result) => res.json({ result }))
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(`Error get ${resource}/getFieldsUnpopulated: ${err}`);
      });
  }
);

router.get('/:resource', middleware.validateUser, (req, res) => {
  const resource = getResource(req);
  const controller = controllers[resource];
  req.query.isTrashed = false;
  controller
    .get(req.query)
    .then((results) => res.json({ results }))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`Error get ${resource}: ${err}`);
      let msg = null;

      if (typeof err === 'string') {
        msg = err;
      }
      return errors.sendError.InternalError(msg, res);
    });
});

router.post('/:resource/code', (req, res) => {
  const resource = getResource(req);
  const controller = controllers[resource];
  const { code } = req.body;
  if (resource !== 'courses') {
    return errors.sendError.InternalError(
      'Resource not supported via class code entry!',
      res
    );
  }

  return controller
    .getByCode(code)
    .then((result) => res.json({ result }))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`Error: unable to retrieve resource via code`);
      let msg = null;

      if (typeof err === 'string') {
        msg = err;
      }

      return errors.sendError.InternalError(msg, res);
    });
});

router.get('/search/:resource', (req, res) => {
  const resource = getResource(req);
  // currently only /search/user uses this endpt
  if (resource !== 'user') {
    errors.sendError.InvalidContentError('Invalid Resource', res);
  }
  const controller = controllers[resource];
  let text = req.query.text || '';

  text = text.replace(/\s+/g, '');
  const regex = new RegExp(text, 'i');
  // console.log('Search: ', req.params.resource, ' for ', regex);
  const exclude = req.query.exclude || [];
  controller
    .search(regex, exclude)
    .then((results) => {
      res.json({ results });
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`Error search ${resource}: ${err}`);
      let msg = null;
      if (typeof err === 'string') {
        msg = err;
      }
      return errors.sendError.InternalError(msg, res);
    });
});

router.get('/searchPaginated/:resource', (req, res) => {
  const resource = getResource(req);
  const controller = controllers[resource];
  const { criteria, skip, privacySetting, roomType } = req.query;
  let regex;
  if (criteria) {
    regex = new RegExp(criteria, 'i');
  }
  const filters = {};
  if (privacySetting) filters.privacySetting = privacySetting;
  if (roomType) filters.roomType = roomType;
  controller
    .searchPaginated(regex, skip, filters)
    .then((results) => {
      res.json({ results });
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`Error search paginated${resource}: ${err}`);
      let msg = null;
      if (typeof err === 'string') {
        msg = err;
      }
      errors.sendError.InternalError(msg, res);
    });
});

router.get('/searchPaginatedArchive/:resource', (req, res) => {
  const resource = getResource(req);
  const controller = controllers[resource];
  const { searchText, skip, filters } = req.query;
  const regex = searchText ? new RegExp(searchText, 'i') : '';

  // add user's archived ids from db onto filters
  const user = getUser(req);
  const archiveIds =
    user.archive && user.archive[resource] ? user.archive[resource] : [];

  const filtersAdjusted = JSON.parse(filters);
  filtersAdjusted.ids = archiveIds;

  controller
    .searchPaginatedArchive(regex, skip, filtersAdjusted)
    .then((results) => {
      res.json({ results });
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`Error search paginated archive ${resource}: ${err}`);
      let msg = null;
      if (typeof err === 'string') {
        msg = err;
      }
      errors.sendError.InternalError(msg, res);
    });
});

// Return records that have any of the values in any of the fields
router.get('/findAllMatching/:resource', (req, res) => {
  const resource = getResource(req);
  const controller = controllers[resource];
  const { fields = [], values = [] } = req.query;

  findAllMatching(controller, fields, values)
    .then((results) => res.json({ results }))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`Error get ${resource}: ${err}`);
      let msg = null;

      if (typeof err === 'string') {
        msg = err;
      }
      return errors.sendError.InternalError(msg, res);
    });
});

// using post because we might get a lot of ids
router.post('/findAllMatchingIds/:resource/populated', (req, res) => {
  const resource = getResource(req);
  const controller = controllers[resource];
  const { ids = [], events = false, ...others } = req.body;

  try {
    return controller
      .getPopulatedById(ids, { events, ...others })
      .select(
        'creator user chat members currentMembers course activity tabs createdAt updatedAt name status'
      )
      .then((results) => res.json({ results }));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Error get ${resource}: ${err}`);
    let msg = null;

    if (typeof err === 'string') {
      msg = err;
    }
    return errors.sendError.InternalError(msg, res);
  }
});

router.get('/dashboard/:resource', middleware.validateUser, (req, res) => {
  const user = getUser(req);
  if (!user.isAdmin) {
    return errors.sendError.NotAuthorizedError(
      'You do not have admin permissions',
      res
    );
  }
  const resource = getResource(req);
  const allowedResources = ['rooms', 'user'];

  if (!allowedResources.includes(resource)) {
    return errors.sendError.InvalidContentError('Invalid Resource');
  }
  const { criteria, skip, since, to } = req.query;

  let regex;
  const trimmed = typeof criteria === 'string' ? criteria.trim() : '';

  if (trimmed.length > 0) {
    regex = new RegExp(criteria, 'i');
  }
  const filters = { since, to };

  return controllers[resource]
    .getRecentActivity(regex, skip, filters)
    .then((results) => res.json({ results }))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`Error admin/dashboard/${resource}: ${err}`);

      let msg = null;

      if (typeof err === 'string') {
        msg = err;
      }
      return errors.sendError.InternalError(msg, res);
    });
});

router.get(
  '/getAllRooms/:resource/:id',
  middleware.validateUser,
  (req, res) => {
    const id = getParamsId(req);
    const resource = getResource(req);
    let field = '';
    if (resource === 'courses') field = 'course';
    else if (resource === 'activities') field = 'activity';
    try {
      return controllers.rooms
        .get({
          status: { $ne: status.TRASHED },
          isTrashed: false,
          [field]: id,
        })
        .then((result) => res.status(200).json({ result }));
    } catch (err) {
      console.error(`Error getting ${resource} rooms/${id}: ${err}`);

      return errors.sendError.InternalError(err, res);
    }
  }
);

// returns a record with all of its info populated including sensitive information about record members etc.
router.get(
  '/:resource/:id/populated',
  middleware.validateRecordAccess,
  (req, res) => {
    const id = getParamsId(req);
    const resource = getResource(req);
    const controller = controllers[resource];
    controller
      .getPopulatedById(id, req.query)
      .then((result) => {
        // console.log({ result });
        res.json({ result });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(`Error get populated ${resource}/${id}: ${err}`);
        let msg = null;

        if (typeof err === 'string') {
          msg = err;
        }

        return errors.sendError.InternalError(msg, res);
      });
  }
);

// returns a record WITHOUT sensitive information
router.get('/:resource/:id', middleware.validateUser, (req, res) => {
  const id = getParamsId(req);
  const resource = getResource(req);
  const controller = controllers[resource];
  controller
    .getById(id, req.query)
    .then((result) => res.json({ result }))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`Error get ${resource}/${id}: ${err}`);
      let msg = null;

      if (typeof err === 'string') {
        msg = err;
      }

      return errors.sendError.InternalError(msg, res);
    });
});

// Bypass the middlewre for now on a temp room...eventually we should probably change the URL
// from the rooms id to some sort of secret entry code.
router.get('/:resource/:id/:tempRoom', (req, res) => {
  const id = getParamsId(req);
  const resource = getResource(req);
  const controller = controllers[resource];
  controller
    .getPopulatedById(id, req.query)
    .then((result) => res.json({ result }))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`Error get ${resource}/${id}: ${err}`);
      let msg = null;

      if (typeof err === 'string') {
        msg = err;
      }

      return errors.sendError.InternalError(msg, res);
    });
});

// route for getUsersByResource
router.get(
  '/:resource/:id/users/:fields',
  middleware.validateUser,
  (req, res) => {
    const id = getParamsId(req);
    const resource = getResource(req);
    const fields = req.params.fields.split(',');
    const userController = controllers.user;
    userController
      .getUsersByResource(resource, id, fields)
      .then((result) => {
        res.json({ result });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(`Error get ${resource}/${id}/users: ${err}`);
        let msg = null;

        if (typeof err === 'string') {
          msg = err;
        }
        return errors.sendError.InternalError(msg, res);
      });
  }
);

const ggbUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: multerMw.ggbFileFilter,
});

router.post(
  '/upload/ggb',
  middleware.validateUser,
  ggbUpload.array('ggbFiles', 10),
  (req, res) => {
    const bufferFiles = req.files;

    if (!Array.isArray(bufferFiles)) {
      return res.json({ result: [] });
    }
    const base64Files = bufferFiles.map((fileObj) => {
      const { buffer } = fileObj;
      if (buffer) {
        return buffer.toString('base64');
      }
      // console.log('no buffer!');
      return errors.sendError('no buffer on fileObj while mapping files', res);
    });
    const compacted = _.compact(base64Files);
    return res.json({ result: compacted });
  }
);

router.post(
  '/:resource',
  middleware.validateUser,
  middleware.validateNewRecord,
  (req, res) => {
    const resource = getResource(req);
    const controller = controllers[resource];
    controller
      .post(req.body)
      .then((result) => res.json({ result }))
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(`Error post ${req.params.resource}: ${err}`);

        let msg = null;

        if (typeof err === 'string') {
          msg = err;
        }

        return errors.sendError.InternalError(msg, res);
      });
  }
);

router.put('/:resource/:id/add', middleware.validateUser, (req, res) => {
  const id = getParamsId(req);
  const resource = getResource(req);
  const controller = controllers[resource];

  const user = getUser(req);

  return middleware
    .canModifyResource(req)
    .then((results) => {
      const { canModify, doesRecordExist, details } = results;

      if (!doesRecordExist) {
        return errors.sendError.NotFoundError(null, res);
      }

      if (!canModify) {
        return errors.sendError.NotAuthorizedError(
          'You do not have permission to modify this resource',
          res
        );
      }

      const prunedBody = middleware.prunePutBody(user, id, req.body, details);
      return controller.add(id, prunedBody);
    })
    .then((result) => res.json(result))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`Error put/add ${resource}/${id}: ${err}`);

      let msg = null;

      if (typeof err === 'string') {
        msg = err;
      }

      return errors.sendError.InternalError(msg, res);
    });
});

router.put('/:resource/:id/remove', middleware.validateUser, (req, res) => {
  const id = getParamsId(req);
  const resource = getResource(req);
  const controller = controllers[resource];
  const user = getUser(req);
  req.params.remove = true; // Add remove to the params so we can allow users to modify their own status in  a resource (not just the resource owners) i.e. I should be able to remove myself from a course even if I'm not an owner of that course // THIS SHOULD BE DONE DIFFERENTLY CHECK req.USER and compare to member being removed
  return middleware
    .canModifyResource(req)
    .then((results) => {
      const { canModify, doesRecordExist, details } = results;
      if (!doesRecordExist) {
        return errors.sendError.NotFoundError(null, res);
      }

      if (!canModify) {
        return errors.sendError.NotAuthorizedError(
          'You do not have permission to modify this resource',
          res
        );
      }

      const prunedBody = middleware.prunePutBody(user, id, req.body, details);
      return controller.remove(id, prunedBody);
    })
    .then((result) => res.json(result))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`Error put/remove/${resource}/${id}: ${err}`);

      let msg = null;

      if (typeof err === 'string') {
        msg = err;
      }

      return errors.sendError.InternalError(msg, res);
    });
});

// updateResource is a helper fn for the following 2 put methods
const updateResource = (req, res) => {
  const id = getParamsId(req);
  const resource = getResource(req);
  const controller = controllers[resource];

  const user = getUser(req);

  if (resource === 'events') {
    return errors.sendError.BadMethodError('Events cannot be modified!', res);
  }
  return middleware.canModifyResource(req).then((results) => {
    const { canModify, doesRecordExist, details } = results;

    if (!doesRecordExist) {
      return errors.sendError.NotFoundError(null, res);
    }

    if (!canModify) {
      return errors.sendError.NotAuthorizedError(
        'You do not have permission to modify this resource',
        res
      );
    }
    const prunedBody = middleware.prunePutBody(user, id, req.body, details);
    return controller.put(id, prunedBody);
  });
  // .then((result) => res.json(result))
  // .catch((err) => {
  //   console.error(`Error put ${resource}/${id}: ${err}`);

  //   let msg = null;

  //   if (typeof err === 'string') {
  //     msg = err;
  //   }

  //   return errors.sendError.InternalError(msg, res);
  // });
};

router.put('/:resource/:id', middleware.validateUser, (req, res) => {
  const id = getParamsId(req);
  const resource = getResource(req);
  updateResource(req, res)
    .then((result) => res.json(result))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`Error put ${resource}/${id}: ${err}`);

      let msg = null;

      if (typeof err === 'string') {
        msg = err;
      }

      return errors.sendError.InternalError(msg, res);
    });
});

router.put('/archiveRooms', (req, res) => {
  const { ids = [] } = req.body;
  const body = { status: status.ARCHIVED };

  const updatedReq = setResource(req, 'rooms');

  // @TODO: Send all ids to mongo on archive / unarchive
  return Promise.all(
    ids.map((id) => {
      const newReq = setParamsId(updatedReq, id);
      return updateResource(
        {
          ...newReq,
          body,
        },
        res
      ).catch((err) => {
        // eslint-disable-next-line no-console
        console.error(`Error put rooms/${id}: ${err}`);

        let msg = null;

        if (typeof err === 'string') {
          msg = err;
        }

        return errors.sendError.InternalError(msg, res);
      });
    })
  ).then(() => res.sendStatus(200));
});

router.put('/addMemberToArchivedRooms', (req, res) => {
  const { member, archivedRoomIds } = req.body;
  const roomController = controllers.rooms;
  const userController = controllers.user;
  // add archivedRooms to user's archive
  // add the user to all archived rooms
  const promises = archivedRoomIds.map((roomId) =>
    roomController.addMember(roomId, member)
  );
  promises.push(
    userController.addArchivedRooms(member.user._id, archivedRoomIds)
  );

  return Promise.all(promises)
    .then(() => res.sendStatus(200))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`Error adding member to archived rooms: ${err}`);

      let msg = null;

      if (typeof err === 'string') {
        msg = err;
      }

      return errors.sendError.InternalError(msg, res);
    });
});

router.put('/updateUsernames', (req, res) => {
  const { users } = req.body;
  const userController = controllers.user;
  return userController
    .updateUsernames(users)
    .then(() => res.sendStatus(200))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`Error updating usernames: ${err}`);

      let msg = null;

      if (typeof err === 'string') {
        msg = err;
      }

      return errors.sendError.InternalError(msg, res);
    });
});

// router.delete("/:resource/:id", middleware.validateUser, (req, res, next) => {
//   // for now delete not supported
//   // add isTrashed?
//   return errors.sendError.BadMethodError(
//     "Sorry, DELETE is not supported for this resource.",
//     res
//   );

//   let { resource, id } = req.params;
//   let controller = controllers[resource];

//   controller
//     .delete(id)
//     .then(result => res.json(result))
//     .catch(err => {
//       console.error(`Error delete ${resource}/${id}: ${err}`);

//       let msg = null;

//       if (typeof err === "string") {
//         msg = err;
//       }

//       return errors.sendError.InternalError(msg, res);
//     });
// });

module.exports = router;
