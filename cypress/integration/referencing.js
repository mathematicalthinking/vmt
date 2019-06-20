import user8 from '../fixtures/user';

describe('Workspace/replayer', function() {
  before(function() {
    cy.task('seedDBforWorkspace').then(() => cy.login(user8));
  });
  it('loads a workspace', function() {
    cy.get('#Rooms').click();
    cy.getTestElement('reference room').click();
    cy.wait(500);
    cy.getTestElement('Enter').click();
    cy.wait(3000);
    cy.getTestElement('chat')
      .children()
      .should('have.length', 12);
  });
});
