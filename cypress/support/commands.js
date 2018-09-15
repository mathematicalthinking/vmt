// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
const user = require('../fixtures/user')
Cypress.Commands.add("login", () => {
  cy.visit('/')
  cy.get('input[name=username]').type(user.username)
  cy.get('input[name=password]').type(user.password)
  cy.get('button').click()
  cy.url().should('include', '/profile/courses')
  // CANT GET THE CODE BELOW TO WORK -- want to do it programitcally - not through the UI
  // cy.request({
  //   url: 'localhost:3001/auth/login',
  //   method: 'POST',
  //   body: user
  // })
  // cy.visit('/')
})

//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
