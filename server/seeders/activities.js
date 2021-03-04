/* 1 */
const { ObjectId, ISODate } = require('./utils');

module.exports = [
  /* 1 */
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
      'https://www.tinygraphs.com/isogrids/ACTIVITY%201?theme=daisygarden&numcolors=4&size=220&fmt=svg',
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
      'https://www.tinygraphs.com/isogrids/ACTIVITY%202?theme=daisygarden&numcolors=2&size=220&fmt=svg',
    desmosLink: '',
    createdAt: ISODate('2018-10-25T13:58:45.945Z'),
    updatedAt: ISODate('2018-10-25T13:58:45.945Z'),
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
    tabs: [ObjectId('5d83e970753c000d8e999d2b')],
    isTrashed: false,
    name: "Deanna's stand alone activity",
    description: '',
    creator: ObjectId('5be1eba75854270cd0920faa'),
    ggbFile: '',
    image:
      'https://www.tinygraphs.com/isogrids/fgfdgdfg?theme=sugarsweets&numcolors=4&size=220&fmt=svg',
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
    creator: ObjectId('5ba289ba7223b9429888b9b4'),
    image:
      'https://www.tinygraphs.com/isogrids/ACTIVITY%201?theme=daisygarden&numcolors=4&size=220&fmt=svg',
    desmosLink: '',
    createdAt: ISODate('2018-10-25T12:58:36.945Z'),
    updatedAt: ISODate('2018-10-25T12:58:36.945Z'),
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
      'https://www.tinygraphs.com/isogrids/fgfdgdfg?theme=sugarsweets&numcolors=4&size=220&fmt=svg',
    createdAt: ISODate('2019-01-03T17:48:09.661Z'),
    updatedAt: ISODate('2019-01-03T17:48:09.661Z'),
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
      'https://www.tinygraphs.com/isogrids/fgfdgdfg?theme=sugarsweets&numcolors=4&size=220&fmt=svg',
    createdAt: ISODate('2019-01-03T17:49:09.661Z'),
    updatedAt: ISODate('2019-01-03T17:49:09.661Z'),
    __v: 0,
  },

  /* 7 */
  {
    _id: ObjectId('5d83f3e015329f5bfcd49c1a'),
    courses: [ObjectId('5d83f32415329f5bfcd49c0c')],
    users: [],
    roomType: 'geogebra',
    privacySetting: 'private',
    rooms: [ObjectId('5d83f42e15329f5bfcd49c21')],
    events: [],
    tabs: [ObjectId('5d83f3e015329f5bfcd49c1b')],
    isTrashed: false,
    name: 'ssmith c1: math is fun',
    description: '',
    desmosLink: '',
    creator: ObjectId('5d1a59d79c78ad48c0480caa'),
    course: ObjectId('5d83f32415329f5bfcd49c0c'),
    image:
      'https://www.tinygraphs.com/isogrids/ssmith%20c1:%20math%20is%20fun?theme=summerwarmth&numcolors=4&size=220&fmt=svg',
    createdAt: ISODate('2019-09-19T21:32:16.915Z'),
    updatedAt: ISODate('2019-09-19T21:32:16.922Z'),
    __v: 0,
  },

  /* 8 */
  {
    _id: ObjectId('5d83f3fc15329f5bfcd49c1d'),
    courses: [ObjectId('5d83f32415329f5bfcd49c0c')],
    users: [],
    roomType: 'geogebra',
    privacySetting: 'private',
    rooms: [],
    events: [],
    tabs: [ObjectId('5d83f3fc15329f5bfcd49c1e')],
    isTrashed: false,
    name: 'ssmith c1: integrals',
    description: '',
    desmosLink: '',
    creator: ObjectId('5d1a59d79c78ad48c0480caa'),
    course: ObjectId('5d83f32415329f5bfcd49c0c'),
    image:
      'https://www.tinygraphs.com/isogrids/ssmith%20c1:%20integrals?theme=frogideas&numcolors=4&size=220&fmt=svg',
    createdAt: ISODate('2019-09-19T21:32:44.582Z'),
    updatedAt: ISODate('2019-09-19T21:32:44.589Z'),
    __v: 0,
  },
];
