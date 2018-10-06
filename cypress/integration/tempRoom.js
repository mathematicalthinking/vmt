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
    cy.get('.ggbtoolbarpanel')
    url = cy.url()
    console.log(url)
  })
  it('creates another user and joins the same room', function(){
    cy.visit(url)
    cy.get('input').type('geordi')
    cy.get('button').click()

  })
})
