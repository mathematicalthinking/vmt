/* 1 */
const { ObjectId, ISODate } = require('./utils');

module.exports = [
  /* 1 */
  {
    _id: ObjectId('5bbf4e5ec1b6d84cb0a4ded8'),
    activities: [ObjectId('5be1f0c83efa5f308cefb4c0')],
    rooms: [],
    privacySetting: 'private',
    isTrashed: false,
    name: 'course 2',
    description: '',
    members: [
      {
        user: ObjectId('5ba289ba7223b9429888b9b4'),
        role: 'facilitator',
      },
      {
        user: ObjectId('5bbbbd9a799302265829f5af'),
        role: 'participant',
      },
      {
        user: ObjectId('5be1eba75854270cd0920fb8'),
        role: 'participant',
      },
      {
        user: ObjectId('5be1eba75854270cd0920fa9'),
        role: 'participant',
      },
    ],
    creator: ObjectId('5ba289ba7223b9429888b9b4'),
    __v: 0,
    createdAt: ISODate('2019-06-21T17:08:26.662Z'),
    updatedAt: ISODate('2019-06-21T17:08:26.662Z'),
  },

  /* 2 */
  {
    _id: ObjectId('5c2e58db684f328cbca1d995'),
    activities: [ObjectId('5c2e58e9684f328cbca1d99b')],
    rooms: [ObjectId('5c2e58e4684f328cbca1d99f')],
    privacySetting: 'public',
    isTrashed: false,
    name: "Deanna's course 1",
    description: '',
    creator: ObjectId('5be1eba75854270cd0920faa'),
    image:
      'http://tinygraphs.com/labs/isogrids/hexa16/course 1?theme=duskfalling&numcolors=4&size=220&fmt=svg',
    members: [
      {
        user: ObjectId('5be1eba75854270cd0920faa'),
        role: 'facilitator',
      },
    ],
    createdAt: ISODate('2019-01-03T18:47:55.075Z'),
    updatedAt: ISODate('2019-01-03T18:47:55.075Z'),
    __v: 0,
  },

  /* 3 */
  {
    _id: ObjectId('5bbf4e5ec1b6d84cb0a4ded3'),
    activities: [],
    rooms: [],
    privacySetting: 'private',
    isTrashed: false,
    name: 'wrong entry code course',
    entryCode: 'rare-shrimp-45',
    description: '',
    members: [
      {
        user: ObjectId('5ba289ba7223b9429888b9b4'),
        role: 'facilitator',
      },
    ],
    creator: ObjectId('5ba289ba7223b9429888b9b4'),
    __v: 0,
    createdAt: ISODate('2019-06-21T16:08:26.662Z'),
    updatedAt: ISODate('2019-06-21T16:08:26.662Z'),
  },

  /* 4 */
  {
    _id: ObjectId('5bbb82f72539b95500cf526e'),
    activities: [ObjectId('5be1f0c83efa5f308cefb4c0')],
    rooms: [],
    privacySetting: 'private',
    isTrashed: false,
    name: 'course 1',
    description: '',
    members: [
      {
        user: ObjectId('5ba289ba7223b9429888b9b4'),
        role: 'facilitator',
      },
    ],
    creator: ObjectId('5ba289ba7223b9429888b9b4'),
    __v: 0,
    createdAt: ISODate('2019-06-21T14:54:26.661Z'),
    updatedAt: ISODate('2019-06-21T14:54:26.661Z'),
  },

  /* 5 */
  {
    _id: ObjectId('5bbb82f72539b95500cf526a'),
    activities: [],
    rooms: [],
    privacySetting: 'private',
    isTrashed: false,
    name: 'entry-code course',
    entryCode: 'entry-code-10',
    description: '',
    members: [
      {
        user: ObjectId('5ba289ba7223b9429888b9b4'),
        role: 'facilitator',
      },
    ],
    creator: ObjectId('5ba289ba7223b9429888b9b4'),
    __v: 0,
    createdAt: ISODate('2019-06-21T17:09:26.661Z'),
    updatedAt: ISODate('2019-06-21T17:09:26.661Z'),
  },

  /* 6 */
  {
    _id: ObjectId('5c2e58db684f328cbca1d999'),
    activities: [ObjectId('5c2e58e9684f328cbca1d99c')],
    rooms: [ObjectId('5c2e58e4684f328cbca1d99e')],
    privacySetting: 'public',
    isTrashed: true,
    name: "Deanna's course 2",
    description: '',
    creator: ObjectId('5be1eba75854270cd0920faa'),
    image:
      'http://tinygraphs.com/labs/isogrids/hexa16/course 1?theme=duskfalling&numcolors=4&size=220&fmt=svg',
    members: [
      {
        user: ObjectId('5be1eba75854270cd0920faa'),
        role: 'facilitator',
      },
    ],
    createdAt: ISODate('2019-01-03T18:48:55.075Z'),
    updatedAt: ISODate('2019-01-03T18:48:55.075Z'),
    __v: 0,
  },

  /* 7 */
  {
    _id: ObjectId('5d83f32415329f5bfcd49c0c'),
    activities: [
      ObjectId('5d83f3e015329f5bfcd49c1a'),
      ObjectId('5d83f3fc15329f5bfcd49c1d'),
    ],
    rooms: [
      ObjectId('5d83f39a15329f5bfcd49c0f'),
      ObjectId('5d83f3b615329f5bfcd49c15'),
    ],
    privacySetting: 'private',
    isTrashed: false,
    name: 'ssmith course 1',
    description: 'test course',
    creator: ObjectId('5d1a59d79c78ad48c0480caa'),
    image:
      'http://tinygraphs.com/labs/isogrids/hexa16/ssmith course 1?theme=berrypie&numcolors=4&size=220&fmt=svg',
    entryCode: 'massive-elephant-32',
    members: [
      {
        user: ObjectId('5d1a59d79c78ad48c0480caa'),
        role: 'facilitator',
      },
    ],
    createdAt: ISODate('2019-09-19T21:29:08.386Z'),
    updatedAt: ISODate('2019-09-19T21:32:44.583Z'),
    __v: 0,
  },
];
