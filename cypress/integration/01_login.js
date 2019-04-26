const user = require('../fixtures/user2'); // <-- this is not how you use fixtures, yeah whatever it works

describe('user signup/login', function() {
  before(function() {
    cy.task('clearDB');
  });
  beforeEach(function() {
    cy.window().then(win => {
      win.sessionStorage.clear();
      win.localStorage.clear();
      // cy.contains("Logout").click()
      cy.visit('/');
    });
  });
  it('signs up a new user', function() {
    cy.contains('Signup').click();
    cy.url().should('include', 'signup');
    cy.get('input[name=firstName]').type(user.firstName);
    cy.get('input[name=lastName]').type(user.lastName);
    cy.get('input[name=username]').type(user.username);
    cy.get('input[name=email]').type(user.email);
    cy.get('input[name=password]').type(user.password);
    cy.get('button').click();
    cy.url().should('include', '/myVMT/rooms');
  });
  it('logs in the user we just created', function() {
    cy.contains('Login').click();
    cy.get('input[name=username]').type(user.username);
    cy.get('input[name=password]').type(user.password);
    cy.get('button').click();
    cy.url().should('include', '/myVMT/rooms');
  });
  it('fails to sign up a user with the same username', function() {
    cy.contains('Signup').click();
    cy.url().should('include', 'signup');
    cy.get('input[name=firstName]').type(user.firstName);
    cy.get('input[name=lastName]').type(user.lastName);
    cy.get('input[name=username]').type(user.username);
    cy.get('input[name=email]').type(user.email);
    cy.get('input[name=password]').type(user.password);
    cy.get('button').click();
    cy.contains('That username is already taken.' || 'Unauthorized').should(
      'exist'
    );
  });
  it('fails to login with wrong password', function() {
    cy.contains('Login').click();
    cy.get('input[name=username]').type(user.username);
    cy.get('input[name=password]').type('incorrect password');
    cy.get('button').click();
    cy.contains('The password you entered is incorrect').should('exist');
  });
  it('fails to login with wrong username', function() {
    cy.contains('Login').click();
    cy.get('input[name=username]').type('incorrect username');
    cy.get('input[name=password]').type(user.password);
    cy.get('button').click();
    cy.contains(
      'That username does not exist. If you want to create an account go to Signup'
    ).should('exist');
  });
});
