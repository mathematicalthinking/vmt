/*
 * We are using mongoose-data-seed to seed our test database
 * The data below has been fitlered using the function found in server/db_migration/filter-mongo.js
 * To use mongoose-data-seed you must provide the schema to be used for the test data
 * Then when you run md-seed run it will populate the database with the provide data referencing the schema
 */

var Seeder = require('mongoose-data-seed').Seeder;
var Room = require('../models/Room')

var data = [
  {
    "_id" : "5ba289c57223b9429888b9b5",
    "roomType" : "desmos",
    "chat" : [],
    "currentUsers" : [],
    "events" : [],
    "isPublic" : false,
    "name" : "room 1",
    "description" : "hello",
    "members" : [
      {
        "user": "5ba289ba7223b9429888b9b4", //jl-picard
        "role": "teacher"
      }
    ],
    "creator" : "5ba289ba7223b9429888b9b4",
    "entryCode" : "rare-shrimp-45",
    "desmosLink" : "https://www.desmos.com/calculator/krixwfwu1u",
    "dueDate" : null,
    "createdAt" : "2018-09-19T17:39:17.490Z",
    "updatedAt" : "2018-09-19T17:39:55.337Z",
    "__v" : 0
  },
  {
    "_id" : "5ba289c57223b9429888b9b6",
    "roomType" : "desmos",
    "chat" : [],
    "currentUsers" : [],
    "events" : [],
    "isPublic" : false,
    "name" : "room 2",
    "description" : "hello",
    "members" : [
      {
        "user": "5ba289ba7223b9429888b9b4", //jl-picard
        "role": "teacher"
      },
      {
        "user": "5bbbbd9a799302265829f5af", // g-laForge
        "role": "student",
      }
    ],
    "creator" : "5ba289ba7223b9429888b9b4",
    "dueDate" : null,
    "createdAt" : "2018-09-19T17:39:17.490Z",
    "updatedAt" : "2018-09-19T17:39:55.337Z",
    "__v" : 0
  },
];

var RoomsSeeder = Seeder.extend({
  shouldRun: function () {
    return Room.count().exec().then(count => count === 0);
  },
  run: function () {
    return Room.create(data);
  }
});

module.exports = RoomsSeeder;
