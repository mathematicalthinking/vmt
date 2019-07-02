const user = require('../fixtures/user2'); // <-- this is not how you use fixtures, yeah whatever it works

describe('user signup/login', function() {
  before(function() {
    cy.task('clearDB');
  });
  beforeEach(function() {
    cy.window().then(win => {
      win.sessionStorage.clear();
      win.localStorage.clear();
      cy.clearCookies();
      cy.visit('/');
    });
  });
  it('signs up a new user', function() {
    cy.visit('/');
    cy.contains('Signup').click();
    cy.url().should('include', 'signup');
    cy.get('input[name=firstName]').type(user.firstName);
    cy.get('input[name=lastName]').type(user.lastName);
    cy.get('input[name=username]').type(user.username);
    cy.get('input[name=email]').type(user.email);
    cy.get('input[name=password]').type(user.password);
    cy.get('button').click();
    cy.url().should('include', '/myVMT/rooms');
    cy.logout();
  });
  it('logs in the user we just created', function() {
    cy.contains('Login').click();
    cy.get('input[name=username]').type(user.username);
    cy.get('input[name=password]').type(user.password);
    cy.get('button').click();
    cy.url().should('include', '/myVMT/rooms');
    cy.logout();
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
    cy.contains('There already exists a user with that username' || 'Unauthorized').should(
      'exist'
    );
  });
  it('fails to login with wrong password', function() {
    cy.contains('Login').click();
    cy.get('input[name=username]').type(user.username);
    cy.get('input[name=password]').type('incorrect password');
    cy.get('button').click();
    cy.contains('Incorrect password').should('exist');
  });
  it('fails to login with wrong username', function() {
    cy.contains('Login').click();
    cy.get('input[name=username]').type('incorrect username');
    cy.get('input[name=password]').type(user.password);
    cy.get('button').click();
    cy.contains(
      'Incorrect username'
    ).should('exist');
  });
});
