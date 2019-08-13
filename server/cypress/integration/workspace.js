import user1 from '../fixtures/user';

describe('Workspace/replayer', function() {
  before(function() {
    cy.task('restoreAll').then(() => cy.login(user1));
  });

  after(function() {
    cy.logout();
  });

  it('loads a workspace', function() {
    cy.get('#Rooms').click();
    cy.getTestElement('content-box-room 1').click();
    cy.wait(500);
    cy.getTestElement('Enter').click();
    cy.wait(3000);
    cy.getTestElement('chat')
      .children()
      .should('have.length', 1);
  });
  it('prevents tool selection without taking control', function() {
    cy.getTestElement('awareness-desc')
      .contains('jl_picard joined room 1')
      .should('be.visible');
    cy.getTestElement('take-control').click();
    cy.wait(5000);
    cy.getTestElement('take-control').click();
    cy.get(':nth-child(5) > .toolbar_button > .gwt-Image').click();
    cy.getTestElement('control-warning').should('be.visible');
    cy.getTestElement('cancel').click();
    cy.getTestElement('chat')
      .children()
      .should('have.length', 4);
  });
  it('allows tool selection after taking control', function() {
    cy.getTestElement('take-control').click();
    cy.getTestElement('awareness-desc')
      .contains('jl_picard selected the move tool')
      .should('be.visible');
    cy.getTestElement('chat')
      .children()
      .children()
      .should('have.length', 10);
      cy.wait(3000);
    cy.get(':nth-child(5) > .toolbar_button > .gwt-Image').click();
    cy.wait(3000);
    cy.getTestElement('awareness-desc')
      .contains('jl_picard selected the polygon tool')
      .should('be.visible');
  });
  it('loads a replayer', function() {
    cy.getTestElement('exit-room').click();
    cy.getTestElement('Replayer').click();
  });
});
