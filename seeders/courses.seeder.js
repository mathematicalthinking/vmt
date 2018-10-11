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
    "members": [
      {
        "user": "5ba289ba7223b9429888b9b4",
        "role": "teacher"
      }
    ],
    "creator": "5ba289ba7223b9429888b9b4", // jl-picard
    "__v": 0
  }
];

var RoomsSeeder = Seeder.extend({
  shouldRun: function () {
    return Course.count().exec().then(count => count === 0);
  },
  run: function () {
    return Course.create(data);
  }
});

module.exports = RoomsSeeder;
