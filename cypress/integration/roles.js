const user = require('../fixtures/user2')
const course = require('../fixtures/course')
const room = require('../fixtures/room')
const activity = require('../fixtures/activity')

describe('show different views based on role', function(){
  before(function(){
    cy.task('seedDBAccess').then(() => {
      cy.window((win) => {
        win.sessionStorage.clear()
      })
      cy.log(user)
      cy.login(user)
    })
    // cy.visit('/myVMT/courses')
  })
  it('does not display the toggle option when a user only a student', function(){
    cy.get('.contentBox__Container__VQwJV').contains('course 1').should('exist')
  })
  it('displays the toggle after the student creates a course (becoming a teacher)', function(){
    cy.get('.dashboard__MainContent__1E4zd > :nth-child(1) > :nth-child(2)').click()
    cy.get('input[name=coursesName]').type(course.name)
    cy.get('input[name=description]').type(course.description)
    cy.get('button').contains('Submit').click()
    cy.contains(course.name).should('be.visible')
    cy.get('.button__Active__v9lDR').contains('Teacher');
  })
  it('toggles the resources when the user switches view', function(){
    cy.contains('Student').click();
    cy.contains(course.name).should('not.exist')
    cy.contains('course 1').should('exist')
    cy.get('#Activities').click()
    cy.contains('Teacher').should('not.exist');
    cy.get('#Rooms').click()
    cy.contains('Teacher').should('not.exist');
    cy.get('#Courses').click()
    cy.contains('Teacher').should('exist');
  })
})