const user = require('../fixtures/user');
const course = require('../fixtures/course');
const room = require('../fixtures/room');
const activity = require('../fixtures/activity');
const arr = [];

xdescribe('create each type of resource', function() {
  before(function() {
    for (let i = 0; i < 50; i++) {
      arr.push(i);
    }
    cy.task('seedDB').then(() => {
      cy.login(user);
    });
    // cy.visit('/myVMT/courses')
  });
  it('creates a course', function() {
    cy.wrap(arr).each(index => {
      cy.getTestElement('tab')
        .contains('Courses')
        .click();
      cy.getTestElement('create-course').click();
      cy.get('input[name=name]').type(course.name + index);
      cy.get('input[name=description]').type(course.description + index);
      cy.get('button')
        .contains('next')
        .click();
      cy.get('button')
        .contains('create')
        .click();
      cy.contains(course.name).should('exist');
    });
  });
});
