import user from '../fixtures/user9';

const { room } = require('../fixtures/desmosReplayer');

describe('Desmos Replayer', function() {
  before(function() {
    cy.task('restoreAll').then(() => cy.login(user));
  });

  after(function() {
    cy.logout();
  });

  function enterReplayer(roomName) {
    // assumes you are at myVmt
    cy.get('#Rooms').click();
    cy.contains(roomName).click();
    cy.getTestElement('Replayer').click();
    cy.getTestElement('room-name').contains(`${roomName} Replayer`);
  }

  function getEventDescriptions() {
    return cy.get('[data-testclass=event-desc]');
  }

  function checkEventDescByIx(ix, expectedText) {
    if (ix === 'last') {
      getEventDescriptions()
        .last()
        .children()
        .first()
        .should('contain', expectedText);
    } else {
      getEventDescriptions()
        .eq(ix)
        .children()
        .first()
        .should('contain', expectedText);
    }
  }

  it('should load correctly', function() {
    enterReplayer(room.name);
  });

  it('progress bar should show correct events/descriptions', function() {
    const firstDesc = `${user.username} joined ${room.name}`;
    const lastDesc = `${user.username} left the room`;
    checkEventDescByIx(0, firstDesc);
    checkEventDescByIx('last', lastDesc);
  });

  xit('plays', function() {});

  xit('stops', function() {});
});
