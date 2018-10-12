const user2 = require('../fixtures/user2')
const course = require('../fixtures/course')
const room = require('../fixtures/room')
const activity = require('../fixtures/activity')

describe('show different views based on role', function(){
  before(function(){
    cy.task('seedDBAccess').then(() => {cy.login(user2)})
    // cy.visit('/myVMT/courses')
  })
  it('does not display the toggle option when a user only a student', function(){
    cy.getTestElement('content-box-title').contains('course 2').should('exist')
  })
  it('displays the toggle after the student creates a course (becoming a teacher)', function(){
    cy.getTestElement('create-Course').click()
    cy.get('input[name=coursesName]').type(course.name)
    cy.get('input[name=description]').type(course.description)
    cy.get('button').contains('Submit').click()
    cy.contains(course.name).should('be.visible')
    cy.get('button').contains('Teacher').should('be.visible');
  })
  it('toggles the resources when the user switches view', function(){
    cy.contains('Student').click();
    cy.contains(course.name).should('not.exist')
    cy.contains('course 2').should('exist')
    cy.get('#Activities').click()
    cy.contains('Teacher').should('not.exist');
    cy.get('#Rooms').click()
    cy.contains('Teacher').should('not.exist');
    cy.get('#Courses').click()
    cy.contains('Teacher').should('exist');
  })
})