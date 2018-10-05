const user = require('../fixtures/user')

describe('user signup/login', function() {
  before(function() {
    cy.task('clearDB')
  })
  beforeEach(function(){
    cy.window().then((win) => {
      win.sessionStorage.clear()
      cy.visit('/')
    })
  })
  it('signs up a new user', function() {
    cy.contains('Signup').click()
    cy.url().should('include', 'signup')
    cy.get('input[name=firstName]').type(user.firstName)
    cy.get('input[name=lastName]').type(user.lastName)
    cy.get('input[name=username]').type(user.username)
    cy.get('input[name=email]').type(user.email)
    cy.get('input[name=password]').type(user.password)
    cy.get('button').click()
    cy.url().should('include', '/myVMT')
  })
  it('logs in the user we just created', function() {
    cy.reload(true)
    cy.contains('Login').click()
    cy.get('input[name=username]').type(user.username)
    cy.get('input[name=password]').type(user.password)
    cy.get('button').click()
    cy.url().should('include', '/myVMT')
  })
})
