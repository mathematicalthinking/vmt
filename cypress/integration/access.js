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
  it("user1 requests access to a course", function(){
    cy.contains('Community').click()
    cy.url().should('include', 'community/activities')
    cy.contains('Courses').click()
    cy.url().should('include', 'community/courses')
    cy.contains('course 1').click()
    cy.getTestElement('join-btn').click()
    cy.url().should('include', '/confirmation')
  })
  it("user2 granst access to a course", function(){
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
  it("user1 user now has access", function(){
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
})
