const Q = require('../fixtures/user7');

describe('test admin privileges', function() {
  before(function() {
    cy.task('seedDB').then(() => cy.login(Q));
  });

  it('Q accesses a room he does not belong to', function() {
    cy.contains('Community').click();
    cy.getTestElement('content-box-room 2').click();
    cy.getTestElement('view-as-admin').click();
    cy.wait(5000);
    cy.url().should('include', 'myVMT/rooms/5ba289c57223b9429888b9b6/details');
  });

  it('Q can edit and delete this room', function() {
    cy.getTestElement('edit-room').click();
    cy.getTestElement('edit-instructions').type('new instructions');
    cy.getTestElement('save-room').click();
    cy.wait(1000);
    cy.contains('new instructions').should('exist');
    cy.getTestElement('edit-room').click();
    cy.getTestElement('trash-room').click();
    cy.getTestElement('confirm-trash').click();
    cy.url().should('include', 'myVMT/rooms');
    cy.contains('Community').click();
    cy.getTestElement('content-box-room 2').should('not.exist');
  });

  it('Q accesses a course he does not belong to', function() {
    cy.contains('Courses').click();
    cy.getTestElement('content-box-course 1').click();
    cy.getTestElement('view-as-admin').click();
    cy.url().should('include', 'courses/5bbb82f72539b95500cf526e/rooms');
  });

  it('Q can edit and delete this course', function() {
    cy.getTestElement('edit-course').click();
    cy.getTestElement('edit-description').type('new description');
    cy.getTestElement('save-course').click();
    cy.wait(1000);
    cy.contains('new description').should('exist');
    cy.getTestElement('edit-course').click();
    cy.getTestElement('trash-course').click();
    cy.getTestElement('confirm-trash').click();
    cy.url().should('include', 'myVMT/courses');
    cy.contains('Community').click();
    cy.contains('Courses').click();
    cy.getTestElement('content-box-course 1').should('not.exist');
  });

  it('Q accesses an activity he does not belong to', function() {
    cy.contains('Activities').click();
    cy.getTestElement('content-box-ACTIVITY 2').click();
    cy.url().should(
      'include',
      'myVMT/activities/5be1f0c83efa5f308cefb4c0/details'
    );
  });

  it('Q can edit and delete this activity', function() {
    cy.getTestElement('edit-activity').click();
    cy.getTestElement('edit-description').type('new description');
    cy.getTestElement('save-activity').click();
    cy.wait(1000);
    cy.contains('new description').should('exist');
    cy.getTestElement('edit-activity').click();
    cy.getTestElement('trash-activity').click();
    cy.getTestElement('confirm-trash').click();
    cy.url().should('include', 'myVMT/activities');
    cy.contains('Community').click();
    cy.contains('Activities').click();
    cy.getTestElement('content-box-ACTIVITY 2').should('not.exist');
  });

  it('Q makes picard an admin', function() {
    cy.getTestElement('nav-Profile').click({ force: true });
    cy.url().should('include', 'profile');
    cy.getTestElement('admin-list')
      .children()
      .should('have.length', 1);
    cy.getTestElement('member-search').type('picard');
    cy.getTestElement('invite-member-jl-picard').click();
    cy.getTestElement('admin-list')
      .children()
      .should('have.length', 2);
  });

  it('Q turns admin mode on for anonymous viewing', function() {
    cy.get('.fa-user')
      .first()
      .should('have.css', 'background-color')
      .and('eq', 'rgb(45, 145, 242)');
    cy.getTestElement('edit-On').click();
    cy.get('.fa-user')
      .first()
      .should('have.css', 'background-color')
      .and('eq', 'rgb(255, 213, 73)');
    cy.contains('My VMT').click();
    cy.contains("Q's Admin Room").click();
    cy.getTestElement('Enter').click();
    cy.contains('You are currently in "Admin Mode"').should('exist');
  });
});
