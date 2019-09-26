const user1 = require('../fixtures/user');
const user4 = require('../fixtures/user4');

describe('Edit Members Roles', function() {
  before(function() {
    cy.task('restoreAll').then(() => cy.login(user1));
  });

  afterEach(function() {
    cy.logout();
  });

  // COURSE
  it('picard changes worf from participant to facilitator', function() {
    cy.getTestElement('tab')
      .contains('Courses')
      .click();
    cy.getTestElement('content-box-course 2').click();
    cy.getTestElement('tab')
      .contains('Members')
      .click();
    cy.getTestElement('edit-member')
      .last()
      .click();
    cy.getTestElement('trash-member').should('be.visible');

    cy.getTestElement('dropdown').click();
    cy.getTestElement('dropdown-item')
      .contains('facilitator')
      .click();
    cy.getTestElement('dropdown').should('not.be.visible');
    cy.getTestElement('trash-member').should('not.be.visible');
    cy.getTestElement('member-worf')
      .children()
      .children()
      .eq(1)
      .should(($el) => {
        expect($el).to.include.text('facilitator');
      });
  });

  it('allows worf to see edit controls after being made a facilitator', function() {
    cy.login(user4);

    cy.getTestElement('tab')
      .contains('Courses')
      .click();
    cy.getTestElement('content-box-course 2').click();
    cy.getTestElement('tab')
      .contains('Members')
      .click();
    cy.getTestElement('member-worf')
      .children()
      .children()
      .eq(1)
      .should(($el) => {
        expect($el).to.include.text('facilitator');
      });
    // .and('include', 'facilitator')
  });
  it('picard kicks worf out of course 2', function() {
    cy.login(user1);

    cy.getTestElement('tab')
      .contains('Courses')
      .click();
    cy.getTestElement('content-box-course 2').click();
    cy.getTestElement('tab')
      .contains('Members')
      .click();
    cy.getTestElement('edit-member')
      .last()
      .click();
    cy.getTestElement('trash-member').click();
    cy.getTestElement('confirm-trash')
      .last()
      .click();
    cy.getTestElement('members')
      .children()
      .should('have.length', 3);
  });
  it("does not display course 2 to worf after they're removed", function() {
    cy.login(user4);
    cy.getTestElement('tab')
      .contains('Courses')
      .click();
    cy.contains("There doesn't appear to be anything here yet");
    cy.contains('Community').click();
    cy.contains('Courses').click();
    cy.getTestElement('content-box-course 2').click();
    cy.contains("You currently don't have access");
  });
});
