var Seeder = require("mongoose-data-seed").Seeder;
var Activity = require("../models/Activity");

var data = [
  {
    _id: "5bd1da254b2d4b2a6c45cf8a",
    roomType: "geogebra",
    rooms: [],
    events: [],
    name: "ACTIVITY 1",
    description: "",
    creator: "5ba289ba7223b9429888b9a1", // NO ONE,
    image:
      "http://tinygraphs.com/isogrids/ACTIVITY 1?theme=daisygarden&numcolors=4&size=220&fmt=svg",
    desmosLink: "",
    createdAt: "2018-10-25T14:58:45.945Z",
    updatedAt: "2018-10-25T14:58:45.945Z",
    __v: 0
  },
  {
    _id: "5be1f0c83efa5f308cefb4c0",
    roomType: "geogebra",
    rooms: [],
    events: [],
    name: "ACTIVITY 2",
    description: "",
    creator: "5ba289ba7223b9429888b9b4", // NO ONE,
    image:
      "http://tinygraphs.com/isogrids/ACTIVITY 2?theme=daisygarden&numcolors=2&size=220&fmt=svg",
    desmosLink: "",
    createdAt: "2018-10-25T14:58:45.945Z",
    updatedAt: "2018-10-25T14:58:45.945Z",
    __v: 0
  },
  {
    _id: "5c2e58e9684f328cbca1d99a",
    courses: [],
    users: [],
    roomType: "geogebra",
    privacySetting: "public",
    rooms: [],
    events: [],
    tabs: ["5c2e58e9684f328cbca1d99c"],
    isTrashed: false,
    name: "Deanna's stand alone activity",
    description: "",
    creator: "5be1eba75854270cd0920faa",
    ggbFile: "",
    image:
      "http://tinygraphs.com/isogrids/fgfdgdfg?theme=sugarsweets&numcolors=4&size=220&fmt=svg",
    createdAt: "2019-01-03T18:48:09.661Z",
    updatedAt: "2019-01-03T18:48:13.119Z",
    __v: 0
  },
  {
    _id: "5c2e58e9684f328cbca1d99b",
    courses: [],
    users: [],
    roomType: "geogebra",
    privacySetting: "public",
    rooms: [],
    events: [],
    tabs: ["5c2e58e9684f328cbca1d99c"],
    isTrashed: false,
    name: "Deanna's course 1 activity",
    description: "",
    creator: "5be1eba75854270cd0920faa",
    ggbFile: "",
    course: "5c2e58db684f328cbca1d995",
    image:
      "http://tinygraphs.com/isogrids/fgfdgdfg?theme=sugarsweets&numcolors=4&size=220&fmt=svg",
    createdAt: "2019-01-03T18:48:09.661Z",
    updatedAt: "2019-01-03T18:48:13.119Z",
    __v: 0
  },
  {
    _id: "5c2e58e9684f328cbca1d99c",
    courses: [],
    users: [],
    roomType: "geogebra",
    privacySetting: "public",
    rooms: [],
    events: [],
    tabs: ["5c2e58e9684f328cbca1d99c"],
    isTrashed: false,
    name: "Deanna's course 2 activity",
    description: "",
    creator: "5be1eba75854270cd0920faa",
    ggbFile: "",
    course: "5c2e58db684f328cbca1d995",
    image:
      "http://tinygraphs.com/isogrids/fgfdgdfg?theme=sugarsweets&numcolors=4&size=220&fmt=svg",
    createdAt: "2019-01-03T18:48:09.661Z",
    updatedAt: "2019-01-03T18:48:13.119Z",
    __v: 0
  }
];

var ActivitiesSeeder = Seeder.extend({
  shouldRun: function() {
    return Activity.count()
      .exec()
      .then(count => count === 0);
  },
  run: function() {
    return Activity.create(data);
  }
});

module.exports = ActivitiesSeeder;
