// const
const exec = require('child_process').exec
const user = require('../fixtures/user')
const course = require('../fixtures/course')
const room = require('../fixtures/room')
const activity = require('../fixtures/activity')

describe('test access requests', function(){
  before(function(){
    cy.task('seedDB')
    // spawn('md-seed run --dropdb')
    /// cy.exec DOESNT WORK ON WINDOWS 😫
    // cy.exec('').then(res => console.log('promise resolved'))

  })

  it("user requests access to a course", function(){
    cy.visit('/publicList/rooms')

  })
})
