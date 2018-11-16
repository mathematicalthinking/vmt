var Seeder = require('mongoose-data-seed').Seeder;
var Activity = require('../models/Activity')

var data = [
  {
    "_id" : "5bd1da254b2d4b2a6c45cf8a",
    "roomType" : "geogebra",
    "rooms" : [],
    "events" : [],
    "name" : "ACTIVITY 1",
    "description" : "",
    "creator" : "5ba289ba7223b9429888b9a1", // NO ONE,
    "image" : "http://tinygraphs.com/isogrids/ACTIVITY 1?theme=daisygarden&numcolors=4&size=220&fmt=svg",
    "desmosLink" : "",
    "createdAt" : "2018-10-25T14:58:45.945Z",
    "updatedAt" : "2018-10-25T14:58:45.945Z",
    "__v" : 0
  },
  {
    "_id": "5be1f0c83efa5f308cefb4c0",
    "roomType" : "geogebra",
    "rooms" : [],
    "events" : [],
    "name" : "ACTIVITY 2",
    "description" : "",
    "creator" : "5ba289ba7223b9429888b9b4", // NO ONE,
    "image" : "http://tinygraphs.com/isogrids/ACTIVITY 2?theme=daisygarden&numcolors=2&size=220&fmt=svg",
    "desmosLink" : "",
    "createdAt" : "2018-10-25T14:58:45.945Z",
    "updatedAt" : "2018-10-25T14:58:45.945Z",
    "__v" : 0
  }
];

var ActivitiesSeeder = Seeder.extend({
  shouldRun: function () {
    return Activity.count().exec().then(count => count === 0);
  },
  run: function () {
    return Activity.create(data);
  }
});

module.exports = ActivitiesSeeder;
