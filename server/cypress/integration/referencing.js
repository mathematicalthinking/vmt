import user8 from '../fixtures/user8';
import ssmith from '../fixtures/user9';

function toggleReferencing() {
  cy.getTestElement('new-reference').click({ force: true });
}

describe('Referencing', function() {
  describe('Geogebra', function() {
    before(function() {
      cy.task('restoreAll').then(() => cy.login(user8));
    });

    after(function() {
      cy.logout();
    });

    it('loads a workspace', function() {
      cy.get('#Rooms').click();
      cy.getTestElement('content-box-reference room').click();
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
      toggleReferencing();
      cy.getTestElement('reference-line').should('not.be.visible');
      cy.getTestElement('msg-5d0d2f0748e22b165488897c').click();
      cy.getTestElement('reference-line').should('be.visible');
    });
  });

  describe('Desmos Referencing', function() {
    before(function() {
      cy.login(ssmith);
      cy.get('#Rooms').click();
      cy.contains('ssmith public desmos').click();
      cy.getTestElement('Enter').click();
    });

    it('properly handles whiteboard referencing modal', function() {
      // no modal should appear if referencing is off
      cy.get('.dcg-grapher').click();
      cy.getTestElement('ref-warning-checkbox').should('not.be.visible');

      toggleReferencing();

      cy.get('.dcg-grapher').click();
      cy.getTestElement('ref-warning-checkbox').should('be.visible');
      cy.getTestElement('ref-warning-checkbox').should('not.be.checked');
      cy.contains('Okay').click();
      cy.getTestElement('ref-warning-checkbox').should('not.be.visible');

      // check box to prevent future modals for this message
      cy.get('.dcg-grapher').click();
      cy.getTestElement('ref-warning-checkbox').click();
      cy.contains('Okay').click();

      cy.get('.dcg-grapher').click();
      cy.getTestElement('ref-warning-checkbox').should('not.be.visible');

      // reload to make sure the updated user setting is being persisted
      cy.reload();
      cy.get('.dcg-grapher').click();
      cy.getTestElement('ref-warning-checkbox').should('not.be.visible');
    });

    it('makes a new chat reference', () => {
      cy.getTestElement('reference-line').should('not.be.visible');
      cy.getTestElement('msg-5d8e1c9583074a44e85d97e0').click();
      cy.getTestElement('reference-line').should('be.visible');
    });
  });
});
