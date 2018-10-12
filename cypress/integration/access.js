// const
const exec = require('child_process').exec
const user1 = require('../fixtures/user')
const user2 = require('../fixtures/user2')
const course = require('../fixtures/course')
const room = require('../fixtures/room')
const activity = require('../fixtures/activity')

describe('test access requests', function(){  
  before(function(){
    cy.task('seedDB').then(() => cy.login(user2))
  })

  // COURSE
  it("user2 requests access to a course", function(){
    cy.contains('Community').click()
    cy.url().should('include', 'community/activities')
    cy.contains('Courses').click()
    cy.url().should('include', 'community/courses')
    cy.contains('course 1').click()
    cy.getTestElement('join-btn').click()
    cy.url().should('include', '/confirmation')
  })
  it("user1 granst access to a course", function(){
    cy.login(user1)
    cy.getTestElement('tab-ntf').contains('1')
    cy.getTestElement('content-box-ntf').contains('1')
    cy.contains('course 1').click()
    cy.getTestElement('tab-ntf').contains('1')
    cy.get('#Members').click()
    cy.getTestElement('join-requests').children().should('have.length', 1)
    cy.getTestElement('grant-access').click()
    cy.getTestElement('tab-ntf').should('not.exist')
    cy.getTestElement('members').children().should('have.length', 2)
    cy.contains(user2.username).should('exist')
    // MAKE SURE THE NOTIFICATION IS VISUALLY RESOLVED
  })
  it("user2 user now has access", function(){
    cy.login(user2)
    cy.getTestElement('tab-ntf').contains('1')
    cy.getTestElement('content-box-ntf').contains('1')
    cy.contains('course 1').click();
    cy.get('p').contains('Welcome to course 1.')
    cy.contains('Explore').click()
    cy.contains('My VMT').click()
    cy.getTestElement('tab-ntf').should('not.exist')
    cy.getTestElement('content-box-ntf').should('not.exist')
    // NAVIGATE BACK AND MAKE SURE NOTIFICATIONS HAVE BEEN RESOLVED

  })

  // ROOM
  it('user 2 joins a room by entering entry-code', function(){
    cy.login(user2)
    cy.contains('Community').click()
    cy.url().should('include', 'community/activities')
    cy.contains('Rooms').click()
    cy.url().should('include', 'community/rooms')
    cy.contains('room 1').click()
    cy.get('#entryCode').type('{selectall} {backspace}').type('rare-shrimp-45')
    cy.contains('Join').click()
    cy.url().should('include', 'summary')
    cy.contains('Room Stats').should('exist')
    cy.getTestElement('crumb').contains('Profile').click()
    cy.getTestElement('tab').contains('Rooms').click()
    cy.getTestElement('content-box-title').contains('room 1').should('exist')
  })

  it('user 1 should get a notification that user2 joined', function(){

  })

  it('user fails to join with wrong entry code', function(){

  })
})
