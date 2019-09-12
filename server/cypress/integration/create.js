const user = require('../fixtures/user');
const course = require('../fixtures/course');
const room = require('../fixtures/room');
const activity = require('../fixtures/activity');

function next() {
  cy.get('button')
    .contains('next')
    .click();
}

function create() {
  cy.get('button')
    .contains('create')
    .click();
}

describe('create each type of resource', function() {
  before(function() {
    cy.task('restoreAll').then(() => {
      cy.login(user);
    });
  });

  after(function() {
    cy.logout();
  });

  it('creates a course', function() {
    cy.getTestElement('tab')
      .contains('Courses')
      .click();
    cy.getTestElement('create-course').click();
    cy.get('input[name=name]').type(course.name);
    cy.get('input[name=description]').type(course.description);
    cy.get('button')
      .contains('next')
      .click();
    cy.get('button')
      .contains('create')
      .click();
    cy.contains(course.name).should('exist');
  });

  it('creates a new room', function() {
    // cy.get('button').click()
    cy.getTestElement('tab')
      .contains('Rooms')
      .click();
    cy.getTestElement('create-room').click();
    cy.get('input[name=name]')
      .type('{selectall} {backspace}')
      .type(room.name);
    cy.get('input[name=description]')
      .type('{selectall} {backspace}')
      .type(room.description);
    cy.get('button')
      .contains('create a new room')
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
    cy.contains(room.name).should('exist');
  });

  it('creates an activity', function() {
    cy.getTestElement('tab')
      .contains('Activities')
      .click();
    cy.url().should('include', '/myVMT/activities');
    cy.get('button')
      .contains('Create')
      .click();
    cy.get('input[name=name]')
      .type('{selectall} {backspace}')
      .type(activity.name);
    cy.get('input[name=description]')
      .type('{selectall} {backspace}')
      .type(activity.description);
    cy.get('button')
      .contains('create a new activity')
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
    cy.contains(activity.name).should('exist');
  });

  it('creates a room from an activity', function() {
    cy.getTestElement('tab')
      .contains('Rooms')
      .click();
    cy.getTestElement('create-room').click();
    cy.get('input[name=name]')
      .type('{selectall} {backspace}')
      .type('room from activity');
    cy.get('input[name=description]')
      .type('{selectall} {backspace}')
      .type(room.description);
    cy.get('button')
      .contains('copy existing activities')
      .click();
    cy.getTestElement('ACTIVITY 2-checkbox').click();
    cy.get('button')
      .contains('next')
      .click();
    cy.get('button')
      .contains('next')
      .click();
    cy.get('button')
      .contains('create')
      .click();
    cy.contains('room from activity').should('exist');
  });

  it('creates an activity from an existing activity', function() {
    cy.getTestElement('tab')
      .contains('Activities')
      .click();
    cy.getTestElement('create-activity').click();
    cy.get('input[name=name]')
      .type('{selectall} {backspace}')
      .type('activity from existing activity');
    cy.get('input[name=description]')
      .type('{selectall} {backspace}')
      .type(room.description);
    cy.get('button')
      .contains('copy existing activities')
      .click();
    cy.getTestElement('ACTIVITY 2-checkbox').click();
    cy.get('button')
      .contains('next')
      .click();
    cy.get('button')
      .contains('create')
      .click();
    cy.contains('activity from existing activity').should('exist');
  });

  it('creates a course activity', function() {
    cy.getTestElement('tab')
      .contains('Courses')
      .click();
    cy.getTestElement('content-box-course 1').click();
    cy.url().should('include', '/myVMT/courses');
    cy.url().should('include', '/activities');
    cy.getTestElement('tab')
      .contains('Activities')
      .click();
    cy.get('button')
      .contains('Create')
      .click();
    cy.get('input[name=name]')
      .type('{selectall} {backspace}')
      .type(course.activity.name);
    cy.get('input[name=description]')
      .type('{selectall} {backspace}')
      .type(course.activity.description);
    cy.get('button')
      .contains('create a new activity')
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
    cy.contains(course.activity.name).should('exist');
  });

  it('creates a course room', function() {
    cy.getTestElement('tab')
      .contains('Rooms')
      .click();
    cy.url().should('include', '/myVMT/courses');
    cy.url().should('include', '/rooms');
    cy.get('button')
      .contains('Create')
      .click();
    cy.get('input[name=name]')
      .type('{selectall} {backspace}')
      .type(course.room.name);
    cy.get('input[name=description]')
      .type('{selectall} {backspace}')
      .type(course.room.description);
    cy.get('button')
      .contains('create a new room')
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
    cy.contains(course.room.name).should('exist');
  });

  it('creates a room from a ggb file', function() {
    const roomName = `${room.name} with ggb file`;

    cy.getTestElement('tab')
      .contains('Rooms')
      .click();
    cy.getTestElement('create-room').click();
    cy.get('input[name=name]')
      .type('{selectall} {backspace}')
      .type(roomName);
    cy.get('button')
      .contains('create a new room')
      .click();

    // choose Geogebra or desmos - default GeoGebra
    next();

    const fileName = 'ggbFiles/list-of-functions.ggb';
    cy.fixture(fileName, 'base64').then((fileContent) => {
      cy.get('input[name=ggbFile]').upload({
        fileContent,
        fileName,
        mimeType: 'application/zip',
        encoding: 'base64',
      });

      next(); // move past file screen

      // select date(optional)
      next();

      // select public or private; default private
      create();
      cy.contains(roomName).should('exist');

      // go in to room and make sure the file loads
      cy.contains(roomName).click();
      cy.contains('Enter').click();

      // check that the file loaded
      // should be items in the left algebra panel
      const numAlgebraPanelItems = 11;
      cy.get('.gwt-TreeItem').should('have.length', numAlgebraPanelItems);
    });
  });

  // it("creates a course room from a course activity", function() {
  //   cy.getTestElement("content-box-course 1").click();
  //   cy.getTestElement("tab")
  //     .contains("Activities")
  //     .click();
  //   cy.getTestElement(`content-box-ACTIVITY 2`).click();
  //   cy.url("include", "/activities");
  //   cy.url("include", "/details");
  //   cy.contains("Assign").click();
  //   cy.getTestElement("next-step-assign");
  //   cy.get("input[name=dueDate]").type(course.room.dueDate);
  //   cy.get("input[name=manual]").check();
  //   cy.getTestElement("assign-rooms").click();
  //   cy.getTestElement("tab")
  //     .contains("Rooms")
  //     .click();
  //   cy.getTestElement(`content-box-${course.activity.name} (room 1)`).should(
  //     "exist"
  //   );
  // });

  // @TODO MAKE SURE THIS WORKS WITH COURSE ACTIVITIES AND STAND ALONE ACTIVITIES
  // it('adds a community activitity to user1s stand alone activities', function(){
  //   cy.getTestElement('crumb').contains('My VMT').click()
  //   cy.getTestElement('tab').contains('Activities').click()
  //   // cy.getTestElement('box-list').contains("There doesn't appear to be anything here yet").should('exist')
  //   cy.contains('Select an activity from the community').click()
  //   cy.url().should('include', 'community/activities/selecting')
  //   cy.getTestElement('select-tag').should('exist')
  //   cy.getTestElement('select-count').contains('0').should('exist')
  //   cy.getTestElement('content-box-ACTIVITY 1').trigger('mouseover')
  //   cy.getTestElement('overlay-ACTIVITY 1').click();
  //   cy.getTestElement('select-count').contains('1').should('exist')
  //   cy.contains('My VMT').click()
  //   cy.getTestElement('tab').contains('Activities').click()
  //   cy.getTestElement('box-list').children().first().contains("ACTIVITY 1").should('exist')
  // })

  // it("creates a course room by assigning a course's activity", function(){
  //   cy.login(user)
  //   cy.getTestElement('tab').contains('Courses').click()
  //   cy.getTestElement('content-box-course 2').click()
  //   cy.getTestElement('content-box-ACTIVITY 2').click()
  //   cy.getTestElement('assign').click()
  //   cy.get('[type="radio"]').last().check()
  //   cy.contains('g_laforge').click()
  //   cy.contains('data').click()
  //   cy.getTestElement('assign-rooms').click();
  //   cy.contains('worf').click()
  //   cy.getTestElement('assign-rooms').click();
  //   cy.getTestElement('content-box-ACTIVITY 2 (room 1)').should('exist');
  //   cy.getTestElement('content-box-ACTIVITY 2 (room 2)').should('exist');
  // })

  // it('selects an existing stand alone activity and adds it to a course', function(){
  //   cy.getTestElement('crumb').contains('course 2').click()
  //   cy.getTestElement('tab').contains('Activities').click()
  //   cy.get('button').contains('Select an existing activity').click()
  //   cy.get('[type="radio"]').last().check()
  //   cy.getTestElement('content-box-test activity 1').trigger('mouseover')
  //   cy.getTestElement('overlay-test activity 1').click()
  //   cy.get('button').contains('Done').click()
  //   cy.getTestElement('box-list').children().should('have.length', 2)
  // })

  // it("creates a course room from a course activity", function(){
  //   cy.getTestElement('tab').contains('Rooms').click()
  //   cy.getTestElement('box-list').children().should('have.length', 2)
  //   cy.get('button').contains('Create from an Activity').click()
  //   cy.get('[type="radio"]').last().check()
  //   cy.getTestElement('content-box-test activity 1').trigger('mouseover')
  //   cy.getTestElement('overlay-test activity 1').click()
  //   cy.get('button').contains('Done').click()
  //   cy.getTestElement('box-list').children().should('have.length', 3)
  //   cy.getTestElement('box-list').contains('test activity 1 (room)').should('exist')
  // })

  // it("creates a course room from a standalone activity", function(){
  //   cy.getTestElement('box-list').children().should('have.length', 3)
  //   cy.get('button').contains('Create from an Activity').click()
  //   cy.get('[type="radio"]').eq(1).check()
  //   cy.getTestElement('content-box-ACTIVITY 1').trigger('mouseover')
  //   cy.getTestElement('overlay-ACTIVITY 1').click()
  //   cy.get('button').contains('Done').click()
  //   cy.getTestElement('box-list').children().should('have.length', 4)
  //   cy.getTestElement('box-list').contains('ACTIVITY 1 (room)').should('exist')
  // })

  // it('creates a standalone room from a standalone activity', function(){
  //   cy.getTestElement('crumb').contains('My VMT').click()
  //   cy.getTestElement('tab').contains('Rooms').click()
  //   cy.get('button').contains('Create from an Activity').click()
  //   cy.get('[type="radio"]').last().check()
  //   cy.getTestElement('content-box-test activity 1').trigger('mouseover')
  //   cy.getTestElement('overlay-test activity 1').click()
  //   cy.get('button').contains('Done').click()
  //   cy.getTestElement('box-list').contains('test activity 1 (room)').should('exist')
  // })

  // SHOULD WE ALLOW THIS?
  //   it('creates a standalone room from a course activity', function(){
  //     cy.getTestElement('crumb').contains('My VMT').click()
  //   })

  //   it("")
});
