import user8 from '../fixtures/user8';

describe('Workspace/replayer', function() {
  before(function() {
    cy.task('seedDB').then(() => cy.login(user8));
  });
  it('loads a workspace', function() {
    cy.get('#Rooms').click();
    cy.getTestElement('content-box-reference room').click();
    cy.wait(500);
    cy.getTestElement('Enter').click();
    cy.wait(3000);
    cy.getTestElement('chat')
      .children()
      .should('have.length', 23);
  });
  it('shows a reference when clicking on reference message', () => {});
});
