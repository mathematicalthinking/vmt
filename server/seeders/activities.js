/* 1 */
const { ObjectId, ISODate } = require('./utils');

module.exports = [
  {
    _id: ObjectId('5bd1da254b2d4b2a6c45def7'),
    courses: [],
    users: [],
    roomType: 'geogebra',
    privacySetting: 'private',
    rooms: [],
    events: [],
    tabs: [ObjectId('5d3b493dca44f53a90a9ed35')],
    isTrashed: false,
    name: 'stand-alone-activity',
    description: '',
    creator: ObjectId('5ba289ba7223b9429888b9b4'),
    image:
      'http://tinygraphs.com/isogrids/ACTIVITY 1?theme=daisygarden&numcolors=4&size=220&fmt=svg',
    desmosLink: '',
    createdAt: ISODate('2018-10-25T14:58:45.945Z'),
    updatedAt: ISODate('2018-10-25T14:58:45.945Z'),
    __v: 0,
  },

  /* 2 */
  {
    _id: ObjectId('5be1f0c83efa5f308cefb4c0'),
    courses: [],
    users: [],
    roomType: 'geogebra',
    privacySetting: 'private',
    rooms: [],
    events: [],
    tabs: [ObjectId('5d3b493dca44f53a90a9ed35')],
    isTrashed: false,
    name: 'ACTIVITY 2',
    description: '',
    creator: ObjectId('5ba289ba7223b9429888b9b4'),
    image:
      'http://tinygraphs.com/isogrids/ACTIVITY 2?theme=daisygarden&numcolors=2&size=220&fmt=svg',
    desmosLink: '',
    createdAt: ISODate('2018-10-25T14:58:45.945Z'),
    updatedAt: ISODate('2018-10-25T14:58:45.945Z'),
    __v: 0,
  },

  /* 3 */
  {
    _id: ObjectId('5c2e58e9684f328cbca1d99a'),
    courses: [],
    users: [],
    roomType: 'geogebra',
    privacySetting: 'public',
    rooms: [],
    events: [],
    tabs: [ObjectId('5c2e58e9684f328cbca1d99c')],
    isTrashed: false,
    name: "Deanna's stand alone activity",
    description: '',
    creator: ObjectId('5be1eba75854270cd0920faa'),
    ggbFile: '',
    image:
      'http://tinygraphs.com/isogrids/fgfdgdfg?theme=sugarsweets&numcolors=4&size=220&fmt=svg',
    createdAt: ISODate('2019-01-03T18:48:09.661Z'),
    updatedAt: ISODate('2019-01-03T18:48:09.661Z'),
    __v: 0,
  },

  /* 4 */
  {
    _id: ObjectId('5bd1da254b2d4b2a6c45cf8a'),
    courses: [],
    users: [],
    roomType: 'geogebra',
    privacySetting: 'private',
    rooms: [],
    events: [],
    tabs: [ObjectId('5d3b493dca44f53a90a9ed35')],
    isTrashed: false,
    name: 'ACTIVITY 1',
    description: '',
    creator: ObjectId('5ba289ba7223b9429888b9a1'),
    image:
      'http://tinygraphs.com/isogrids/ACTIVITY 1?theme=daisygarden&numcolors=4&size=220&fmt=svg',
    desmosLink: '',
    createdAt: ISODate('2018-10-25T14:58:45.945Z'),
    updatedAt: ISODate('2018-10-25T14:58:45.945Z'),
    __v: 0,
  },

  /* 5 */
  {
    _id: ObjectId('5c2e58e9684f328cbca1d99b'),
    courses: [],
    users: [],
    roomType: 'geogebra',
    privacySetting: 'public',
    rooms: [],
    events: [],
    tabs: [ObjectId('5d7bd9bde1f24148ffa81059')],
    isTrashed: false,
    name: "Deanna's course 1 activity",
    description: '',
    creator: ObjectId('5be1eba75854270cd0920faa'),
    ggbFile: '',
    course: ObjectId('5c2e58db684f328cbca1d995'),
    image:
      'http://tinygraphs.com/isogrids/fgfdgdfg?theme=sugarsweets&numcolors=4&size=220&fmt=svg',
    createdAt: ISODate('2019-01-03T18:48:09.661Z'),
    updatedAt: ISODate('2019-01-03T18:48:09.661Z'),
    __v: 0,
  },

  /* 6 */
  {
    _id: ObjectId('5c2e58e9684f328cbca1d99c'),
    courses: [],
    users: [],
    roomType: 'geogebra',
    privacySetting: 'public',
    rooms: [],
    events: [],
    tabs: [ObjectId('5d7bd90dc5770e47a40c44ed')],
    isTrashed: false,
    name: "Deanna's course 2 activity",
    description: '',
    creator: ObjectId('5be1eba75854270cd0920faa'),
    ggbFile: '',
    course: ObjectId('5c2e58db684f328cbca1d995'),
    image:
      'http://tinygraphs.com/isogrids/fgfdgdfg?theme=sugarsweets&numcolors=4&size=220&fmt=svg',
    createdAt: ISODate('2019-01-03T18:48:09.661Z'),
    updatedAt: ISODate('2019-01-03T18:48:09.661Z'),
    __v: 0,
  },
];
