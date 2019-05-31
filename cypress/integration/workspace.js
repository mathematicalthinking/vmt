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
    cy.wait(4000);
    cy.getTestElement('chat')
      .children()
      .should('have.length', 1);
  });
  // it('prevents tool selection without taking control', function() {
  //   const obj = {
  //     foo: () => true,
  //   };
  //   // const stub = cy.stub();
  //   const spy = cy.spy(obj, 'foo');
  //   cy.on('window:alert', obj.foo);
  //   cy.get(':nth-child(5) > .toolbar_button > .gwt-Image').click();
  //   cy.get('[mode="16"] > .gwt-Label').click();
  //   cy.get('.cursor_hit')
  //     .click()
  //     .then(function() {
  //       return cy.wait(5000);
  //     })
  //     .then(() => {
  //       expect(spy).to.be.calledWith(
  //         `You are not in control. Click "Take Control" before making changes`
  //       );
  //     });
  // });
  it('allows tool selection after taking control', function() {
    cy.getTestElement('awareness-desc')
      .contains('jl-picard joined room 1')
      .should('be.visible');
    cy.getTestElement('take-control').click();
    cy.getTestElement('awareness-desc')
      .contains('jl-picard selected the move tool')
      .should('be.visible');
    cy.getTestElement('chat')
      .children()
      .should('have.length', 3);
    cy.get(':nth-child(5) > .toolbar_button > .gwt-Image').click();
    cy.get('[mode="16"] > .gwt-Label').click();
    cy.getTestElement('awareness-desc')
      .contains('jl-picard selected the polygon tool')
      .should('be.visible');
  });
  it('creates a new tab', function() {});
  it('loads a replayer', function() {
    cy.getTestElement('exit-room').click();
    cy.getTestElement('Replayer').click();
  });
});
