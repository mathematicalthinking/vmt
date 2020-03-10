const user1 = require('../fixtures/user');
const user2 = require('../fixtures/user2');
const user3 = require('../fixtures/user3');
const user5 = require('../fixtures/user5');
const user6 = require('../fixtures/user6');

describe('test notifications and access to resources', function() {
  before(function() {
    cy.task('restoreAll');
    cy.clearCookies();
  });

  after(function() {
    cy.logout();
  });

  // COURSE
  it('user2 requests access to course 1', function() {
    cy.login(user2);
    cy.wait(1000);
    cy.contains('Community').click({ force: true });
    cy.url().should('include', 'community/rooms');
    cy.contains('Courses').click({ force: true });
    cy.url().should('include', 'community/courses');
    cy.getTestElement('content-box-course 1').click({ force: true });
    cy.getTestElement('request-access-btn').click({ force: true });
    cy.url().should('include', '/confirmation');
    cy.logout();
  });
  it('user3 requests access to course 1', function() {
    cy.login(user3);
    cy.contains('Community').click({ force: true });
    cy.wait(1000);
    cy.url().should('include', 'community/rooms');
    cy.contains('Courses').click({ force: true });
    cy.url().should('include', 'community/courses');
    cy.getTestElement('content-box-course 1').click({ force: true });
    cy.getTestElement('request-access-btn').click({ force: true });
    cy.url().should('include', '/confirmation');
    cy.logout();
  });
  it('user1 gets 2 notifications and grants access to course 1', function() {
    cy.login(user1);
    cy.url().should('include', 'myVMT/rooms');
    cy.getTestElement('tab')
      .contains('Courses')
      .click({ force: true });
    //cy.wait(1111);
    cy.getTestElement('tab-ntf')
      .get('span:nth-child(2)')
      .contains('2')
      .should('exist');
    cy.getTestElement('content-box-ntf')
      .contains('2')
      .should('exist');
    cy.getTestElement('content-box-course 1').click({ force: true });
    // cy.getTestElement('tab-ntf').contains('1')
    cy.get('#Members').click({ force: true });
    cy.getTestElement('join-requests')
      .children()
      .should('have.length', 2); // One div is the request the other is the modal to trash it
    cy.getTestElement('grant-access-g_laforge').click({ force: true });
    cy.getTestElement('tab-ntf')
      .contains('1')
      .should('exist');
    cy.getTestElement('members')
      .children()
      .should('have.length', 2);
    cy.contains(user2.username).should('exist');
    cy.getTestElement('join-requests')
      .children()
      .should('have.length', 1);
    cy.getTestElement('grant-access-data').click({ force: true });
    cy.getTestElement('members')
      .children()
      .should('have.length', 3);
    cy.getTestElement('join-requests')
      .children()
      .contains('There are no new requests to join')
      .should('exist');
    cy.logout();

    // MAKE SURE THE NOTIFICATION IS VISUALLY RESOLVED
  });
  it('user3 gets a notification they have access to course 1', function() {
    cy.login(user3);
    cy.getTestElement('tab-ntf').contains('1');
    cy.getTestElement('tab')
      .contains('Courses')
      .click({ force: true });
    cy.getTestElement('tab-ntf').contains('1');
    cy.getTestElement('content-box-ntf').contains('1');
    cy.getTestElement('content-box-course 1').click({ force: true });
    cy.get('p').contains('Welcome to course 1.');
    cy.contains('Explore').click({ force: true });
    cy.contains('My VMT').click({ force: true });
    cy.getTestElement('tab-ntf').should('not.exist');
    cy.getTestElement('content-box-ntf').should('not.exist');
    cy.logout();
    // NAVIGATE BACK AND MAKE SURE NOTIFICATIONS HAVE BEEN RESOLVED
  });

  it('user1 assigns user3 to a course room', function() {
    cy.login(user1);
    cy.getTestElement('tab')
      .contains('Courses')
      .click({ force: true });
    cy.getTestElement('content-box-course 2').click({ force: true });
    cy.getTestElement('content-box-ACTIVITY 2').click({ force: true });
    cy.getTestElement('assign').click({ force: true });
    cy.getTestElement('next-step-assign').click({ force: true });
    cy.getTestElement('assign-manually').click({ force: true });
    cy.contains('data').click({ force: true });
    // cy.contains('worf').click({force: true})
    // cy.contains('g_laforge').click({force: true})
    cy.getTestElement('assign-rooms').click({ force: true });
    cy.getTestElement('close-modal').click({ force: true });
    cy.getTestElement('tab')
      .contains('Rooms')
      .click({ force: true });
    cy.getTestElement('content-box-ACTIVITY 2 (room 1)').should('exist');
    cy.logout();
  });

  it('User3 gets a notification they have been assigned to a new course room', function() {
    cy.login(user3);
    cy.getTestElement('tab-ntf')
      .contains('1')
      .should('exist');
    cy.getTestElement('tab')
      .contains('Courses')
      .click({ force: true });
    cy.getTestElement('tab-ntf')
      .contains('1')
      .should('exist');
    cy.getTestElement('content-box-ntf')
      .contains('1')
      .should('exist');
    cy.getTestElement('content-box-course 2').click({ force: true });
    cy.getTestElement('tab-ntf')
      .contains('1')
      .should('exist');
    cy.getTestElement('tab-ntf')
      .contains('1')
      .click({ force: true });
    cy.getTestElement('content-box-ACTIVITY 2 (room 1)').should('exist');
    cy.getTestElement('content-box-ntf')
      .contains('1')
      .should('exist');
    cy.getTestElement('content-box-ACTIVITY 2 (room 1)').click({ force: true });
    cy.getTestElement('explore-room').click({ force: true });
    cy.getTestElement('crumb').contains('My VMT');
    cy.getTestElement('tab-ntf').should('not.exist');
    cy.logout();
  });

  it('user2 assigns user 5 to a stand alone room', function() {
    cy.login(user1);
    cy.getTestElement('tab')
      .contains('Activities')
      .click({ force: true });
    cy.getTestElement('content-box-stand-alone-activity').click({
      force: true,
    });
    cy.getTestElement('assign').click({ force: true });
    cy.getTestElement('next-step-assign').click({ force: true });
    cy.getTestElement('member-search')
      .click({ force: true })
      .type('D', { force: true });
    cy.contains('d_troi').click({ force: true });
    cy.getTestElement('assign-rooms').click({ force: true });
    cy.getTestElement('tab')
      .contains('Rooms')
      .click({ force: true });
    cy.getTestElement('content-box-stand-alone-activity (room 1)').should(
      'exist'
    );
    cy.logout();
  });

  it('d_troi should have a new room notification', function() {
    cy.login(user5);
    cy.getTestElement('tab-ntf')
      .contains('1')
      .should('exist');
    cy.getTestElement('tab')
      .contains('Rooms')
      .click({ force: true });
    cy.getTestElement('content-box-stand-alone-activity (room 1)').should(
      'exist'
    );
    cy.getTestElement('content-box-ntf')
      .contains('1')
      .should('exist');
    cy.getTestElement('content-box-stand-alone-activity (room 1)').click({
      force: true,
    });
    cy.getTestElement('explore-room').click({ force: true });
    cy.getTestElement('crumb')
      .contains('My VMT')
      .click({ force: true });
    cy.getTestElement('tab-ntf').should('not.exist');
    cy.logout();
  });

  it('user2 enters course with entry-code', function() {
    cy.login(user2);
    cy.contains('Community').click({ force: true });
    cy.wait(1000);
    cy.contains('Courses').click({ force: true });
    cy.url().should('include', 'community/courses');
    cy.getTestElement('content-box-entry-code course').click({ force: true });
    cy.get('#entryCode')
      .type('{selectall} {backspace}', { force: true })
      .type('entry-code-10', { force: true });
    cy.contains('Join').click({ force: true });
    cy.getTestElement('tab')
      .contains('Members')
      .click({ force: true });
    cy.getTestElement('members')
      .children()
      .should('have.length', 2);
    cy.contains(user2.username).should('exist');
    cy.logout();
  });

  it('user1 gets notification that user2 joined course', function() {
    cy.login(user1);
    cy.getTestElement('tab-ntf').contains('1');
    cy.getTestElement('tab')
      .contains('Courses')
      .click({ force: true });
    cy.getTestElement('tab-ntf').contains('1');
    cy.getTestElement('content-box-ntf').contains('1');
    cy.getTestElement('content-box-entry-code course').click({ force: true });
    cy.getTestElement('tab-ntf').contains('1');
    cy.getTestElement('tab')
      .contains('Members')
      .click({ force: true });
    cy.getTestElement('members')
      .children()
      .should('have.length', 2);
    cy.getTestElement('members')
      .children()
      .contains('g_laforge');
    cy.getTestElement('member-ntf').should('exist');
  });

  it('should resolve notificaiton after user1 seees', function() {
    cy.getTestElement('crumb')
      .contains('My VMT')
      .click({ force: true });
    cy.getTestElement('tab-ntf').should('not.exist');
    cy.getTestElement('content-box-ntf').should('not.exist');
    cy.logout();
  });

  //  // ROOM
  it('user2 requests access to room', function() {
    cy.login(user2);
    cy.contains('Community').click({ force: true });
    cy.wait(500);
    cy.contains('Rooms').click({ force: true });
    cy.wait(500);
    cy.getTestElement('content-box-request access').click({ force: true });
    cy.getTestElement('request-access-btn').click({ force: true });
    cy.url().should('include', '/confirmation');
    cy.logout();
  });

  it('user1 grants access to user2 (room)', function() {
    cy.login(user1);
    cy.getTestElement('tab-ntf')
      .contains('1')
      .click({ force: true });
    cy.getTestElement('content-box-ntf').contains('1');
    cy.getTestElement('content-box-request access').click({ force: true });
    cy.getTestElement('tab-ntf').contains('1');
    cy.get('#Members').click({ force: true });
    cy.getTestElement('join-requests')
      .children()
      .should('have.length', 1);
    cy.getTestElement('grant-access-g_laforge').click({ force: true });
    cy.getTestElement('tab-ntf').should('not.exist');
    cy.getTestElement('members')
      .children()
      .should('have.length', 2);
    cy.contains(user2.username).should('exist');
    cy.logout();
  });

  it('user2 now has access to room', function() {
    cy.login(user2);
    cy.getTestElement('tab-ntf')
      .contains('1')
      .should('exist');
    cy.getTestElement('tab')
      .contains('Rooms')
      .click({ force: true });
    cy.getTestElement('content-box-ntf')
      .contains('1')
      .should('exist');
    cy.getTestElement('content-box-request access').click({ force: true });
    cy.contains('Explore').click({ force: true });
    cy.getTestElement('tab')
      .contains('Members')
      .click({ force: true });
    cy.getTestElement('members')
      .children()
      .should('have.length', 2);
    cy.getTestElement('crumb')
      .contains('My VMT')
      .click({ force: true });
    // cy.getTestElement('tab-ntf').should('not.exist') // we might want to chec
  });

  it('user2 joins a room by entering entry-code', function() {
    cy.contains('Community').click({ force: true });
    cy.wait(500);
    cy.url().should('include', 'community/rooms');
    cy.getTestElement('content-box-room 1').click({ force: true });
    cy.get('#entryCode')
      .type('{selectall} {backspace}', { force: true })
      .type('rare-shrimp-45', { force: true });
    cy.contains('Join').click({ force: true });
    cy.url().should('include', 'details');
    cy.logout();
  });

  it('user 1 should get a notification that user2 joined', function() {
    cy.login(user1);
    cy.getTestElement('tab-ntf').contains('1');
    cy.getTestElement('tab')
      .contains('Rooms')
      .click({ force: true });
    cy.getTestElement('content-box-ntf').contains('1');
    cy.getTestElement('content-box-room 1').click({ force: true });
    cy.getTestElement('tab-ntf').contains('1');
    cy.getTestElement('tab')
      .contains('Members')
      .click({ force: true });
    cy.getTestElement('members')
      .children()
      .should('have.length', 2);
    cy.getTestElement('members')
      .children()
      .contains('g_laforge');
    cy.getTestElement('member-ntf').should('exist');
  });

  it('should resolve the notification after user 1 has seen it', function() {
    cy.getTestElement('tab')
      .contains('Details')
      .click({ force: true });
    cy.getTestElement('tab-ntf').should('not.exist');
  });

  it('Picard invites Beverly to join a course', function() {
    cy.getTestElement('crumb')
      .contains('My VMT')
      .click({ force: true });
    cy.getTestElement('tab')
      .contains('Courses')
      .click({ force: true });
    cy.getTestElement('content-box-course 1').click({ force: true });
    cy.getTestElement('tab')
      .contains('Members')
      .click({ force: true });
    cy.getTestElement('member-search')
      .click({ force: true })
      .type('Bc', { force: true });
    cy.getTestElement('invite-member-bcrush').click({ force: true });
    cy.getTestElement('member-bcrush').should('exist');
  });

  it('Picard invites Beverly to join a room', function() {
    cy.getTestElement('crumb')
      .contains('My VMT')
      .click({ force: true });
    cy.wait(1000);
    cy.getTestElement('tab')
      .contains('Rooms')
      .click({ force: true });
    cy.getTestElement('content-box-room 1').click({ force: true });
    cy.getTestElement('tab')
      .contains('Members')
      .click({ force: true });
    cy.getTestElement('member-search')
      .click({ force: true })
      .type('Bc', { force: true });
    cy.getTestElement('invite-member-bcrush').click({ force: true });
    cy.getTestElement('member-bcrush').should('exist');
    cy.logout();
  });

  it('Beverly gets a notification shes been added to a course', function() {
    cy.login(user6);
    cy.getTestElement('tab-ntf')
      .contains('1')
      .should('exist');
    cy.getTestElement('tab')
      .contains('Courses')
      .click({ force: true });
    cy.getTestElement('content-box-ntf').contains('1');
    cy.getTestElement('content-box-course 1').click({ force: true });
    cy.getTestElement('join').click({ force: true });
  });

  it('Beverly gets a notification shes been added to a room', function() {
    cy.getTestElement('crumb')
      .contains('My VMT')
      .click({ force: true });
    cy.getTestElement('tab')
      .contains('Rooms')
      .click({ force: true });
    cy.getTestElement('content-box-ntf').contains('1');
    cy.getTestElement('content-box-room 1').click({ force: true });
    cy.getTestElement('leave').click({ force: true });
    cy.getTestElement('content-box-room 1').should('not.exist');
    cy.logout();
  });

  it('user fails to join with wrong entry code (room)', function() {
    cy.login(user2);
    cy.contains('Community').click({ force: true });
    cy.wait(1000);
    cy.url().should('include', 'community/rooms');
    cy.getTestElement('content-box-wrong entry code room').click({
      force: true,
    });
    cy.get('#entryCode')
      .type('{selectall} {backspace}', { force: true })
      .type('WRONG_CODE', { force: true });
    cy.contains('Join').click({ force: true });
    cy.getTestElement('entry-code-error').contains(
      'That entry code was incorrect. Try again.'
    );
    cy.getTestElement('close-modal').click({ force: true });
  });

  it('user fails to join with wrong entry code (course)', function() {
    cy.contains('Courses').click({ force: true });
    cy.url().should('include', 'community/courses');
    cy.getTestElement('content-box-wrong entry code course').click({
      force: true,
    });
    cy.get('#entryCode')
      .type('{selectall} {backspace}', { force: true })
      .type('WRONG_CODE', { force: true });
    cy.contains('Join').click({ force: true });
    cy.getTestElement('entry-code-error')
      .contains('That entry code was incorrect. Try again.')
      .should('exist');
  });
});
