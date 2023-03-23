// 1. login as jl_picard (pw: "enterprise")

const user1 = require('../fixtures/user');

describe('archive page works as intended', function() {
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
// 2. click Archive page

it('visits archive page', function() {
  cy.login(user1);
  cy.contains('Archive').click();
});
/*
 */

it('should have 1 room on the archive page: "room 1"', function() {
  cy.get('h3').contains('Search your 1 archived Rooms');
  cy.get('div').contains('room 1');
});
// 3. Archive page should have 1 room: "room 1"
// (maybe save "room 1" to a variable to check that it's not there after unarchiving)
/*
        // cy.findByRole('heading', {  name: /search your 1 archived rooms/i})
        cy.getTestElement('archive-title') -> should contain the number 1
        cy.getTestElement('SelectableContentBox-container-room 1')
 */

// 4. click unarchive icon
/*
        // const button = cy.findByRole('button', {  name: /unarchive unarchive output/i});within(button).getByText(/output/i);
        cy.getTestElement('Unarchive-button-5ba289c57223b9429888b9b5')
 */

it('should be able to be unarchived', function() {
  cy.get('[data-testid="Unarchive-button-5ba289c57223b9429888b9b5"]').click();
  cy.get('button')
    .contains('Yes')
    .click();
  cy.get('h3').contains('Search your 0 archived Rooms');
  cy.getTestElement('nav-My VMT').click();
  cy.getTestElement('search').type('room 1');
  cy.get('div').contains('room 1');
});

// 5. click yes on popup modal
/*
        // cy.findByRole('button', {  name: /yes/i})
        cy.getTestElement('restore-resource')
*/

// 6. "room 1" should no longer exist

// 7. click MyVMT in navbar
/*
        // cy.findByRole('link', {  name: /my vmt/i})
        cy.getTestElement('nav-My VMT')
*/

/**
 * Tim, let me know if findByText doesn't work.
 *
 * I found this SO post related to testing the react-select component (the dropdown ui): https://stackoverflow.com/questions/55575843/how-to-test-react-select-with-react-testing-library
 */

// 8. click "Last Week"
/*
        cy.findByText(/last week/i)
*/

// 9. click "All" in the drop down
/*
        cy.findByText(/last week/i)
*/

// 10. "room 1" should exist
/*
        // cy.findByText(/room 1/i)
        cy.getTestElement('SelectableContentBox-container-room 1')
*/

// @TODO: server > seeders > tab.js -> ObjectId('5d3b493dca44f53a90a9ed35') is used by 3 rooms and each room should have unique tabs.
// click "Select All"
// click Archive Icon next to "Select All"
// click "yes" on popup modal
// text should exist: "There doesn't appear to be anything here yet"
// click Archive tab in navbar

// @TODO: test that the SelectableBoxList icons work for an archived room



/** Found Bugs
 * Test 1.
 * Make sure you can archive
 *
 * UNARCHIVE BUG: the id remains in the arhive after unarchiving
 */
