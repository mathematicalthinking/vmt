import user1 from '../fixtures/user';

describe('Workspace/replayer', function() {
  before(function() {
    cy.task('restoreAll').then(() => cy.login(user1));
  });

  after(function() {
    cy.logout();
  });

  it('loads a workspace', function() {
    cy.get('#Rooms').click();
    cy.getTestElement('content-box-room 1').click();
    cy.wait(500);
    cy.getTestElement('Enter').click();
    cy.wait(3000);
    cy.getTestElement('chat')
      .children()
      .should('have.length', 1);
  });
  it('prevents tool selection without taking control', function() {
    cy.getTestElement('awareness-desc')
      .contains('jl_picard joined room 1')
      .should('be.visible');
    cy.getTestElement('take-control').click();
    cy.wait(5000);
    cy.getTestElement('take-control').click();
    cy.get(':nth-child(5) > .toolbar_button > .gwt-Image').click();
    cy.getTestElement('control-warning').should('be.visible');
    cy.getTestElement('cancel').click();
    cy.getTestElement('chat')
      .children()
      .should('have.length', 4);
  });
  it('allows tool selection after taking control', function() {
    cy.getTestElement('take-control').click();
    cy.getTestElement('awareness-desc')
      .contains('jl_picard selected the move tool')
      .should('be.visible');
    cy.getTestElement('chat')
      .children()
      .children()
      .should('have.length', 10);
    cy.wait(3000);
    cy.get(':nth-child(5) > .toolbar_button > .gwt-Image').click();
    cy.wait(3000);
    cy.getTestElement('awareness-desc')
      .contains('jl_picard selected the polygon tool')
      .should('be.visible');
  });
  it('loads a replayer', function() {
    cy.getTestElement('exit-room').click();
    cy.getTestElement('Replayer').click();
  });

  describe('Viewing an Activity Workspace', function() {
    const workspaceUrlRegex = new RegExp(
      'myVMT/workspace/[0-9a-fA-F]{24}/activity'
    );

    before(function() {
      cy.contains('Community').click();
      cy.contains('Activities').click();
    });
    describe('Viewing one of your own activities', function() {
      const activityName = 'stand-alone-activity';
      const initialTabName = 'Tab 1';
      const newTabName = 'Tab 1 Renamed';
      const newInstructions = 'These are the new instructions...';

      it('Should load successfully', function() {
        cy.contains(activityName).click();
        cy.url().should('match', workspaceUrlRegex);
      });

      it('Should display activity owner message', function() {
        cy.getTestElement('owner-msg').should('exist');
      });

      it('Should display link to about page', function() {
        cy.getTestElement('about-link').should('exist');
      });

      it('Should give option to save activity', function() {
        // does save button work?
        // does the user have to change the activity to be able to save?
        cy.getTestElement('save-activity').should('exist');
      });

      it('Should display current tab name', function() {
        cy.getTestElement('room-info-tab-name').should(
          'contain',
          initialTabName
        );
      });

      it('Should let you edit tab name', function() {
        cy.getTestElement('room-info-tab-name')
          .find('div > i.fas.fa-edit')
          .click();

        const input = cy
          .getTestElement('room-info-tab-name')
          .find('div > input');
        input.clear();
        input.type('Tab 1 Renamed');

        cy.contains('Save').click(); // Need a better way to reference the save btn. wouldn this ever click the wrong button
        cy.getTestElement('room-info-tab-name').should('contain', newTabName);
      });

      it('Should let you edit the instructions', function() {
        cy.getTestElement('instructions-container')
          .find('div > i.fas.fa-edit')
          .click();
        cy.getTestElement('instructions-container')
          .find('div > textarea')
          .clear();
        cy.getTestElement('instructions-container')
          .find('div > textarea')
          .type(newInstructions);

        cy.contains('Save').click(); // Need a better way to reference the save btn. wouldn this ever click the wrong button
      });

      it('Should display new instructions', function() {
        cy.getTestElement('instructions-container').should(
          'contain',
          newInstructions
        );
      });

      it('Clicking Exit Activity should take you back to community', function() {
        cy.getTestElement('exit-room').click();
        cy.url().should('include', '/community/activities');
      });
    });

    describe("Viewing someone else's activity", function() {
      const initialTabName = 'Tab 1';
      before(function() {
        cy.contains('Community').click();
        cy.contains('Activities').click();
      });

      const activityName = "Deanna's course 2 activity";
      const copyName = 'Deanna Course 2 - Picard';
      it('Should load successfully', function() {
        cy.contains(activityName).click();
        cy.url().should('match', workspaceUrlRegex);
        cy.wait(3000);
      });

      it('Should not display activity owner message', function() {
        cy.getTestElement('owner-msg').should('not', 'exist');
      });

      it('Should not display link to about page', function() {
        cy.getTestElement('about-link').should('not', 'exist');
      });

      it('Should display current tab name', function() {
        cy.getTestElement('room-info-tab-name').should(
          'contain',
          initialTabName
        );
      });

      xit('Should not allow editing of tab name', function() {});

      xit('Should not allow editing of instructions', function() {});

      it('Should let you copy activity', function() {
        cy.getTestElement('copy-activity').click();
        cy.get('input[name="new name"]').type(copyName);
        cy.contains('Copy Activity').click();

        cy.url().should('include', '/myVMT/activities'); // This seems like a good place to redirect to, since you would think someone would want to use an activity after they copy it? But issue #90 implied we should redirect to community/activities
        cy.contains(copyName).should('exist');
      });
    });
  });
});
