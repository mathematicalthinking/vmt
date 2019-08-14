// const user = require('../fixtures/user');
// const course = require('../fixtures/course');
// const room = require('../fixtures/room');
// const activity = require('../fixtures/activity');

// const arr = [];

// xdescribe('create 50 courses', function() {
//   before(function() {
//     for (let i = 0; i < 150; i++) {
//       arr.push(i);
//     }
//     cy.task('restoreAll').then(() => {
//       cy.login(user);
//     });
//     // cy.visit('/myVMT/courses')
//   });

//   after(function() {
//     cy.logout();
//   });

//   it('creates a course', function() {
//     cy.wrap(arr).each((index) => {
//       cy.getTestElement('tab')
//         .contains('Courses')
//         .click();
//       cy.getTestElement('create-course').click();
//       cy.get('input[name=name]').type(course.name + index);
//       cy.get('input[name=description]').type(course.description + index);
//       cy.get('button')
//         .contains('next')
//         .click();
//       cy.get('button')
//         .contains('create')
//         .click();
//       cy.contains(course.name).should('exist');
//     });
//   });
// });
