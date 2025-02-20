const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;
const User = require('./User');
const Course = require('./Course');
const Image = require('./Image');
const Notification = require('./Notification');
const Activity = require('./Activity');
const STATUS = require('../constants/status');
const ROLE = require('../constants/role');

const colorMap = require('../constants/colorMap.js');

const Room = new mongoose.Schema(
  {
    activity: { type: ObjectId, ref: 'Activity' },
    name: { type: String, required: true },
    description: { type: String },
    instructions: { type: String },
    entryCode: { type: String },
    course: { type: ObjectId, ref: 'Course' },
    creator: { type: ObjectId, ref: 'User' },
    dueDate: { type: Date },
    chat: { type: [{ type: ObjectId, ref: 'Message' }], default: [] },
    members: [
      {
        // _id: false,
        user: { type: ObjectId, ref: 'User' },
        color: {
          type: String,
          default: colorMap[0],
        },
        role: {
          type: String,
          enum: [ROLE.PARTICIPANT, ROLE.FACILITATOR, ROLE.GUEST],
        },
        alias: { type: String },
        course: { type: ObjectId, ref: 'Course' },
        currentTab: { type: ObjectId, ref: 'Tab' },
      },
    ],
    currentMembers: {
      type: [
        {
          _id: { type: ObjectId, ref: 'User' },
          username: String,
          tab: { type: ObjectId, ref: 'Tab' },
        },
      ],
      default: [],
    },

    tabs: { type: [{ type: ObjectId, ref: 'Tab' }] },
    privacySetting: {
      type: String,
      enum: ['private', 'public'],
      default: 'private',
    },
    tempRoom: { type: Boolean, default: false },
    image: { type: String },
    settings: {
      participantsCanCreateTabs: { type: Boolean, default: false },
      participantsCanChangePerspective: { type: Boolean, default: false },
      independentTabControl: { type: Boolean, default: false },
      displayAliasedUsernames: { type: Boolean, default: false },
    },
    graphImage: { type: ObjectId, ref: 'Image' },
    controlledBy: { type: ObjectId, ref: 'User', default: null },
    // wasNew: {type: Boolean},
    isTrashed: { type: Boolean, default: false },
    groupId: { type: String },
    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.DEFAULT,
    },
    dbUpdatedAt: { type: Date },
  },
  { timestamps: true }
);

Room.index({ isTrashed: 1, status: 1 });
Room.index({ course: 1 });
Room.index({ activity: 1 });

// The chatCount field is used when users log in. Rather than storing the entire chat history in the redux store,
// we only store the number of chat messages. When the user enters a room, we fetch the chat messages from the server.
// (along with the entire populated room object).
Room.virtual('chatCount').get(function() {
  // console.log(this.name, this.chat);
  return this.chat ? this.chat.length : 0;
});
Room.set('toJSON', { getters: true, virtuals: true });
Room.set('toObject', { getters: true, virtuals: true });

Room.pre('save', function(next) {
  this.dbUpdatedAt = Date.now();
  if (this.isNew) {
    this.wasNew = this.isNew;
    next();
  } else if (this.modifiedPaths().length > 0) {
    this.modifiedPaths().forEach((field) => {
      // if (field === "members") {
      //   User.findByIdAndUpdate(this.members[this.members.length - 1].user, {
      //     $addToSet: { rooms: this._id }
      //   })
      //     .then(user => {
      //       next();
      //     })
      //     .catch(err => console.log(err));
      // } else
      if (field === 'tempRoom') {
        User.findByIdAndUpdate(this.creator, { $addToSet: { rooms: this._id } })
          .then(() => {
            next();
          })
          // eslint-disable-next-line no-console
          .catch((err) => console.log(err));
      } else if (field === 'currentMembers') {
        // console.log('current members modified what we can do with tha info...how do we tell WHO was added')
        // console.log(this)
      } else if (field === 'isTrashed' && this.isTrashed) {
        // delete all ntfs related to this resource. Is this redundant with what happens in RoomController?
        Notification.find({ resourceId: this._id })
          .then((ntfs) => {
            Promise.all(
              ntfs.map((ntf) => {
                ntf.isTrashed = true;
                return ntf.save();
              })
            ).then(() => {
              next();
            });
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.log(err);
            next(err);
          });
      } else {
        next();
      }
    });
  } else {
    next();
  }
});

function updateTimestamp(next) {
  this._update = this._update || {};
  this._update.$set = this._update.$set || {};
  this._update.$set.dbUpdatedAt = Date.now();
  next();
}

Room.pre('update', updateTimestamp);

Room.pre('findOneAndUpdate', updateTimestamp);

Room.pre('findByIdAndUpdate', updateTimestamp);

Room.post('save', function(doc, next) {
  if (this.wasNew && !this.tempRoom) {
    this.wasNew = false;

    let promises = [];
    promises.push(Image.create({ imageData: '' }));
    // Add the room to all of the users in this room
    promises = promises.concat(
      this.members.map((member) => {
        // add a new room notification if they're not the creator
        // const query = { $addToSet: { rooms: this._id } };
        // @TODO use notification schema
        let notification;
        if (member.user.toString() !== this.creator.toString()) {
          notification = {
            notificationType: 'assignedNewRoom',
            resourceType: 'room',
            resourceId: this._id,
            parentResource: this.course,
            fromUser: this.creator, // SHOULD ACTUALLY BE FACILITATOR...BUT HOW DO WE HANDLE MULTIPLE FACILITATORS
            toUser: member.user,
          };
          // Creating a notification of type assignedNewRoom will automatically add this room
          // to the users room list as part of the pre save hook')
          return Notification.create(notification);
        }
        // We only want to create notifications for participants
        // If we don't create a ntf the user doesnt get the room added to their list in the pre save hook
        // so we do it here
        return User.findByIdAndUpdate(this.creator, {
          $addToSet: { rooms: this._id },
        });
      })
    );
    // promises.push(User.findByIdAndUpdate(this.creator, {$addToSet: {rooms: this._id}}))
    if (this.course) {
      promises.push(
        Course.findByIdAndUpdate(this.course, {
          $addToSet: { rooms: this._id },
        })
      );
    }
    if (this.activity) {
      promises.push(
        Activity.findByIdAndUpdate(this.activity, {
          $addToSet: { rooms: this._id },
        })
      );
    }
    Promise.all(promises)
      .then((values) => {
        if (values[0]) {
          this.graphImage = values[0]._id;
        }
        next();
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(err);
        next(err);
      }); // @TODO WE NEED ERROR HANDLING HERE
  } else {
    next();
  }
});

Room.methods.summary = function() {
  // @TODO ONLY RETURN THE ENTRY CODE IF THE CLIENT IS THE OWNER
  const obj = {
    entryCode: this.entryCode,
    activity: this.activity,
    name: this.name,
    description: this.description,
    privacySetting: this.privacySetting,
    roomType: this.roomType,
    course: this.course,
    creator: this.creator,
    dueDate: this.dueDate,
    members: this.members,
    tabs: this.tabs,
    events: this.events,
    chat: this.chat,
    image: this.image,
    _id: this._id,
  };
  return obj;
  // next();
};

module.exports = mongoose.model('Room', Room);
