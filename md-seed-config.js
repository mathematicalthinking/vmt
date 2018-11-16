/*
 * This is main file for seeding encompass_seed
 * Commands:
    * md-seed run - this populates db from seed files
    * md-seed run --dropdb - this resets and populates db
    * md-seed g users - this is how you create an individual seed file
 */

var mongoose = require('mongoose');

var Users = require('./seeders/users.seeder');
var Activities = require('./seeders/activities.seeder');
var Courses = require('./seeders/courses.seeder');
var Rooms = require('./seeders/rooms.seeder');

require('dotenv').config();

// mongooseLib.Promise = global.Promise || Promise;


module.exports = {

  // Export the mongoose lib
  mongoose,

  // Export the mongodb url
  mongoURL: process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/vmt-test',

  /*
    Seeders List
    ------
    order is important
  */
  seedersList: {
    Users,
    Activities,
    Rooms,
    Courses,
  }
};
