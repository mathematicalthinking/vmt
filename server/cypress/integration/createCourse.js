// Create a course

// 1. restore all (seed db)
// 2. login as jl_picard (pw: "enterprise")

const user1 = require('../fixtures/user');
describe('course creation works as intended', function() {
  beforeEach(function() {
    cy.window().then((win) => {
      win.sessionStorage.clear();
      win.localStorage.clear();
      cy.restoreAll();
      cy.clearCookies();
      cy.visit('/');
    });
  });
});

// 3. from url: http://localhost:3000/myVMT/rooms
// click COURSES tab
// cy.getTestElement('tab-Courses')

// 4. click CREATE
// cy.getTestElement('create-course')

// 5. Enter the course name: "test course"
// cy.getTestElement('courses-name')

// 6. click next button
// cy.getTestElement('courses-next-button')

// 7. click create button
// cy.getTestElement('courses-next-button')
// cy.getTestElement('create')
// if that doesn't work, try clicking the div that wraps that button
// cy.getTestElement('courses-create-button')

// 8. "test course" course should be visible on the page
// cy.getTestElement('ContentBox-Link-test course')
