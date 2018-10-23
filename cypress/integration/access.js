// const
const exec = require('child_process').exec
const user1 = require('../fixtures/user')
const user2 = require('../fixtures/user2')
const course = require('../fixtures/course')
const room = require('../fixtures/room')
const activity = require('../fixtures/activity')

describe('test access requests', function(){  
  before(function(){
    cy.task('seedDB').then(() => cy.login(user2))
  })

  // COURSE
  it("user2 requests access to course 1", function(){
    cy.contains('Community').click()
    cy.url().should('include', 'community/activities')
    cy.contains('Courses').click()
    cy.url().should('include', 'community/courses')
    cy.getTestElement('content-box').contains('course 1').click()
    cy.getTestElement('request-access-btn').click()
    cy.url().should('include', '/confirmation')
  })
  it("user1 gets a notification and grants access to course 1", function(){
    cy.login(user1)
    cy.url().should('include', 'myVMT/courses')
    // cy.wait(1111)
    cy.getTestElement('tab-ntf').contains('1').should('exist')
    cy.getTestElement('content-box-ntf').contains('1').should('exist')
    cy.getTestElement('content-box').contains('course 1').click()
    // cy.getTestElement('tab-ntf').contains('1')
    cy.get('#Members').click()
    cy.getTestElement('join-requests').children().should('have.length', 1) // One div is the request the other is the modal to trash it
    cy.getTestElement('grant-access').click()
    cy.getTestElement('tab-ntf').should('not.exist')
    cy.getTestElement('members').children().should('have.length', 2)
    cy.contains(user2.username).should('exist')
    // MAKE SURE THE NOTIFICATION IS VISUALLY RESOLVED
  })
  it("user2 gets a notification they have access to course 1", function(){
    cy.login(user2)
    cy.getTestElement('tab-ntf').contains('1')
    cy.getTestElement('content-box-ntf').contains('1')
    cy.getTestElement('content-box').contains('course 1').click();
    cy.get('p').contains('Welcome to course 1.')
    cy.contains('Explore').click()
    cy.contains('My VMT').click()
    cy.getTestElement('tab-ntf').should('not.exist')
    cy.getTestElement('content-box-ntf').should('not.exist')
    // NAVIGATE BACK AND MAKE SURE NOTIFICATIONS HAVE BEEN RESOLVED
  })

  it("user2 enters course with entry-code", function(){
    cy.contains('Community').click()
    cy.contains('Courses').click()
    cy.getTestElement('content-box').contains('entry-code course').click()
    cy.get('#entryCode').type('{selectall} {backspace}').type('entry-code-10')
    cy.contains('Join').click()
    cy.getTestElement('tab').contains('Members').click()
    cy.getTestElement('members').children().should('have.length', 2)
    cy.contains(user2.username).should('exist')
  })

  it("user1 gets notification that user2 joined course", function(){
    cy.login(user1)
    cy.getTestElement('tab-ntf').contains('1')
    cy.getTestElement('content-box-ntf').contains('1')
    cy.getTestElement('content-box').contains('entry-code course').click()
    cy.getTestElement('tab-ntf').contains('1')
    cy.getTestElement('tab').contains('Members').click()
    cy.getTestElement('members').children().should('have.length', 2)
    cy.getTestElement('members').children().contains('g-laforge')
    cy.getTestElement('member-ntf').should('exist')
  })

  it("should resolve notificaiton after user1 seees", function(){
    cy.getTestElement('crumb').contains('My VMT').click()
    cy.getTestElement('tab-ntf').should('not.exist')
    cy.getTestElement('content-box-ntf').should('not.exist')
  })

  // ROOM
  it('user2 requests access to room', function(){
    cy.login(user2)
    cy.contains('Community').click()
    cy.contains('Rooms').click()
    cy.getTestElement('content-box').contains('request access').click()
    cy.getTestElement('request-access-btn').click()
    cy.url().should('include', '/confirmation')
  })

  it('user1 grants access to user2 (room)', function(){
    cy.login(user1)
    cy.getTestElement('tab-ntf').contains('1').click()
    cy.getTestElement('content-box-ntf').contains('1')
    cy.getTestElement('content-box').contains('request access').click()
    cy.getTestElement('tab-ntf').contains('1')
    cy.get('#Members').click()
    cy.getTestElement('join-requests').children().should('have.length', 1)
    cy.getTestElement('grant-access').click()
    cy.getTestElement('tab-ntf').should('not.exist')
    cy.getTestElement('members').children().should('have.length', 2)
    cy.contains(user2.username).should('exist')
  })

  it('user2 now has access to room', function(){
    cy.login(user2)
    cy.getTestElement('tab-ntf').contains('1').should('exist')
    cy.getTestElement('tab').contains('Rooms').click();
    cy.getTestElement('content-box-ntf').contains('1').should('exist')
    cy.getTestElement('content-box').contains('request access').click()
    cy.contains('Explore').click();
    cy.getTestElement('tab').contains('Members').click()
    cy.getTestElement('members').children().should('have.length', 4)
    cy.getTestElement('crumb').contains('My VMT').click()
    cy.wait(111)
  })

  it('user2 joins a room by entering entry-code', function(){
    cy.login(user2)
    cy.contains('Community').click()
    cy.url().should('include', 'community/activities')
    cy.contains('Rooms').click()
    cy.url().should('include', 'community/rooms')
    cy.getTestElement('content-box').contains('room 1').click()
    cy.get('#entryCode').type('{selectall} {backspace}').type('rare-shrimp-45')
    cy.contains('Join').click()
    cy.url().should('include', 'details')
  })

  it('user 1 should get a notification that user2 joined', function(){
    cy.login(user1)
    cy.getTestElement('tab-ntf').contains('1')
    cy.getTestElement('tab').contains('Rooms').click()
    cy.getTestElement('content-box-ntf').contains('1')
    cy.getTestElement('content-box-title').contains('room 1').click()
    cy.getTestElement('tab-ntf').contains('1')
    cy.getTestElement('tab').contains('Members').click()
    cy.getTestElement('members').children().should('have.length', 4)
    cy.getTestElement('members').children().contains('g-laforge')
    cy.getTestElement('member-ntf').should('exist')
  })

  it('should resolve the notification after user 1 has seen it', function(){
    cy.getTestElement('tab').contains('Details').click()
    cy.getTestElement('tab-ntf').should('not.exist')
  })

  it('user fails to join with wrong entry code (room)', function(){
    cy.login(user2)
    cy.contains('Community').click()
    cy.url().should('include', 'community/activities')
    cy.contains('Rooms').click()
    cy.url().should('include', 'community/rooms')
    cy.getTestElement('content-box').contains('wrong entry code').click()
    cy.get('#entryCode').type('{selectall} {backspace}').type('WRONG_CODE')
    cy.contains('Join').click()
    cy.getTestElement('entry-code-error').contains('That entry code was incorrect. Try again.')
    cy.getTestElement('close-modal').click()
  })

  it('user fails to join with wrong entry code (course)', function(){
    cy.contains('Courses').click()
    cy.url().should('include', 'community/courses')
    cy.getTestElement('content-box').contains('wrong entry code').click()
    cy.get('#entryCode').type('{selectall} {backspace}').type('WRONG_CODE')
    cy.contains('Join').click()
    cy.getTestElement('entry-code-error').contains('That entry code was incorrect. Try again.').should('exist')
  })
})
