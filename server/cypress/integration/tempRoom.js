const user = require('../fixtures/userTemp');

describe('temporary room', function() {
  beforeEach(function() {
    cy.task('restoreAll');
    cy.window().then((win) => {
      win.sessionStorage.clear();
      cy.clearLocalStorage();
      cy.visit('/');
    });
  });

  after(function() {
    cy.logout();
  });

  it('creates a temp user and room and then saves', function() {
    cy.contains('Try out a Workspace').click();
    cy.url().should('include', 'explore');

    cy.getTestElement('temp-geogebra').as('ggbBtn');
    cy.getTestElement('temp-desmos').as('desmosBtn');

    // DESMOS/GEOGEBRA buttons should be disabled until username is given
    cy.get('@ggbBtn').should('be.disabled');
    cy.get('@desmosBtn').should('be.disabled');

    cy.get('input').type(user.username);

    cy.get('@ggbBtn').should('be.enabled');
    cy.get('@desmosBtn').should('be.enabled');

    cy.get('@ggbBtn').click();
    cy.get('.ggbtoolbarpanel').should('exist');
    cy.url({ log: true });
    cy.getTestElement('save').click();
    //use option: {force: true}, as a workaround for known issue with entering
    //information into an input field directly after unfocusing from an input field:
    //https://github.com/cypress-io/cypress/issues/5830
    cy.get('input[name=firstName]').type(user.firstName, { force: true });
    cy.get('input[name=lastName]').type(user.lastName, { force: true });
    cy.get('input[name=email]').type(user.email, { force: true });
    cy.get('input[name=password]').type(user.password, { force: true });
    cy.getTestElement('submit-signup').click();
    cy.getTestElement('nav-My VMT').click();
    cy.url().should('include', '/unconfirmed');
    cy.request('/auth/currentUser').should((response) => {
      const { rooms } = response.body.result;
      expect(rooms).to.have.length(1);
      const room = rooms[0];
      return expect(room.tempRoom).to.be.false;
    });
  });

  // it('creates another user and joins the same room', function() {
  //   cy.window().then(win => {
  //     win.sessionStorage.clear();
  //     cy.visit('/');
  //     cy.visit(url);
  //     cy.get('input').type('geordi');
  //     cy.get('.button__Button__3QQYz').click();
  //     cy.get('.ggbtoolbarpanel');
  //     cy.getTestElement('current-members')
  //       .children()
  //       .should('have.length', 1);
  //     cy.getTestElement('current-members').contains('geordi');
  //   });
  // });
});
