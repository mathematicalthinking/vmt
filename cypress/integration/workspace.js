import user1 from '../fixtures/user';

describe('Workspace/replayer', function() {
  before(function() {
    cy.task('seedDB').then(() => cy.login(user1));
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
      .contains('jl-picard joined room 1')
      .should('be.visible');
    // const stub = cy.stub();
    // const stub1 = cy.stub();
    // cy.on('window:alert', stub1);
    cy.getTestElement('take-control').click();
    cy.wait(1000);
    cy.getTestElement('take-control').click();
    cy.get(':nth-child(5) > .toolbar_button > .gwt-Image').click();
    // cy.get('[mode="16"] > .gwt-Label').click();
    cy.getTestElement('control-warning').should('be.visible');
    cy.getTestElement('cancel').click();
    cy.getTestElement('chat')
      .children()
      .should('have.length', 4);
    //     .then(() => {
    //       expect(stub1.getCall(0)).to.be.calledWith(
    //         `You are not in control. Click "Take Control" before making changes`
    //       );
    //     });
    // });
  });
  it('allows tool selection after taking control', function() {
    cy.getTestElement('take-control').click();
    cy.getTestElement('awareness-desc')
      .contains('jl-picard selected the move tool')
      .should('be.visible');
    cy.getTestElement('chat')
      .children()
      .should('have.length', 6);
    cy.get(':nth-child(5) > .toolbar_button > .gwt-Image').click();
    cy.getTestElement('awareness-desc')
      .contains('jl-picard selected the polygon tool')
      .should('be.visible');
    // cy.get('.ggbdockpanelhack')
    //   .last()
    //   // .parent()
    //   .click(0, 0);
    // cy.get('.ggbdockpanelhack')
    //   .last()
    //   // .parent()
    //   .click(100, 100);
    // cy.get('.ggbdockpanelhack')
    //   .last()
    //   // .parent()
    //   .click(300, 100);
    // cy.get('.ggbdockpanelhack')
    //   .last()
    //   // .parent()
    //   .click(0, 0);
    // cy.wait(100000);
  });
  it('creates creates a shape', function() {});
  it('loads a replayer', function() {
    cy.getTestElement('exit-room').click();
    cy.getTestElement('Replayer').click();
  });
});
