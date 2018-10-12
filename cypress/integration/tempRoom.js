const user = require('../fixtures/user')
let url;
describe('temporary room', function() {
  before(function() {
    cy.task('clearDB')
    cy.window().then((win) => {
      win.sessionStorage.clear()
      cy.visit('/')
    })
  })
  it('creates a temp user and room', function() {
    cy.contains('Explore').click()
    cy.url().should('include', 'explore')
    cy.get('input').type(user.username)
    cy.get('button').click()
    // cy.wait(3000)
    cy.get('.ggbtoolbarpanel')
    cy.url({log: true}).then(res => url = res)
  })
  it('creates another user and joins the same room', function(){
    cy.window().then((win) => {
      win.sessionStorage.clear()
      cy.visit('/')
      cy.log(url)
      cy.visit(url.substring(21, url.length)) // I wish we could easily override the baseURL defined in cypress.config
      cy.get('input').type('geordi')
      cy.get('.button__Button__3QQYz').click()
      cy.get('.ggbtoolbarpanel')
      cy.getTestElement('current-members').children().should('have.length', 2)
      cy.getTestElement('current-members').contains(user.username)
      cy.getTestElement('current-members').contains('geordi')
    })
  })
})
