const user = require('../fixtures/user2') // <-- this is not how you use fixtures, yeah whatever it works

describe('user signup/login', function() {
  before(function() {
    cy.task('clearDB')
  })
  beforeEach(function(){
    cy.window().then((win) => {
      cy.visit('')
      win.sessionStorage.clear()
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
    cy.url().should('include', '/myVMT/courses')
  })
  it('logs in the user we just created', function() {
    cy.contains('Login').click()
    cy.get('input[name=username]').type(user.username)
    cy.get('input[name=password]').type(user.password)
    cy.get('button').click()
    cy.url().should('include', '/myVMT/courses')
  })
  it('fails to sign up a user with the same username', function(){
    cy.contains('Signup').click()
    cy.url().should('include', 'signup')
    cy.get('input[name=firstName]').type(user.firstName)
    cy.get('input[name=lastName]').type(user.lastName)
    cy.get('input[name=username]').type(user.username)
    cy.get('input[name=email]').type(user.email)
    cy.get('input[name=password]').type(user.password)
    cy.get('button').click()
    cy.get('.signup__ErrorMsg__4x6oZ').should('have.text', 'That username is already taken.')
  }) 
  it('fails to login with wrong password', function(){
    cy.contains('Login').click()
    cy.get('input[name=username]').type(user.username)
    cy.get('input[name=password]').type('incorrect password')
    cy.get('button').click()
    cy.get('.login__ErrorMsg__dvYQ-').should('have.text', 'The password you entered is incorrect')
  })
  it('fails to login with wrong username', function(){
    cy.contains('Login').click()
    cy.get('input[name=username]').type('incorrect username')
    cy.get('input[name=password]').type(user.password)
    cy.get('button').click()
    cy.get('.login__ErrorMsg__dvYQ-').should('have.text', 'That username does not exist. If you want to create an account go to Register')
  })
})
