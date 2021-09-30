const user5 = require('../fixtures/user5');

describe('Edit Resources', function() {
  before(function() {
    cy.task('restoreAll').then(() => cy.login(user5));
  });

  after(function() {
    cy.logout();
  });

  it('successfully edits all fields of a room', function() {
    cy.getTestElement('tab')
      .contains('Rooms')
      .click();
    cy.getTestElement("content-box-Deanna's stand alone room").click();
    cy.getTestElement('edit-room').click();
    cy.getTestElement('edit-name')
      .type('{selectall} {backspace}')
      .type('NEW NAME');
    cy.getTestElement('edit-description')
      .type('{selectall} {backspace}')
      .type('NEW DESCRIPTION');
    cy.getTestElement('edit-instructions')
      .type('{selectall} {backspace}')
      .type('NEW INSTRUCTIONS');
    cy.getTestElement('edit-entryCode')
      .type('{selectall} {backspace}')
      .type('NEW ENTRY CODE');
    cy.getTestElement('edit-private').click();
    cy.getTestElement('save-room').click();
    cy.wait(1000);
    cy.getTestElement('name')
      .contains('NEW NAME')
      .should('exist');
    cy.getTestElement('description')
      .contains('NEW DESCRIPTION')
      .should('exist');
    cy.getTestElement('instructions')
      .contains('NEW INSTRUCTIONS')
      .should('exist');
    cy.getTestElement('entryCode')
      .contains('NEW ENTRY CODE')
      .should('exist');
    cy.getTestElement('privacySetting')
      .contains('private')
      .should('exist');
  });

  it('successfully edits all fields of a course', function() {
    cy.getTestElement('crumb')
      .contains('My VMT')
      .click();
    cy.getTestElement('tab')
      .contains('Courses')
      .click();
    cy.getTestElement("content-box-Deanna's course 1").click();
    cy.getTestElement('edit-course').click();
    cy.getTestElement('edit-name')
      .type('{selectall} {backspace}')
      .type('NEW NAME');
    cy.getTestElement('edit-description')
      .type('{selectall} {backspace}')
      .type('NEW DESCRIPTION');
    cy.getTestElement('edit-entryCode')
      .type('{selectall} {backspace}')
      .type('NEW ENTRY CODE');
    cy.getTestElement('edit-private').click();
    cy.getTestElement('save-course').click();
    cy.wait(1000);
    cy.getTestElement('name')
      .contains('NEW NAME')
      .should('exist');
    cy.getTestElement('description')
      .contains('NEW DESCRIPTION')
      .should('exist');
    cy.getTestElement('entryCode')
      .contains('NEW ENTRY CODE')
      .should('exist');
    cy.getTestElement('privacySetting')
      .contains('private')
      .should('exist');
  });

  it('successfully edits all fields of an activity', function() {
    cy.getTestElement('crumb')
      .contains('My VMT')
      .click();
    cy.getTestElement('tab')
      .contains('Templates')
      .click();
    cy.getTestElement("content-box-Deanna's stand alone activity").click();
    cy.getTestElement('edit-template').click();
    cy.getTestElement('edit-name')
      .type('{selectall} {backspace}')
      .type('NEW NAME');
    cy.getTestElement('edit-description')
      .type('{selectall} {backspace}')
      .type('NEW DESCRIPTION');
    cy.getTestElement('edit-instructions')
      .type('{selectall} {backspace}')
      .type('NEW INSTRUCTIONS');
    cy.getTestElement('edit-private').click();
    cy.getTestElement('save-template').click();
    cy.wait(1000);
    cy.getTestElement('name')
      .contains('NEW NAME')
      .should('exist');
    cy.getTestElement('description')
      .contains('NEW DESCRIPTION')
      .should('exist');
    cy.getTestElement('instructions')
      .contains('NEW INSTRUCTIONS')
      .should('exist');
    cy.getTestElement('privacySetting')
      .contains('private')
      .should('exist');
  });

  // it("fails to edit a room if connection lost", function(){
  //   cy.request('http://localhost:3001/test/disconnect')
  //     .then(res => console.log(res))

  //   // process.exit();
  //   // cy.getTestElement()
  //   // cy.getTestElement('tab').contains('Rooms').click()
  //   // cy.getTestElement("content-box-Deanna's stand alone room").click()
  //   // cy.getTestElement('edit-room').click()
  //   // cy.getTestElement('edit-name').type('{selectall} {backspace}').type("NEW NAME")
  //   // cy.getTestElement('edit-description').type('{selectall} {backspace}').type("NEW DESCRIPTION")
  //   // cy.getTestElement('edit-instructions').type('{selectall} {backspace}').type("NEW INSTRUCTIONS")
  //   // cy.getTestElement('edit-entryCode').type('{selectall} {backspace}').type("NEW ENTRY CODE")
  //   // cy.getTestElement('edit-private').click()
  //   // cy.getTestElement('save-room').click()
  //   // cy.wait(1000)
  //   // cy.getTestElement('name').contains("NEW NAME").should('exist')
  //   // cy.getTestElement('description').contains("NEW DESCRIPTION").should('exist')
  //   // cy.getTestElement('instructions').contains("NEW INSTRUCTIONS").should('exist')
  //   // cy.getTestElement('entryCode').contains("NEW ENTRY CODE").should('exist')
  //   // cy.getTestElement('privacySetting').contains("private").should('exist')
  // })
});
