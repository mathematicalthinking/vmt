const user2 = require('../fixtures/user2')
const course = require('../fixtures/course')
const room = require('../fixtures/room')

describe('show different views based on role', function(){
  before(function(){
    cy.task('seedDB').then(() => {cy.login(user2)})
    // cy.visit('/myVMT/courses')
  })
  it('does not display the toggle option when a user only a participant (course)', function(){
    cy.getTestElement('content-box-course 2').should('exist')
  })
  it('displays the toggle after the participant creates a COURSE (becoming a facilitator)', function(){
    cy.getTestElement('become-facilitator').click()
    cy.getTestElement('create-course').click()
    cy.get('input[name=name]').type(course.name)
    cy.get('button').contains('next').click()
    cy.get('button').contains('create').click()
    cy.contains(course.name).should('exist')
    cy.get('button').contains('Facilitator').should('be.visible');
  })
  // it('toggles the resources when the user switches view (course)', function(){
  //   cy.contains('Participant').click();
  //   cy.contains(course.name).should('not.exist')
  //   cy.contains('course 2').should('exist')
  //   cy.get('#Activities').click()
  //   cy.contains('Facilitator').should('not.exist');
  //   cy.get('#Rooms').click()
  //   cy.contains('Facilitator').should('not.exist');
  //   cy.get('#Courses').click()
  //   cy.contains('Facilitator').should('exist');
  // })
  it('does not display the toggle option when a user only a participant (room)', function(){
    cy.get('#Rooms').click()
    cy.getTestElement('content-box-room 2').should('exist')
  })
  it('displays the toggle after the participant creates a ROOM (becoming a facilitator)', function(){
    cy.getTestElement('create-room').click()
    cy.get('input[name=name]').type('{selectall} {backspace}').type(room.name)
    cy.get('input[name=description]').type('{selectall} {backspace}').type(room.description)
    cy.get('button').contains('create a new room').click()
    cy.get('button').contains('next').click()
    cy.get('button').contains('next').click()
    cy.get('button').contains('create').click()
    cy.contains(room.name).should('exist')
    cy.get('button').contains('Facilitator').should('be.visible');
  })
  // it('toggles the resources when the user switches view (room)', function(){
  //   cy.contains('Participant').click();
  //   cy.contains(room.name).should('not.exist')
  //   cy.contains('room 2').should('exist')
  //   cy.get('#Activities').click()
  //   cy.contains('Facilitator').should('not.exist');
  //   cy.get('#Courses').click()
  //   cy.contains('Facilitator').should('exist');
  // })
})