/* eslint-disable no-throw-literal */
const _ = require('lodash');
const db = require('../models');
const ROLE = require('../constants/role');

module.exports = {
  get: (params) => {
    return new Promise((resolve, reject) => {
      if (params && params.constructor === Array) {
        params = { _id: { $in: params } };
      }
      db.Course.find(params || {})
        .sort('-createdAt')
        .populate({ path: 'members.user', select: 'username' })
        .then((courses) => resolve(courses))
        .catch((err) => reject(err));
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.Course.findById(id)
        // .populate('creator')
        // .populate('rooms', 'name ')
        .populate('members.user', 'username')
        // .populate('notifications.user')
        .then((course) => resolve(course))
        .catch((err) => reject(err));
    });
  },

  // @TODO consider what params might be and how to handle them.
  // populates a course to match what's in the redux store.
  getPopulatedById: (id) => {
    return new Promise((resolve, reject) => {
      (Array.isArray(id)
        ? db.Course.find({ _id: { $in: id } })
        : db.Course.findById(id)
      )
        .populate('members.user', 'username')
        .populate('rooms')
        .populate({
          path: 'rooms',
          populate: {
            path: 'creator members.user currentMembers course tabs',
            select: 'username name tabType desmosLink',
          },
        })
        .populate({
          path: 'activities',
          populate: { path: 'tabs', select: 'name tabType desmosLink' },
        })
        .then((course) => resolve(course))
        .catch((err) => reject(err));
    });
  },

  getByCode: (code) => {
    return new Promise((resolve, reject) => {
      const query = {};
      query.entryCode = code;
      query.isTrashed = false;
      db.Course.find(query)
        .sort('-createdAt')
        // .populate('creator')
        // .populate('rooms', 'name ')
        .populate('members.user')
        // .populate('notifications.user')
        .then((courses) => resolve(courses))
        .catch((err) => reject(err));
    });
  },

  searchPaginated: async (criteria, skip, filters) => {
    const initialFilter = { isTrashed: false };
    const allowedPrivacySettings = ['private', 'public'];

    if (allowedPrivacySettings.includes(filters.privacySetting)) {
      initialFilter.privacySetting = filters.privacySetting;
    }

    let aggregationPipeline = [
      { $match: initialFilter },
      {
        $project: {
          _id: 1,
          name: 1,
          instructions: 1,
          description: 1,
          image: 1,
          privacySetting: 1,
          updatedAt: 1,
          members: {
            $filter: {
              input: '$members',
              as: 'member',
              cond: {
                $eq: ['$$member.role', ROLE.FACILITATOR],
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'members.user',
          foreignField: '_id',
          as: 'facilitatorObject',
        },
      },

      {
        $project: {
          _id: 1,
          name: 1,
          instructions: 1,
          description: 1,
          image: 1,
          tabs: 1,
          privacySetting: 1,
          updatedAt: 1,
          facilitatorUsernames: {
            $map: {
              input: '$facilitatorObject',
              as: 'facilitator',
              in: '$$facilitator.username',
            },
          },
          // map through the members, keeping just the role and the user object
          members: {
            $map: {
              input: '$members',
              as: 'member',
              in: {
                role: '$$member.role',
                user: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$facilitatorObject',
                        as: 'facilitator',
                        cond: { $eq: ['$$facilitator._id', '$$member.user'] },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },
        },
      },
    ];

    if (criteria) {
      aggregationPipeline.push({
        $match: {
          $or: [
            { name: criteria },
            { description: criteria },
            { instructions: criteria },
            { facilitatorUsernames: criteria },
          ],
        },
      });
    }
    aggregationPipeline = aggregationPipeline.concat([
      {
        $project: {
          _id: 1,
          name: 1,
          instructions: 1,
          description: 1,
          privacySetting: 1,
          image: 1,
          updatedAt: 1,
          // put each member into the proper form, keeping only the _id and username
          members: {
            $map: {
              input: '$members',
              as: 'member',
              in: {
                role: '$$member.role',
                user: {
                  _id: '$$member.user._id',
                  username: '$$member.user.username',
                },
              },
            },
          },
        },
      },
    ]);

    aggregationPipeline.push({ $sort: { updatedAt: -1 } });

    if (skip) {
      aggregationPipeline.push({ $skip: parseInt(skip, 10) });
    }
    aggregationPipeline.push({ $limit: 20 });
    const courses = await db.Course.aggregate(aggregationPipeline).allowDiskUse(
      true
    );
    return courses;
  },

  post: (body) => {
    // check if we should make a template from this course
    return new Promise((resolve, reject) => {
      if (body.template) {
        const { name, description, templatePrivacySetting, creator } = body;
        const template = {
          name,
          description,
          privacySetting: templatePrivacySetting,
          creator,
        };
        db.CourseTemplate.create(template)
          .then((createdTemplate) => {
            body.template = createdTemplate._id;
            delete body[templatePrivacySetting];
            db.Course.create(body)
              .then((course) => resolve([course, template]))
              .catch((err) => reject(err));
          })
          .catch((err) => {
            console.log(err);
            reject(err);
          });
      } else {
        delete body.templatePrivacySetting;
        delete body.template;
        db.Course.create(body)
          .then((course) => {
            course.populate({ path: 'members.user', select: 'username' }, () =>
              resolve(course)
            );
          })
          .catch((err) => {
            console.log(err);
            reject(err);
          });
      }
    });
  },

  add: (id, body) => {
    return new Promise((resolve, reject) => {
      // Send a notification to user that they've been granted access to a new course

      let members;
      let course;
      const { ntfType } = body;
      delete body.ntfType;
      db.Course.findByIdAndUpdate(id, { $addToSet: body }, { new: true })
        .populate({ path: 'members.user', select: 'username' })
        .then((res) => {
          course = res;
          return db.User.findByIdAndUpdate(body.members.user, {
            $addToSet: {
              courses: id,
            },
          });
        })
        .then(() => {
          ({ members } = course);
          return db.Notification.create({
            resourceType: 'course',
            resourceId: id,
            toUser: body.members.user,
            notificationType: ntfType,
          });
        })
        .then(() => resolve(members))
        .catch((err) => reject(err));
    });
  },

  remove: (id, body) => {
    return new Promise((resolve, reject) => {
      // Remove this course from the user's list of courses
      // @TODO remove any notifictions associated with this resource
      return db.User.findByIdAndUpdate(
        body.members.user,
        {
          $pull: { courses: id },
        },
        { new: true }
      )
        .then(() => {
          return db.Course.findByIdAndUpdate(
            id,
            { $pull: body },
            { new: true }
          ).populate({ path: 'members.user', select: 'username' });
        })
        .then((res) => resolve(res.members))
        .catch((err) => reject(err));
    });
  },

  put: (id, body) => {
    let courseToPopulate;
    let userToAdd;

    return new Promise((resolve, reject) => {
      if (body.checkAccess) {
        const { entryCode, userId } = body.checkAccess;
        db.Course.findById(id)
          .then((course) => {
            // @todo SHOULD PROBABLY HASH THIS AND MOVE TO AUTH ROUTE
            userToAdd = userId;
            // throw error if incorrect entry code
            if (
              course.entryCode !== entryCode &&
              course.privacySetting === 'private'
            ) {
              // eslint-disable-next-line no-throw-literal
              throw 'Incorrect Entry Code';
            }

            // throw error if user is already member of course
            // member.user is type object, userId is string
            if (
              _.find(
                course.members,
                (member) => member.user.toString() === userId
              )
            ) {
              throw 'You already have been granted access to this course!';
            }
            course.members.push({ user: userId, role: 'participant' });
            return course.save();
          })
          .then((updatedCourse) => {
            courseToPopulate = updatedCourse;
            return db.User.findByIdAndUpdate(
              userToAdd,
              { $addToSet: { courses: updatedCourse._id } },
              { new: true }
            );
          })
          .then(() => {
            const facilitators = courseToPopulate.members.filter(
              (member) => member.role === 'facilitator'
            );
            return Promise.all(
              facilitators.map((facilitator) => {
                return db.Notification.create({
                  resourceType: 'course',
                  resourceId: courseToPopulate._id,
                  notificationType: 'newMember',
                  toUser: facilitator.user,
                  fromUser: userId,
                });
              })
            );
          })
          .then(() => {
            return courseToPopulate.populate(
              { path: 'members.user', select: 'username' },
              (err, pop) => {
                if (err) {
                  return reject(err);
                }
                return resolve(pop);
              }
            );
          })
          .catch((err) => {
            reject(err);
          });
      } else if (body.isTrashed) {
        let updatedCourse;
        db.Course.findByIdAndUpdate(id, body, { new: true })
          .then((course) => {
            updatedCourse = course;
            const userIds = course.members.map((member) => member.user);
            // Delete any notifications associated with this course
            return db.Notification.find({ resourceId: id }).then((ntfs) => {
              const ntfIds = ntfs.map((ntf) => ntf._id);
              const promises = [
                db.User.update(
                  { _id: { $in: userIds } },
                  {
                    $pull: {
                      courses: course._id,
                      notifications: { $in: ntfIds },
                    },
                  },
                  { multi: true }
                ),
              ];
              promises.push(
                db.Notification.deleteMany({ _id: { $in: ntfIds } })
              );
              if (body.trashChildren) {
                promises.push(
                  course.rooms.map((room) =>
                    db.Room.findById(room).then((foundRoom) => {
                      foundRoom.isTrashed = true;
                      foundRoom.save();
                    })
                  )
                );
                promises.push(
                  course.activities.map((activity) =>
                    db.Activity.findById(activity).then((foundActivity) => {
                      foundActivity.isTrashed = true;
                      foundActivity.save();
                    })
                  )
                );
                // promises.push()
              }
              return Promise.all(promises);
            });
          })
          .then(() => resolve(updatedCourse))
          .catch((err) => reject(err));
      } else {
        db.Course.findById(id)
          .then((course) => {
            Object.keys(body).forEach((key) => {
              course[key] = body[key];
            });
            return course.save();
          })
          .then((updatedCourse) => {
            return updatedCourse.populate(
              { path: 'members.user', select: 'username' },
              (err, pop) => {
                return resolve(pop);
              }
            );
          })
          .catch((err) => {
            reject(err);
          });
      }
    });
  },

  // delete: id => {
  //   return new Promise((resolve, reject) => {
  //     db.Course.findById(id)
  //       .then(course => {
  //         course.remove();
  //         resolve(course);
  //       })
  //       .catch(err => reject(err));
  //   });
  // }
};
