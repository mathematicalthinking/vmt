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
    "creator" : "5bbbbd9a799302265829f5a0", // NO ONE,
    "image" : "http://tinygraphs.com/isogrids/ACTIVITY 1?theme=daisygarden&numcolors=4&size=220&fmt=svg",
    "desmosLink" : "",
    "createdAt" : "2018-10-25T14:58:45.945Z",
    "updatedAt" : "2018-10-25T14:58:45.945Z",
    "__v" : 0
},
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
