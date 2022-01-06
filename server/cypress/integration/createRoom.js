// const capitalize = require('lodash/capitalize');
const user = require('../fixtures/user');
const room = require('../fixtures/room');
const users = require('../../seeders/users');

describe('shows corrects info after creating resources', function() {
  before(function() {
    cy.task('restoreAll').then(() => {
      cy.login(user);
    });
  });

  after(function() {
    // cy.logout();
  });

  it('creates a new public ggb room & lists it in user resources', function() {
    const { name } = room;

    cy.getTestElement('tab')
      .contains('Rooms')
      .click();

    cy.getTestElement(`create-room`).click();

    cy.get(`input[name=name]`).type(name);
    cy.get('button')
      .contains('create')
      .click();
    cy.get('button')
      .contains('next')
      .click();
    cy.get('button')
      .contains('next')
      .click();
    cy.get('button')
      .contains('next')
      .click();
    cy.get('button')
      .contains('create')
      .click();

    cy.wait(1000);

    cy.getTestElement(`content-box-${name}`).should('have.length', 1);

    const originalRooms = users[0].rooms.length;
    cy.getTestElement('box-list')
      .children()
      .should('have.length', originalRooms + 1);
  });
});
