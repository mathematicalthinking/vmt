const user = require('../fixtures/user.json')
const course = require('../fixtures/course.json')
describe('create each type of resource', function(){
  before(function(){
    cy.visit('/')
    cy.get('input[name=username]').type(user.username)
    cy.get('input[name=password]').type(user.password)
    cy.get('button').click()
  })
  it('creates a course', function(){
    cy.get('button').click()
    cy.url().should('include', '/profile')
    cy.get('button').contains('Create').click()
    cy.get('input[name=coursesName]').type(course.courseName)
    cy.get('input[name=description]').type(course.description)
    cy.get('button').contains('Submit').click()
    
  })

  context('create a course', function(){

  })
  context('create an assignment', function(){

  })

})
