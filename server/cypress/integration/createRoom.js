// const capitalize = require('lodash/capitalize');
const user = require('../fixtures/user');
const room = require('../fixtures/room');
const users = require('../../seeders/users');

describe('shows corrects info after creating resources', function() {
  beforeEach(function() {
    cy.task('restoreAll').then(() => {
      cy.login(user);
    });
  });

  afterEach(function() {
    cy.logout();
  });

  it('creates a new public ggb room & lists it once in user resources', function() {
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

  it('creates a new public ggb room & exactly ONE new resources is added to list', function() {
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

    const originalRooms = users[0].rooms.length;
    cy.getTestElement('box-list')
      .children()
      .should('have.length', originalRooms + 1);
  });
});
