const capitalize = require('lodash/capitalize');
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

function typeInput(inputName, text, options = {}) {
  const { doClear = false } = options;

  if (doClear) {
    cy.get(`input[name=${inputName}]`)
      .type('{selectall} {backspace}')
      .type(text);
  } else {
    cy.get(`input[name=${inputName}]`).type(text);
  }
}

function createResource(details) {
  const {
    name,
    description,
    resourceType,
    existingActivityNames,
    roomType,
    ggbAppType = 'classic',
    ggbFileName,
    dueDate,
    privacy = 'public',
    desmosLink,
    numTabs,
  } = details;

  const plural =
    resourceType === 'activity' ? 'Activities' : `${capitalize(resourceType)}s`;
  cy.getTestElement('tab')
    .contains(plural)
    .click();
  cy.getTestElement(`create-${resourceType}`).click();

  if (name) {
    typeInput('name', name);
  }

  if (description) {
    typeInput('description', description);
  }

  if (resourceType === 'course') {
    next();
    if (privacy === 'private') {
      if (privacy === 'private') {
        cy.get('input[name=private]').click();
      }
    }
    create();
    cy.contains(name).should('exist');
  } else if (existingActivityNames) {
    cy.get('button')
      .contains('copy existing activities')
      .click();
    existingActivityNames.forEach((name) => {
      cy.getTestElement(`${name}-checkbox`).click();
    });

    next();

    if (resourceType === 'room') {
      if (dueDate) {
        // input date to date picker
      }
      next();
    }

    if (privacy === 'private') {
      cy.get('input[name=private]').click();
    }
    create();
    cy.contains(name).should('exist');

    if (numTabs) {
      cy.contains(name).click();

      const enterTestId = resourceType === 'room' ? 'Enter' : 'view-activity';

      cy.getTestElement(enterTestId).click();
      cy.getTestElement('tabs-container')
        .children()
        .should('have.length', numTabs + 1); // counting new tab btn
      cy.getTestElement('nav-My VMT').click();
    }
  } else {
    const buttonText = `create a new ${resourceType}`;
    cy.get('button')
      .contains(buttonText)
      .click();

    if (roomType === 'desmos') {
      cy.get('input[name=desmos]').click();
      next();

      if (desmosLink) {
        typeInput('desmosLink', desmosLink);
      }
      next();
      if (dueDate) {
        // handle dueDate
      }
      next();
      if (privacy === 'private') {
        cy.get('input[name=private]').click();
      }

      create();
      cy.contains(name).should('exist');
    } else {
      // ggb
      // move past ggb or desmos screen
      next();
      if (ggbAppType !== 'classic') {
        cy.getTestElement(ggbAppType).click();
      }
      if (ggbFileName) {
        cy.fixture(ggbFileName, 'base64').then((fileContent) => {
          cy.get('input[name=ggbFile]').upload({
            fileContent,
            ggbFileName,
            mimeType: 'application/zip',
            encoding: 'base64',
          });

          next(); // move past file screen
          if (resourceType === 'room') {
            if (dueDate) {
              // handle dueDate
            }
            next();
          }
          if (privacy === 'private') {
            cy.get('input[name=private]').click();
          }

          create();
          cy.contains(name).should('exist');
        });
      } else {
        next();
        if (resourceType === 'room') {
          if (dueDate) {
            // handle dueDate
          }
          next();
        }
        if (privacy === 'private') {
          cy.get('input[name=private]').click();
        }
        create();
        cy.contains(name).should('exist');
      }
    }
  }
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
  const { name, description } = course;
  it('creates a public course', function() {
    createResource({ resourceType: 'course', name, description });
  });

  it('creates a private course', function() {
    createResource({
      resourceType: 'course',
      name: `${name} private`,
      description,
      privacy: 'private',
    });
  });

  it('creates a new public ggb room', function() {
    const { name, description } = room;
    createResource({ resourceType: 'room', name, description });
  });

  it('creates a new private ggb room', function() {
    const { name, description } = room;
    createResource({
      resourceType: 'room',
      name: `${name} private`,
      description,
      privacy: 'private',
    });
  });

    it('creates and archives a new ggb room', function() {
    const { name, description } = room;
    createResource({
      resourceType: 'room',
      name: `${name} to archive`,
      description,
    });
    cy.getTestElement(`content-box-${name} to archive`).click();
    cy.getTestElement('edit-room')
      .contains('Edit Room')
      .click();
    cy.getTestElement('archive-room')
      .contains('ARCHIVE')
      .click();
    cy.getTestElement('confirm-archive')
      .contains('archive this room')
      .click();
    //Should return to the MyVMT rooms tab for this user
    cy.url("include", "/myVMT/rooms");
    //archived rooms should not appear on the myVMT page by default
    cy.getTestElement(`content-box-${name} to archive`).should('not.exist');
    //filter for archived rooms
    cy.getTestElement('archived-roomStatus-filter').click();
    //go to the archived room's detail page and restore it
    cy.getTestElement(`content-box-[ARCHIVED] ${name} to archive`)
      .contains(`[ARCHIVED] ${name} to archive`)
      .click();
    cy.getTestElement('restore-room')
      .contains('Restore Room')
      .click();
    cy.getTestElement('confirm-archive')
      .contains('restore this room')
      .click();
    //Should return to the MyVMT rooms tab for this user
    cy.url("include", "/myVMT/rooms");
    //restored room should appear on the myVMT page by default
    cy.getTestElement(`content-box-${name} to archive`).should('exist');
  });

  it('creates a public ggb activity', function() {
    const { name, description } = activity;
    createResource({ resourceType: 'activity', name, description });
  });

  it('creates a private ggb activity', function() {
    const { name, description } = activity;
    createResource({
      resourceType: 'activity',
      name: `${name} private`,
      description,
      privacy: 'private',
    });
  });

  it('creates a room from 1 activity', function() {
    const existingActivityNames = ['ACTIVITY 2'];
    const name = 'public room from activity 2';
    createResource({ resourceType: 'room', name, existingActivityNames });
  });

  it('creates a room from multiple activities', function() {
    const name = 'room from 3 activities';
    const existingActivityNames = [
      'ACTIVITY 2',
      'ssmith c1: integrals',
      'stand-alone-activity',
    ];
    createResource({
      resourceType: 'room',
      name,
      existingActivityNames,
      numTabs: 3,
    });
  });

  it('creates an activity from an existing activity', function() {
    const existingActivityNames = ['ACTIVITY 2'];
    const name = 'public activity from activity 2';
    createResource({ resourceType: 'activity', name, existingActivityNames });
  });

  it('creates an activity from multiple activities', function() {
    const name = 'activity from 3 activities';
    const existingActivityNames = [
      'ACTIVITY 2',
      'ssmith c1: integrals',
      'stand-alone-activity',
    ];
    createResource({
      resourceType: 'activity',
      name,
      existingActivityNames,
      numTabs: 3,
    });
  });

  it('creates a course activity', function() {
    cy.getTestElement('tab')
      .contains('Courses')
      .click();
    cy.getTestElement('content-box-course 1').click();
    cy.url().should('include', '/myVMT/courses');
    cy.url().should('include', '/activities');

    createResource({
      resourceType: 'activity',
      name: course.activity.name,
      description: course.activity.description,
    });
  });

  it('creates a course room', function() {
    cy.getTestElement('tab')
      .contains('Rooms')
      .click();
    cy.url().should('include', '/myVMT/courses');
    cy.url().should('include', '/rooms');

    createResource({
      resourceType: 'room',
      name: course.room.name,
      description: course.room.description,
    });
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
      // not sure of best way to do this
      const selector = 'div.applet_scaler > article.notranslate';

      cy.get(selector).then(($el) => {
        expect($el.length).to.eql(1);
      });
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
