const user = require('../fixtures/user.json')

describe('user signup/login', function() {
  before(function() {
    cy.task('clearDB')
  })
  it('signs up a new user', function() {
    cy.visit('/')
    cy.contains('Login/Signup').click()
    cy.url().should('include', 'users/new')
    cy.get('input[name=firstName]').type(user.firstName)
    cy.get('input[name=lastName]').type(user.lastName)
    cy.get('input[name=username]').type(user.username)
    cy.get('input[name=email]').type(user.email)
    cy.get('input[name=password]').type(user.password)
    cy.get('button').click()
    cy.url().should('include', '/profile/courses')
  })
  it('logs in the user we just created', function() {
    cy.reload(true)
    cy.get('input[name=username]').type(user.username)
    cy.get('input[name=password]').type(user.password)
    cy.get('button').click()
    cy.url().should('include', '/profile/courses')
  })
})
