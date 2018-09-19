const user = require('../fixtures/user')
const course = require('../fixtures/course')
const room = require('../fixtures/room')
const activity = require('../fixtures/activity')

describe('test access requests', function(){
  before(function(){
    cy.task('seedDB').then(res => console.log('promise resolved'))
  })

  it("user requests access to a course", function(){
    cy.visit('/')
  })
})
