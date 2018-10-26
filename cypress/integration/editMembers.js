const exec = require('child_process').exec
const user1 = require('../fixtures/user')
const user2 = require('../fixtures/user2')
const course = require('../fixtures/course')
const room = require('../fixtures/room')
const activity = require('../fixtures/activity')

describe('Edit Members Rolesmongo', function(){  
  before(function(){
    cy.task('seedDB').then(() => cy.login(user1))
  })

  // COURSE
  it("user 1 changes user2 from participant to facilitator", function(){
    cy.getTestElement('content-box').contains('course 2').click();
    cy.getTestElement('tab').contains('Members').click();
    cy.getTestElement('edit-member').last().click();
    cy.getTestElement('trash-member').should('be.visible');

    cy.getTestElement('dropdown').click();
    cy.getTestElement('dropdown-item').last().click();
    cy.getTestElement('dropdown').should('not.be.visible')
    cy.getTestElement('trash-member').should('not.be.visible')
  })

  it('allows user2 to see edit controls after being made a facilitator', function(){
    cy.login(user2)
    cy.getTestElement('content-box').contains('course 2').click();
    cy.getTestElement('tab').contains('Members').click();
    cy.getTestElement('avatar-name').contains('g-laforge')
      .parent().parent().parent()
      .siblings().last().children().last().should($el => {
        expect($el).to.include.text('facilitator')
      });
    // .and('include', 'facilitator')

  })
  it('user1 deletes user2 from course 2', function() {
    cy.login(user1)
    cy.getTestElement('content-box').contains('course 2').click();
    cy.getTestElement('tab').contains('Members').click();
    cy.getTestElement('edit-member').last().click();
    cy.getTestElement('trash-member').click();
    cy.getTestElement('confirm-trash').last().click();
    cy.getTestElement('members').children().should('have.length', 1)

  })
  it("does not display course 2 to user2 after they're removed", function(){
    cy.login(user2)
    cy.contains("There doesn't appear to be anything here yet")
    cy.contains('Community').click()
    cy.contains('Courses').click()
    cy.getTestElement('content-box').contains('course 2').click()
    cy.contains("You currently don't have access");
  })
})