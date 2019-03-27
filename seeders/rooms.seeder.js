/*
 * We are using mongoose-data-seed to seed our test database
 * The data below has been fitlered using the function found in server/db_migration/filter-mongo.js
 * To use mongoose-data-seed you must provide the schema to be used for the test data
 * Then when you run md-seed run it will populate the database with the provide data referencing the schema
 */

var Seeder = require("mongoose-data-seed").Seeder;
var Room = require("../models/Room");

var data = [
  // For joining with an entry-code
  {
    _id: "5ba289c57223b9429888b9b5",
    roomType: "ggb",
    chat: [],
    currentMembers: [],
    tabs: ["5c98e1169b093c0c9812b2f2"],
    privacySetting: "private",
    name: "room 1",
    description: "hello",
    members: [
      {
        user: "5ba289ba7223b9429888b9b4", //jl-picard
        role: "facilitator",
        color: "#f26247"
      }
    ],
    creator: "5ba289ba7223b9429888b9b4",
    entryCode: "rare-shrimp-45",
    desmosLink: "https://www.desmos.com/calculator/krixwfwu1u",
    dueDate: null,
    image:
      "http://tinygraphs.com/spaceinvaders/room 1?theme=berrypie&numcolors=4&size=220&fmt=svg",
    createdAt: "2018-09-19T17:39:17.490Z",
    updatedAt: "2018-09-19T17:39:55.337Z",
    __v: 0
  },

  // For requesting access
  {
    _id: "5ba289c57223b9429888b9b7",
    roomType: "desmos",
    chat: [],
    currentMembers: [],
    events: [],
    privacySetting: "private",
    name: "request access",
    description: "hello",
    members: [
      {
        user: "5ba289ba7223b9429888b9b4", //jl-picard
        role: "facilitator"
      }
    ],
    creator: "5ba289ba7223b9429888b9b4",
    entryCode: "rare-shrimp-10",
    desmosLink: "https://www.desmos.com/calculator/krixwfwu1u",
    dueDate: null,
    createdAt: "2018-09-19T17:39:17.490Z",
    updatedAt: "2018-09-19T17:39:55.337Z",
    __v: 0
  },
  {
    _id: "5ba289c57223b9429888b9b6",
    roomType: "desmos",
    chat: [],
    currentMembers: [],
    events: [],
    privacySetting: "private",
    name: "room 2",
    description: "hello",
    entryCode: "hello",
    members: [
      {
        user: "5ba289ba7223b9429888b9b4", //jl-picard
        role: "facilitator"
      },
      {
        user: "5bbbbd9a799302265829f5af", // g-laForge
        role: "participant"
      }
    ],
    creator: "5ba289ba7223b9429888b9b4",
    dueDate: null,
    createdAt: "2018-09-19T17:39:17.490Z",
    updatedAt: "2018-09-19T17:39:55.337Z",
    __v: 0
  },
  // For testing incorrect entry code
  {
    _id: "5ba289c57223b9429888b9b3",
    roomType: "desmos",
    chat: [],
    currentMembers: [],
    events: [],
    privacySetting: "private",
    name: "wrong entry code room",
    description: "hello",
    entryCode: "hello",
    members: [
      {
        user: "5ba289ba7223b9429888b9b4", //jl-picard
        role: "facilitator"
      }
    ],
    creator: "5ba289ba7223b9429888b9b4",
    dueDate: null,
    createdAt: "2018-09-19T17:39:17.490Z",
    updatedAt: "2018-09-19T17:39:55.337Z",
    __v: 0
  },
  {
    _id: "5c2e58e4684f328cbca1d997",
    chat: [],
    currentMembers: [],
    tabs: ["5c2e58e4684f328cbca1d998"],
    privacySetting: "public",
    tempRoom: false,
    isTrashed: true,
    name: "Deanna's stand alone room",
    description: "",
    creator: "5be1eba75854270cd0920faa",
    image:
      "http://tinygraphs.com/spaceinvaders/gfggfg?theme=daisygarden&numcolors=4&size=220&fmt=svg",
    members: [
      {
        user: "5be1eba75854270cd0920faa",
        role: "facilitator"
      }
    ],
    dueDate: null,
    createdAt: "2019-01-03T18:48:04.573Z",
    updatedAt: "2019-01-03T18:48:13.123Z",
    __v: 0
  },
  {
    _id: "5c2e58e4684f328cbca1d99f",
    chat: [],
    currentMembers: [],
    tabs: ["5c2e58e4684f328cbca1d998"],
    privacySetting: "public",
    tempRoom: false,
    isTrashed: true,
    name: "Deanna's course 1 room",
    description: "",
    creator: "5be1eba75854270cd0920faa",
    image:
      "http://tinygraphs.com/spaceinvaders/gfggfg?theme=daisygarden&numcolors=4&size=220&fmt=svg",
    members: [
      {
        user: "5be1eba75854270cd0920faa",
        role: "facilitator"
      }
    ],
    dueDate: null,
    createdAt: "2019-01-03T18:48:04.573Z",
    updatedAt: "2019-01-03T18:48:13.123Z",
    __v: 0
  },
  {
    _id: "5c2e58e4684f328cbca1d99e",
    chat: [],
    currentMembers: [],
    tabs: ["5c2e58e4684f328cbca1d998"],
    privacySetting: "public",
    tempRoom: false,
    isTrashed: true,
    name: "Deanna's course 2 room",
    description: "",
    creator: "5be1eba75854270cd0920faa",
    image:
      "http://tinygraphs.com/spaceinvaders/gfggfg?theme=daisygarden&numcolors=4&size=220&fmt=svg",
    members: [
      {
        user: "5be1eba75854270cd0920faa",
        role: "facilitator"
      }
    ],
    dueDate: null,
    createdAt: "2019-01-03T18:48:04.573Z",
    updatedAt: "2019-01-03T18:48:13.123Z",
    __v: 0
  }
];

var RoomsSeeder = Seeder.extend({
  shouldRun: function() {
    return Room.count()
      .exec()
      .then(count => count === 0);
  },
  run: function() {
    return Room.create(data);
  }
});

module.exports = RoomsSeeder;
