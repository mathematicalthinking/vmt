import user1 from '../fixtures/user';

describe('Workspace/replayer', function() {
  before(function() {
    cy.task('restoreAll').then(() => cy.login(user1));
  });

  after(function() {
    cy.logout();
  });

  function checkInstructions(expectedText) {
    cy.getTestElement('instructions-container').should('contain', expectedText);
  }

  function checkRoomInfoTabName(name) {
    cy.getTestElement('room-info-tab-name').should('contain', name);
  }

  function clickTab(name) {
    cy.getTestElement('tabs-container').within(() => {
      cy.contains(name).click();
    });
  }

  function createTab(details) {
    const { name, instructions = '', roomType = 'geogebra' } = details;

    cy.getTestElement('add-tab').click();
    cy.get('input[name=name]').type(name);
    if (instructions) {
      cy.get('input[name=instructions]').type(instructions);
    }
    // GeoGebra default selected

    if (roomType === 'desmos') {
      // click desmos radio btn
    }
    cy.getTestElement('create-tab').click();

    clickTab(name);

    if (instructions) {
      cy.getTestElement('instructions-modal').should('be.visible');
      cy.getTestElement('instructions-modal')
        .find('[data-testid="close-modal"]')
        .click();
    }

    checkInstructions(instructions);
    checkRoomInfoTabName(name);
  }

  function editTab(newName) {
    cy.getTestElement('room-info-tab-name')
      .as('container')
      .find('div > i.fas.fa-edit')
      .click();

    cy.get('@container')
      .find('div > input')
      .clear()
      .type(newName);

    cy.get('@container').within(() => {
      cy.contains('Save').click();
    });
    cy.get('@container').should('contain', newName);
  }

  function editInstructions(newInstructions) {
    cy.getTestElement('instructions-container')
      .as('container')
      .find('div > i.fas.fa-edit')
      .click();

    cy.get('@container')
      .find('div > textarea')
      .clear()
      .type(newInstructions);

    cy.get('@container').within(() => {
      cy.contains('Save').click();
    });
    checkInstructions(newInstructions);
  }

  function checkAwareness(expectedText) {
    cy.getTestElement('awareness-desc').should('contain', expectedText);
  }

  it('loads a workspace', function() {
    cy.get('#Rooms').click();
    cy.getTestElement('content-box-room 1').click();
    cy.getTestElement('Enter').click();
    cy.getTestElement('chat')
      .children()
      .should('have.length', 1);
  });
  it('prevents tool selection without taking control', function() {
    checkAwareness('jl_picard joined room 1');
    cy.getTestElement('take-control').click();
    cy.getTestElement('release-control').click();
    cy.get(':nth-child(5) > .toolbar_button > .gwt-Image').click();
    cy.getTestElement('control-warning').should('be.visible');
    cy.getTestElement('cancel').click();
    cy.getTestElement('chat')
      .children()
      .should('have.length', 3); // no longer emitting event for selecting move tool after taking control
  });
  it('allows tool selection after taking control', function() {
    cy.getTestElement('take-control').click();

    checkAwareness('jl_picard took control');

    cy.getTestElement('chat')
      .children()
      .children()
      .should('have.length', 8);
    cy.get(':nth-child(5) > .toolbar_button > .gwt-Image').click();
    cy.wait(500);
    cy.get(':nth-child(5) > .toolbar_button > .gwt-Image').click();

    checkAwareness('jl_picard selected the polygon tool');
  });
  describe('Managing tabs', function() {
    const secondTabName = 'Tab 2 Bananas';
    const thirdTabName = 'Tab 3 Apples';
    const thirdTabRenamed = 'Third Tab Renamed';
    it('successfully creates a new tab', function() {
      const name = secondTabName;
      const instructions = `These are the instructions for ${name}.`;
      createTab({ name, instructions });
    });

    it('creates another tab', function() {
      const name = thirdTabName;
      const instructions = `These are the instructions for ${name}`;
      createTab({ name, instructions });
    });
    // TODO create desmos tabs (including pasting workspace link)
    // TODO create ggb tab from file

    it('edits tab name', function() {
      editTab(thirdTabRenamed);
    });

    it('edits tab instructions', function() {
      const newInstructions = `These are nonsensical instructions.`;
      editInstructions(newInstructions);
    });

    it('creates an activity from room', function() {
      cy.getTestElement('more-menu').click();
      cy.getTestElement('create-workspace').click();

      const firstTabName = 'Tab 1';
      let newName = 'Activity All Tabs';
      // submit with no name and test error msg
      const nameErrorMsg = 'Please provide a name for your new activity';
      const noTabsErrorMsg = 'Please select at least one tab to include';
      cy.getTestElement('create-new-activity').click();
      cy.contains(nameErrorMsg).should('exist');

      cy.get('input[name="new name"]').type(newName);

      // uncheck both tabs and test error msg
      cy.getTestElement(`${firstTabName}-checkbox`).click();
      cy.getTestElement(`${secondTabName}-checkbox`).click();
      cy.getTestElement(`${thirdTabRenamed}-checkbox`).click();

      cy.getTestElement('create-new-activity').click();

      cy.contains(nameErrorMsg).should('not.exist');
      cy.contains(noTabsErrorMsg).should('exist');

      // recheck both tabs
      cy.getTestElement(`${firstTabName}-checkbox`).click();
      cy.getTestElement(`${secondTabName}-checkbox`).click();
      cy.getTestElement(`${thirdTabRenamed}-checkbox`).click();

      cy.getTestElement('create-new-activity').click();

      cy.contains(newName).should('exist');
      cy.contains(newName).click();

      cy.getTestElement('view-activity').click();
      cy.getTestElement('tabs-container')
        .children()
        .should('have.length', 4);
      cy.contains(firstTabName).should('be.visible');
      cy.contains(secondTabName).should('be.visible');
      cy.contains(thirdTabRenamed).should('be.visible');
      cy.get('.ggbtoolbarpanel').should('be.visible');

      cy.getTestElement('nav-My VMT').click();
      cy.get('#Rooms').click();
      cy.getTestElement('content-box-room 1').click();
      cy.getTestElement('Enter').click();

      // create new tab then copy again
      newName = 'Tabs 2 & 3 Only';
      cy.getTestElement('more-menu').click();
      cy.getTestElement('create-workspace').click();
      cy.get('input[name="new name"]').type(newName);

      // uncheck tab 1
      cy.getTestElement(`${firstTabName}-checkbox`).click();
      cy.getTestElement('create-new-activity').click();

      cy.contains(newName).should('exist');
      cy.contains(newName).click();

      cy.getTestElement('view-activity').click();
      cy.getTestElement('tabs-container')
        .children()
        .should('have.length', 3);
      cy.contains(firstTabName).should('not.be.visible');
      cy.contains(secondTabName).should('be.visible');
      cy.contains(thirdTabRenamed).should('be.visible');
      cy.get('.ggbtoolbarpanel').should('be.visible');
    });

    it('creates a room from room', function() {
      cy.getTestElement('nav-My VMT').click();
      cy.get('#Rooms').click();
      cy.getTestElement('content-box-room 1').click();
      cy.getTestElement('Enter').click();

      cy.getTestElement('more-menu').click();
      cy.getTestElement('create-workspace').click();
      cy.get('input[name=room]').click();

      const firstTabName = 'Tab 1';
      let newName = 'Room All Tabs';
      // submit with no name and test error msg
      const nameErrorMsg = 'Please provide a name for your new room';
      const noTabsErrorMsg = 'Please select at least one tab to include';
      cy.getTestElement('create-new-room').click();
      cy.contains(nameErrorMsg).should('exist');

      cy.get('input[name="new name"]').type(newName);

      // uncheck both tabs and test error msg
      cy.getTestElement(`${firstTabName}-checkbox`).click();
      cy.getTestElement(`${secondTabName}-checkbox`).click();
      cy.getTestElement(`${thirdTabRenamed}-checkbox`).click();

      cy.getTestElement('create-new-room').click();

      cy.contains(nameErrorMsg).should('not.exist');
      cy.contains(noTabsErrorMsg).should('exist');

      // recheck both tabs
      cy.getTestElement(`${firstTabName}-checkbox`).click();
      cy.getTestElement(`${secondTabName}-checkbox`).click();
      cy.getTestElement(`${thirdTabRenamed}-checkbox`).click();

      cy.getTestElement('create-new-room').click();

      cy.contains(newName).should('exist');
      cy.contains(newName).click();

      cy.getTestElement('Enter').click();
      cy.getTestElement('tabs-container')
        .children()
        .should('have.length', 4);
      cy.contains(firstTabName).should('be.visible');
      cy.contains(secondTabName).should('be.visible');
      cy.contains(thirdTabRenamed).should('be.visible');
      cy.get('.ggbtoolbarpanel').should('be.visible');

      cy.getTestElement('nav-My VMT').click();
      cy.get('#Rooms').click();
      cy.getTestElement('content-box-room 1').click();
      cy.getTestElement('Enter').click();

      // create new tab then copy again
      newName = 'Tabs 2 & 3 Only';
      cy.getTestElement('more-menu').click();
      cy.getTestElement('create-workspace').click();
      cy.get('input[name=room]').click();

      cy.get('input[name="new name"]').type(newName);

      // uncheck tab 1
      cy.getTestElement(`${firstTabName}-checkbox`).click();
      cy.getTestElement('create-new-room').click();

      cy.contains(newName).should('exist');
      cy.contains(newName).click();

      cy.getTestElement('Enter').click();
      cy.getTestElement('tabs-container')
        .children()
        .should('have.length', 3);
      cy.contains(firstTabName).should('not.be.visible');
      cy.contains(secondTabName).should('be.visible');
      cy.contains(thirdTabRenamed).should('be.visible');
      cy.get('.ggbtoolbarpanel').should('be.visible');
    });
  });

  describe('Loading Replayer', function() {
    it('loads a replayer', function() {
      cy.getTestElement('nav-My VMT').click();
      cy.get('#Rooms').click();
      cy.getTestElement('content-box-room 1').click();
      // cy.getTestElement('exit-room').click();
      cy.getTestElement('Replayer').click();
    });
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

      it('Should display current tab name', function() {
        cy.getTestElement('room-info-tab-name').should(
          'contain',
          initialTabName
        );
      });

      it('Should let you edit tab name', function() {
        editTab(newTabName);
      });

      it('Should let you edit the instructions', function() {
        editInstructions(newInstructions);
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

        cy.url().should('include', '/myVMT/activities');
        cy.contains(copyName).should('exist');
        cy.contains(copyName).click();

        cy.getTestElement('view-activity').click();
        cy.getTestElement('tabs-container')
          .children()
          .should('have.length', 2);

        let newName = 'Both Tabs';
        const newTabName = 'Tab 2';
        createTab({ name: newTabName });
        cy.getTestElement('copy-activity').click();

        // submit with no name and test error msg
        const nameErrorMsg = 'Please provide a name for your new activity';
        const noTabsErrorMsg = 'Please select at least one tab to copy';
        cy.contains('Copy Activity').click();
        cy.contains(nameErrorMsg).should('exist');

        cy.get('input[name="new name"]').type(newName);

        // uncheck both tabs and test error msg
        cy.getTestElement(`${initialTabName}-checkbox`).click();
        cy.getTestElement(`${newTabName}-checkbox`).click();

        cy.contains('Copy Activity').click();
        cy.contains(nameErrorMsg).should('not.exist');
        cy.contains(noTabsErrorMsg).should('exist');

        // recheck both tabs
        cy.getTestElement(`${initialTabName}-checkbox`).click();
        cy.getTestElement(`${newTabName}-checkbox`).click();

        cy.contains('Copy Activity').click();

        cy.contains(newName).should('exist');
        cy.contains(newName).click();

        cy.getTestElement('view-activity').click();
        cy.getTestElement('tabs-container')
          .children()
          .should('have.length', 3);
        cy.contains(initialTabName).should('be.visible');
        cy.contains(newTabName).should('be.visible');
        cy.get('.ggbtoolbarpanel').should('be.visible');

        // create new tab then copy again
        newName = 'Tab #2 Only';
        cy.getTestElement('copy-activity').click();
        cy.get('input[name="new name"]').type(newName);

        // uncheck tab 1
        cy.getTestElement(`${initialTabName}-checkbox`).click();
        cy.contains('Copy Activity').click();

        cy.contains(newName).should('exist');
        cy.contains(newName).click();

        cy.getTestElement('view-activity').click();
        cy.getTestElement('tabs-container')
          .children()
          .should('have.length', 2);
        cy.contains(initialTabName).should('not.be.visible');
        cy.contains(newTabName).should('be.visible');
        cy.get('.ggbtoolbarpanel').should('be.visible');

        cy.wait(1000); // cypress fails in after all hook without this
      });
    });
  });
});
