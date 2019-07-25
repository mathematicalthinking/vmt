const user = require('../fixtures/userTemp');
let url;
describe('temporary room', function() {
  beforeEach(function() {
    cy.task('restoreAll');
    cy.window().then(win => {
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
    cy.get('input').type(user.username);
    cy.getTestElement('temp-geogebra').click();
    cy.get('.ggbtoolbarpanel').should('exist');
    cy.url({ log: true }).then(res => (url = res));
    cy.getTestElement('save').click();
    cy.get('input[name=firstName]').type(user.firstName);
    cy.get('input[name=lastName]').type(user.lastName);
    cy.get('input[name=email]').type(user.email);
    cy.get('input[name=password]').type(user.password);
    cy.getTestElement('submit-signup').click();
    cy.getTestElement('nav-My VMT').click();
    cy.url().should('include', '/unconfirmed');
    cy.request('/auth/currentUser').should((response) => {
      let rooms = response.body.result.rooms;
      expect(rooms).to.have.length(1);
      let room = rooms[0];
      expect(room.tempRoom).to.be.false;
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
