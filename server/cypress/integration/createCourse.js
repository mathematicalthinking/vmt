/**
 * A. Create course "test course 1"
 */

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
// cy.getTestElement('create')
// if that doesn't work, try clicking the div that wraps that button
// cy.getTestElement('courses-create-button')

// 8. "test course" course should be visible on the page
// cy.getTestElement('ContentBox-Link-test course')

/**
 * B. Create a 2nd course
 */

// 9. repeat steps 1-8 for "test course 2"

/**
 * C. Create template "test course 1 template 1" within "test course 1"
 */

// 10. click "test course 1"
// screen.getByTestId('ContentBox-Link-test course 1')

// 11. click TEMPLATES tab
// screen.getByTestId('tab-Activities')

// 12. click CREATE
// screen.getByTestId('create-template')

// 13. target TEMPLATE NAME text input field, & name it: "test course 1 template 1"
// screen.getByTestId('activities-name')

// 14. click CREATE A NEW TEMPLATE
// screen.getByTestId('create-a-new-template-button')

// 15. Desmos Activity radio button should be selected.
// screen.getByTestId('desmosActivity-radioBtn')

// 16. Click NEXT button
// screen.getByTestId('next-button')

// 17. Click NEXT button
// screen.getByTestId('next-button')

// 18. Click CREATE
// screen.getByTestId('create')

/**
 * D. Create grouping "course 1 t1 g1"
 */

// 19. click "course 1 template 1"
// screen.getByTestId('ContentBox-Link-course 1 template 1')

// 20. click the grouping selection dropdown
// cy.get(`[aria-label="create-grouping-selection"]`)
