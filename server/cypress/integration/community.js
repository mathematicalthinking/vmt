describe('test community search and filter', function() {
  before(function() {
    cy.task('restoreAll');
  });

  it('searches for a single room', function() {
    cy.visit('/');
    cy.contains('Community').click();
    cy.url().should('include', 'community/rooms?privacy=all&roomType=all');
    cy.getTestElement('box-list')
      .children()
      .should('have.length', 9);
    cy.getTestElement('community-search')
      .click()
      .type('reference');
    cy.wait(1000);
    cy.url().should(
      'include',
      'community/rooms?privacy=all&roomType=all&search='
    );
    cy.getTestElement('box-list')
      .children()
      .should('have.length', 1);
    cy.contains('reference room').should('exist');
  });

  it('filters privacy setting', function() {
    cy.getTestElement('community-search').clear();
    cy.wait(1000);
    cy.getTestElement('box-list')
      .children()
      .should('have.length', 9);
    cy.getTestElement('public-filter').click();
    cy.url().should(
      'include',
      'community/rooms?privacy=public&roomType=all&search='
    );
    cy.getTestElement('box-list')
      .children()
      .should('have.length', 3);
    cy.getTestElement('private-filter').click();
    cy.url().should(
      'include',
      'community/rooms?privacy=private&roomType=all&search='
    );
    cy.getTestElement('box-list')
      .children()
      .should('have.length', 6);
    cy.getTestElement('all-privacy-filter').click();
    cy.url().should(
      'include',
      'community/rooms?privacy=all&roomType=all&search='
    );
    cy.getTestElement('box-list')
      .children()
      .should('have.length', 9);
  });

  it('filters room type', function() {
    cy.getTestElement('community-search').clear();
    cy.wait(1000);
    cy.getTestElement('box-list')
      .children()
      .should('have.length', 9);
    cy.getTestElement('geogebra-filter').click();
    cy.url().should(
      'include',
      'community/rooms?privacy=all&roomType=geogebra&search='
    );
    cy.getTestElement('box-list')
      .children()
      .should('have.length', 9);
    cy.getTestElement('desmos-filter').click();
    cy.url().should(
      'include',
      'community/rooms?privacy=all&roomType=desmos&search='
    );
    cy.getTestElement('box-list')
      .children()
      .should('have.length', 0); // @todo update the seed data so we have a desmos room
    cy.getTestElement('all-roomType-filter').click();
    cy.url().should(
      'include',
      'community/rooms?privacy=all&roomType=all&search='
    );
    cy.getTestElement('box-list')
      .children()
      .should('have.length', 9);
  });

  // @todo test that we can search by description or instructions
  it('searches by description', function() {
    cy.getTestElement('community-search')
      .clear()
      .type('reference tool');
    cy.url().should(
      'include',
      'community/rooms?privacy=all&roomType=all&search=reference%20tool'
    );
    cy.getTestElement('box-list')
      .children()
      .should('have.length', 1);
  });

  // @todo add tests for course and activities
});
