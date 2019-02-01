var Seeder = require("mongoose-data-seed").Seeder;
var Course = require("../models/Course");

var data = [
  {
    _id: "5bbb82f72539b95500cf526e",
    activities: [],
    rooms: [],
    privacySetting: "private",
    name: "course 1",
    description: "",
    activities: ["5be1f0c83efa5f308cefb4c0"],
    members: [
      {
        user: "5ba289ba7223b9429888b9b4",
        role: "facilitator"
      }
    ],
    creator: "5ba289ba7223b9429888b9b4", // jl-picard
    // "createdAt" : "2018-10-13T13:57:01.351Z",
    __v: 0
  },
  {
    _id: "5bbb82f72539b95500cf526a",
    activities: [],
    rooms: [],
    privacySetting: "private",
    name: "entry-code course",
    entryCode: "entry-code-10",
    description: "",
    members: [
      {
        user: "5ba289ba7223b9429888b9b4",
        role: "facilitator"
      }
    ],
    creator: "5ba289ba7223b9429888b9b4", // jl-picard
    // "createdAt" : "2018-10-14T13:57:01.351Z",
    __v: 0
  },
  {
    _id: "5bbf4e5ec1b6d84cb0a4ded8",
    activities: ["5be1f0c83efa5f308cefb4c0"],
    rooms: [],
    privacySetting: "private",
    name: "course 2",
    description: "",
    members: [
      {
        user: "5ba289ba7223b9429888b9b4",
        role: "facilitator"
      },
      {
        user: "5bbbbd9a799302265829f5af", // g-laForge
        role: "participant"
      },
      {
        user: "5be1eba75854270cd0920fb8", // data
        role: "participant"
      },
      {
        user: "5be1eba75854270cd0920fa9", // worf
        role: "participant"
      }
    ],
    creator: "5ba289ba7223b9429888b9b4", // jl-picard
    // "createdAt" : "2018-10-15T13:57:01.351Z",
    __v: 0
  },
  {
    _id: "5bbf4e5ec1b6d84cb0a4ded3",
    activities: [],
    rooms: [],
    privacySetting: "private",
    name: "wrong entry code course",
    entryCode: "rare-shrimp-45",
    description: "",
    members: [
      {
        user: "5ba289ba7223b9429888b9b4",
        role: "facilitator"
      }
    ],
    creator: "5ba289ba7223b9429888b9b4", // jl-picard,
    // "createdAt" : "2018-10-16T13:57:01.351Z",
    __v: 0
  },
  {
    _id: "5c2e58db684f328cbca1d995",
    activities: ["5c2e58e9684f328cbca1d99b"],
    rooms: ["5c2e58e4684f328cbca1d99f"],
    privacySetting: "public",
    isTrashed: false,
    name: "Deanna's course 1",
    description: "",
    creator: "5be1eba75854270cd0920faa",
    image:
      "http://tinygraphs.com/labs/isogrids/hexa16/course 1?theme=duskfalling&numcolors=4&size=220&fmt=svg",
    members: [
      {
        user: "5be1eba75854270cd0920faa",
        role: "facilitator"
      }
    ],
    createdAt: "2019-01-03T18:47:55.075Z",
    updatedAt: "2019-01-03T18:48:13.112Z",
    __v: 0
  },
  {
    _id: "5c2e58db684f328cbca1d999",
    activities: ["5c2e58e9684f328cbca1d99c"],
    rooms: ["5c2e58e4684f328cbca1d99e"],
    privacySetting: "public",
    isTrashed: true,
    name: "Deanna's course 2",
    description: "",
    creator: "5be1eba75854270cd0920faa",
    image:
      "http://tinygraphs.com/labs/isogrids/hexa16/course 1?theme=duskfalling&numcolors=4&size=220&fmt=svg",
    members: [
      {
        user: "5be1eba75854270cd0920faa",
        role: "facilitator"
      }
    ],
    createdAt: "2019-01-03T18:47:55.075Z",
    updatedAt: "2019-01-03T18:48:13.112Z",
    __v: 0
  }
];

var CoursesSeeder = Seeder.extend({
  shouldRun: function() {
    return Course.count()
      .exec()
      .then(count => count === 0);
  },
  run: function() {
    return Course.create(data);
  }
});

module.exports = CoursesSeeder;
