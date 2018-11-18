const user = require('../fixtures/user')
const course = require('../fixtures/course')
const room = require('../fixtures/room')
const activity = require('../fixtures/activity')

describe('create each type of resource', function(){
  before(function(){
    cy.task('seedDB').then(() => {cy.login(user)})
    // cy.visit('/myVMT/courses')
  })
  it('creates a course', function(){
    cy.getTestElement('create-Course').click()
    cy.get('input[name=name]').type(course.name)
    cy.get('input[name=description]').type(course.description)
    cy.get('button').contains('Submit').click()
    cy.contains(course.name).should('exist')
  })

  it('creates a room', function(){
    // cy.get('button').click()
    cy.getTestElement('tab').contains('Rooms').click()
    cy.getTestElement('create-Room').click()
    cy.get('input[name=name]').type('{selectall} {backspace}').type(room.name)
    cy.get('input[name=description]').type('{selectall} {backspace}').type(room.description)
    cy.get('input[name=dueDate]').type(room.dueDate)
    cy.get('button').contains('Submit').click()
    cy.contains(room.name).should('exist')
  })

  it('creates an activity', function(){
    cy.getTestElement('tab').contains('Activities').click()
    cy.url().should('include', '/myVMT/activities')
    cy.get('button').contains('Create').click()
    cy.get('input[name=name]').type('{selectall} {backspace}').type(activity.name)
    cy.get('input[name=description]').type('{selectall} {backspace}').type(activity.description)
    cy.get('button').contains('Submit').click()
    cy.contains(activity.name).should('exist')
  })

  it('creates a course activity', function(){
    cy.getTestElement('tab').contains('Courses').click()
    cy.getTestElement('content-box-course 1').click()
    cy.url().should('include', '/myVMT/courses')
    cy.url().should('include', '/activities')
    cy.getTestElement('tab').contains('Activities').click()
    cy.get('button').contains('Create').click()
    cy.get('input[name=name]').type('{selectall} {backspace}').type(course.activity.name)
    cy.get('input[name=description]').type('{selectall} {backspace}').type(course.activity.description)
    cy.get('button').contains('Submit').click()
    cy.contains(course.activity.name).should('exist')
  })

  it('creates a course room', function(){
    cy.getTestElement('tab').contains('Rooms').click()
    cy.url().should('include', '/myVMT/courses')
    cy.url().should('include', '/rooms')
    cy.get('button').contains('Create').click()
    cy.get('input[name=name]').type('{selectall} {backspace}').type(course.room.name)
    cy.get('input[name=description]').type('{selectall} {backspace}').type(course.room.description)
    cy.get('button').contains('Submit').click()
    cy.contains(course.room.name).should('exist')
  })

  it('creates a course room from a course activity', function(){
    cy.getTestElement('tab').contains('Activities').click()
    cy.getTestElement(`content-box-${course.activity.name}`).click()
    cy.url('include', '/activities')
    cy.url('include', '/details')
    cy.contains('Assign').click()
    cy.get('input[name=dueDate]').type(course.room.dueDate)
    cy.get('input[name=manual]').check()
    cy.getTestElement('assign-rooms').click()
    cy.getTestElement('tab').contains('Rooms').click()
    cy.getTestElement(`content-box-${course.activity.name} (room 1)`).should('exist')
  })

  // @TODO MAKE SURE THIS WORKS WITH COURSE ACTIVITIES AND STAND ALONE ACTIVITIES
  it('adds a community activitity to user1s stand alone activities', function(){
    cy.getTestElement('crumb').contains('My VMT').click()
    cy.getTestElement('tab').contains('Activities').click()
    // cy.getTestElement('box-list').contains("There doesn't appear to be anything here yet").should('exist')
    cy.contains('Select an activity from the community').click()
    cy.url().should('include', 'community/activities/selecting')
    cy.getTestElement('select-tag').should('exist')
    cy.getTestElement('select-count').contains('0').should('exist')
    cy.getTestElement('content-box-ACTIVITY 1').trigger('mouseover')
    cy.getTestElement('overlay-ACTIVITY 1').click();
    cy.getTestElement('select-count').contains('1').should('exist')
    cy.contains('My VMT').click()
    cy.getTestElement('tab').contains('Activities').click()
    cy.getTestElement('box-list').children().last().contains("ACTIVITY 1").should('exist')
  })

  it("creates a course room by assigning a course's activity", function(){
    cy.login(user)
    cy.getTestElement('tab').contains('Courses').click()
    cy.getTestElement('content-box-course 2').click()
    cy.getTestElement('content-box-ACTIVITY 2').click()
    cy.getTestElement('assign').click()
    cy.get('[type="radio"]').last().check()
    cy.contains('g-laforge').click()
    cy.contains('data').click()
    cy.getTestElement('assign-rooms').click();
    cy.contains('worf').click()
    cy.getTestElement('assign-rooms').click();
    cy.getTestElement('content-box-ACTIVITY 2 (room 1)').should('exist');
    cy.getTestElement('content-box-ACTIVITY 2 (room 2)').should('exist');
  })

  it('selects an existing stand alone activity and adds it to a course', function(){
    cy.getTestElement('crumb').contains('course 2').click()
    cy.getTestElement('tab').contains('Activities').click()
    cy.get('button').contains('Select an existing activity').click()
    cy.get('[type="radio"]').last().check()
    cy.getTestElement('content-box-test activity 1').trigger('mouseover')
    cy.getTestElement('overlay-test activity 1').click()
    cy.get('button').contains('Done').click()
    cy.getTestElement('box-list').children().should('have.length', 2)
  })
  
  it("creates a course room from a course activity", function(){
    cy.getTestElement('tab').contains('Rooms').click()
    cy.getTestElement('box-list').children().should('have.length', 2)
    cy.get('button').contains('Create from an Activity').click()
    cy.get('[type="radio"]').last().check()    
    cy.getTestElement('content-box-test activity 1').trigger('mouseover')
    cy.getTestElement('overlay-test activity 1').click()
    cy.get('button').contains('Done').click()
    cy.getTestElement('box-list').children().should('have.length', 3)
    cy.getTestElement('box-list').contains('test activity 1 (room)').should('exist')
  })
  
  it("creates a course room from a standalone activity", function(){
    cy.getTestElement('box-list').children().should('have.length', 3)
    cy.get('button').contains('Create from an Activity').click()
    cy.get('[type="radio"]').eq(1).check()    
    cy.getTestElement('content-box-ACTIVITY 1').trigger('mouseover')
    cy.getTestElement('overlay-ACTIVITY 1').click()
    cy.get('button').contains('Done').click()
    cy.getTestElement('box-list').children().should('have.length', 4)
    cy.getTestElement('box-list').contains('ACTIVITY 1 (room)').should('exist')
  })

  it('creates a standalone room from a standalone activity', function(){
    cy.getTestElement('crumb').contains('My VMT').click()
    cy.getTestElement('tab').contains('Rooms').click()
    cy.get('button').contains('Create from an Activity').click()
    cy.get('[type="radio"]').last().check()
    cy.getTestElement('content-box-test activity 1').trigger('mouseover')
    cy.getTestElement('overlay-test activity 1').click()
    cy.get('button').contains('Done').click()
    cy.getTestElement('box-list').contains('test activity 1 (room)').should('exist')
  })

  // SHOULD WE ALLOW THIS?
//   it('creates a standalone room from a course activity', function(){
//     cy.getTestElement('crumb').contains('My VMT').click()
//   })



//   it("")
})
