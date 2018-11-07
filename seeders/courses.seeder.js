var Seeder = require('mongoose-data-seed').Seeder;
var Course = require('../models/Course')

var data = [
  {
    "_id": "5bbb82f72539b95500cf526e",
    "activities": [],
    "rooms": [],
    "isPublic": false,
    "name": "course 1",
    "description": "",
    "activities": ["5be1f0c83efa5f308cefb4c0"],
    "members": [
      {
        "user": "5ba289ba7223b9429888b9b4",
        "role": "facilitator"
      },
    ],
    "creator": "5ba289ba7223b9429888b9b4", // jl-picard
    // "createdAt" : "2018-10-13T13:57:01.351Z",
    "__v": 0
  },
  {
    "_id": "5bbb82f72539b95500cf526a",
    "activities": [],
    "rooms": [],
    "isPublic": false,
    "name": "entry-code course",
    "entryCode": "entry-code-10",
    "description": "",
    "members": [
      {
        "user": "5ba289ba7223b9429888b9b4",
        "role": "facilitator"
      }
    ],
    "creator": "5ba289ba7223b9429888b9b4", // jl-picard
    // "createdAt" : "2018-10-14T13:57:01.351Z",
    "__v": 0
  },
  {
    "_id": "5bbf4e5ec1b6d84cb0a4ded8",
    "activities": ["5be1f0c83efa5f308cefb4c0"],
    "rooms": [],
    "isPublic": false,
    "name": "course 2",
    "description": "",
    "members": [
      {
        "user": "5ba289ba7223b9429888b9b4",
        "role": "facilitator"
      },
      {
        "user": "5bbbbd9a799302265829f5af", // g-laForge
        "role": "participant",
      },
      {
        "user": "5be1eba75854270cd0920fb8", // data
        "role": "participant"
      },
      {
        "user": "5be1eba75854270cd0920fa9", // worf
        "role": "participant"
      }

    ],
    "creator": "5ba289ba7223b9429888b9b4", // jl-picard
    // "createdAt" : "2018-10-15T13:57:01.351Z",
    "__v": 0
  },  {
    "_id": "5bbf4e5ec1b6d84cb0a4ded3",
    "activities": [],
    "rooms": [],
    "isPublic": false,
    "name": "wrong entry code course",
    "entryCode": "rare-shrimp-45",
    "description": "",
    "members": [
      {
        "user": "5ba289ba7223b9429888b9b4",
        "role": "facilitator"
      },
    ],
    "creator": "5ba289ba7223b9429888b9b4", // jl-picard,
    // "createdAt" : "2018-10-16T13:57:01.351Z",
    "__v": 0
  }
];

var CoursesSeeder = Seeder.extend({
  shouldRun: function () {
    return Course.count().exec().then(count => count === 0);
  },
  run: function () {
    return Course.create(data);
  }
});

module.exports = CoursesSeeder;
