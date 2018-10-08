/*
 * We are using mongoose-data-seed to seed our test database
 * The data below has been fitlered using the function found in server/db_migration/filter-mongo.js
 * To use mongoose-data-seed you must provide the schema to be used for the test data
 * Then when you run md-seed run it will populate the database with the provide data referencing the schema
 */

var Seeder = require('mongoose-data-seed').Seeder;
var User = require('../models/User')

var data = [
  {
  "_id": "5ba289ba7223b9429888b9b4",
  "roomNotifications": {
    "access": [],
    "newRoom": []
  },
  "courseNotifications": {
    "access": [],
    "newRoom": []
  },
  "courseTemplates": [],
  "courses": [],
  "rooms": [
    "5ba289c57223b9429888b9b5",
  ],
  "activities": [],
  "isAdmin": false,
  "seenTour": false,
  "username": "jl-picard",
  "email": "",
  "firstName": "jean-luc",
  "lastName": "picard",
  "password": "$2b$12$xI0a6mVLlVoFYeVsmU2XrOVowVVphu9ORSD9EVHG6lzWMvfP8cgES",
  "accountType": "student",
  "createdAt": "2018-09-19T17:39:06.857Z",
  "updatedAt": "2018-09-19T18:13:24.216Z",
  "__v": 2
}
];

var UsersSeeder = Seeder.extend({
  shouldRun: function () {
    return User.count().exec().then(count => count === 0);
  },
  run: function () {
    return User.create(data);
  }
});

module.exports = UsersSeeder;
