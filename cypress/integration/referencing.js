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
  it('shows a reference when clicking on reference message', () => {
    cy.getTestElement('reference-line').should('not.be.visible');
    cy.getTestElement('5d0d2f0748e22b165488897c').click();
    cy.getTestElement('reference-line').should('be.visible');
  });

  it('makes a new reference', () => {
    cy.getTestElement('new-reference').click();
    cy.getTestElement('reference-line').should('not.be.visible');
    cy.getTestElement('5d0d2f0748e22b165488897c').click();
    cy.getTestElement('reference-line').should('be.visible');
  });
});
