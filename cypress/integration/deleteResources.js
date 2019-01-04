const user5 = require('../fixtures/user5');

describe('Delete resource', function(){
  before(function(){
    cy.task('seedDB').then(() => cy.login(user5))
  })

  // COURSE
  it("deletes a stand alone room", function(){
    cy.getTestElement('tab').contains('Rooms').click()
    cy.getTestElement("content-box-Deanna's stand alone room").click()
    cy.getTestElement('edit-room').click()
    cy.getTestElement('trash-room').click()
    cy.getTestElement('confirm-trash').click()
    cy.getTestElement('tab').contains('Rooms').click()
    cy.contains("Deanna's stand alone room").should('not.exist')
  })

  it("deletes a stand alone activity", function(){
    cy.getTestElement('tab').contains('Activities').click()
    cy.getTestElement("content-box-Deanna's stand alone activity").click()
    cy.getTestElement('edit-activity').click()
    cy.getTestElement('trash-activity').click()
    cy.getTestElement('confirm-trash').click()
    cy.getTestElement('tab').contains('Activities').click()
    cy.contains("Deanna's stand alone room").should('not.exist')
  })

  it("deletes a course and all of its resources", function(){
    cy.getTestElement('tab').contains('Activities').click()
    cy.getTestElement("content-box-Deanna's course 1 activity").should('exist')
    cy.getTestElement('tab').contains('Rooms').click()
    cy.getTestElement("content-box-Deanna's course 1 room").should('exist')
    cy.getTestElement('tab').contains('Courses').click()
    cy.getTestElement("content-box-Deanna's course 1").click()
    cy.getTestElement('edit-course').click()
    cy.getTestElement('trash-course').click()
    cy.getTestElement('confirm-trash-children').click()
    cy.contains("Deanna's course 1").should('not.exist')
    cy.getTestElement('tab').contains('Activities').click()
    cy.contains("Deanna's course 1 activity").should('not.exist')
    cy.getTestElement('tab').contains('Rooms').click()
    cy.contains("Deanna's course 1 room").should('not.exist')
  })

  it("deletes a course but saves all of its resources", function(){
    cy.getTestElement('tab').contains('Activities').click()
    cy.getTestElement("content-box-Deanna's course 2 activity").should('exist')
    cy.getTestElement('tab').contains('Rooms').click()
    cy.getTestElement("content-box-Deanna's course 2 room").should('exist')
    cy.getTestElement('tab').contains('Courses').click()
    cy.getTestElement("content-box-Deanna's course 2").click()
    cy.getTestElement('edit-course').click()
    cy.getTestElement('trash-course').click()
    cy.getTestElement('confirm-trash').click()
    cy.contains("Deanna's course 2").should('not.exist')
    cy.getTestElement('tab').contains('Activities').click()
    cy.contains("Deanna's course 2 activity").should('exist')
    cy.getTestElement('tab').contains('Rooms').click()
    cy.contains("Deanna's course 2 room").should('exist')
  })

})