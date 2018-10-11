// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const models = require('../../models');
const room = require ('../fixtures/room');
const exec = require('child_process').exec
const mongoose = require('mongoose');
const data = [
  {
    model: 'Room',
    documents: [
      room
    ]
  }
]

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('task', {
    clearDB: () => {
      return mongoose.connect('mongodb://localhost/vmt-test')
      .then(() => mongoose.connection.db.dropDatabase())
    },
    seedDBLogin: () => {
      return new Promise((resolve, reject) => {
        console.log('is this working?')
        exec('md-seed run users --dropdb', () => resolve('success'))
      })
    },
    seedDBAccess: () => {
      return new Promise((resolve, reject) => {
        exec('md-seed run users courses --dropdb', () => resolve('success'))
      })
    }
  })
}
