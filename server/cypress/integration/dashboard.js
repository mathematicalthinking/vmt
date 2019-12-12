const Q = require('../fixtures/user7');
const user9 = require('../fixtures/user9');

describe('test admin dashboard ', function() {
  before(function() {
    cy.task('restoreAll').then(() => cy.login(Q));
  });

  after(function() {
    cy.logout();
  });

  it('Q suspends a user', function() {
    cy.contains('Dashboard').click();
    cy.getTestElement('resource-tab-users').click();
    cy.getTestElement('last-year').click();
    cy.getTestElement(`content-box-${user9.username}`).within(() => {
      cy.getTestElement('suspend').click();
    });
    cy.getTestElement('suspendUser').click();

    cy.logout();
    cy.contains('Login').click();
    cy.get('input[name=username]').type(user9.username);
    cy.get('input[name=password]').type(user9.password);
    cy.get('button').click();
    cy.contains('Your account has been suspended').should('be.visible');
  });

  it('Q reinstantes a user', function() {
    cy.login(Q);
    cy.contains('Dashboard').click();
    cy.getTestElement('resource-tab-users').click();
    cy.getTestElement(`content-box-${user9.username}`).within(() => {
      cy.getTestElement('reinstate').click();
    });
    cy.getTestElement('reinstateUser').click();

    cy.logout();
    cy.login(user9);
  });
});
