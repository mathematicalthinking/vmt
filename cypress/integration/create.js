const user = require('../fixtures/user')
const course = require('../fixtures/course')
const room = require('../fixtures/room')
const activity = require('../fixtures/activity')

describe('create each type of resource', function(){
  before(function(){
    cy.task('seedDBLogin').then(() => {cy.login(user)})
    // cy.visit('/myVMT/courses')
  })
  it('creates a course', function(){
    cy.getTestElement('create-Course').click()
    cy.get('input[name=coursesName]').type(course.name)
    cy.get('input[name=description]').type(course.description)
    cy.get('button').contains('Submit').click()
    cy.contains(course.name).should('be.visible')
  })

  it('creates a room', function(){
    // cy.get('button').click()
    cy.getTestElement('tab').contains('Rooms').click()
    cy.getTestElement('create-Room').click()
    cy.get('input[name=roomsName]').type('{selectall} {backspace}').type(room.name)
    cy.get('input[name=description]').type('{selectall} {backspace}').type(room.description)
    cy.get('input[name=dueDate]').type(room.dueDate)
    cy.get('button').contains('Submit').click()
    cy.contains(room.name).should('be.visible')
  })

  it('creates an activity', function(){
    cy.getTestElement('tab').contains('Activities').click()
    cy.url().should('include', '/myVMT/activities')
    cy.get('button').contains('Create A New Activity').click()
    cy.get('input[name=activitiesName]').type('{selectall} {backspace}').type(activity.name)
    cy.get('input[name=description]').type('{selectall} {backspace}').type(activity.description)
    cy.get('button').contains('Submit').click()
    cy.contains(activity.name).should('be.visible')
  })

  it('creates a course activity', function(){
    cy.getTestElement('tab').contains('Courses').click()
    cy.contains('test course 1').click()
    cy.url().should('include', '/myVMT/courses')
    cy.url().should('include', '/activities')
    cy.getTestElement('tab').contains('Activities').click()
    cy.get('button').contains('Create A New Activity').click()
    cy.get('input[name=activitiesName]').type('{selectall} {backspace}').type(course.activity.name)
    cy.get('input[name=description]').type('{selectall} {backspace}').type(course.activity.description)
    cy.get('button').contains('Submit').click()
    cy.contains(course.activity.name).should('be.visible')
  })

  it('creates a course room', function(){
    cy.getTestElement('tab').contains('Rooms').click()
    cy.url().should('include', '/myVMT/courses')
    cy.url().should('include', '/rooms')
    cy.get('button').contains('Create A New Room').click()
    cy.get('input[name=roomsName]').type('{selectall} {backspace}').type(course.room.name)
    cy.get('input[name=description]').type('{selectall} {backspace}').type(course.room.description)
    cy.get('button').contains('Submit').click()
    cy.contains(course.room.name).should('be.visible')
  })

  it('creates a room from an activity', function(){
    cy.getTestElement('tab').contains('Activities').click()
    cy.contains(course.activity.name).click()
    cy.url('include', '/activities')
    cy.url('include', '/details')
    cy.contains('Assign').click()
    cy.get('input[name=dueDate]').type(course.room.dueDate)
    cy.get('input[name=manual]').check()
    cy.getTestElement('assign-rooms').click()
    cy.getTestElement('tab').contains('Rooms').click()
    cy.getTestElement('content-box-title').contains(course.activity.name + " (room 1)").should('exist')
  })

})
