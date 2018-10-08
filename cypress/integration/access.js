// const
const exec = require('child_process').exec
const user1 = require('../fixtures/user')
const user2 = require('../fixtures/user2')
const course = require('../fixtures/course')
const room = require('../fixtures/room')
const activity = require('../fixtures/activity')

describe('test access requests', function(){
  beforeEach(function(){
    cy.window((win) => {
      win.sessionStorage.clear()
      cy.reload()
    })
  })
  before(function(){
    cy.task('seedDBAccess').then(() => cy.login(user2))
  })

  it("user requests access to a course", function(){
    cy.contains('Community').click()
    cy.url().should('include', 'community/activities')
    cy.contains('Courses').click()
    cy.url().should('include', 'community/courses')
    cy.contains('course 1').click()
    cy.get('.button__Button__3QQYz').click()
    cy.url().should('include', '/confirmation')
  })
  it("user granst access to a course", function(){
    cy.login(user1)
    cy.get('.tabList__Notifications__3pVC8').contains('1')
    cy.get('.contentBox__Notification__3lGZv').contains('1')
    cy.get('.contentBox__Title__ytq7u > .global__Link__cpx9-').click()
    cy.get('.tabList__Notifications__3pVC8').contains('1')
    cy.get('#Members').click();
    cy.get('.students__Notifications__2RH6W > [draggable="true"] > .member__Container__2EVLw').contains(user2.username)
    cy.get('.member__Row__DsMp3 > .button__Button__3QQYz').click()
    // MAKE SURE THE NOTIFICATION IS VISUALLY RSOLVED
  })
  it("original user now has access", function(){
    cy.login(user2)
    cy.get('.tabList__Notifications__3pVC8').contains('1')
    cy.get('.contentBox__Notification__3lGZv').contains('1')
    cy.contains('course 1').click();
    cy.get('p').contains('Welcome to course 1.')
    cy.contains('Explore').click()
    // NAVIGATE BACK AND MAKE SURE NOTIFICATIONS HAVE BEEN RESOLVED

  })
})
