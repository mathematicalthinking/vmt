const {
  userLiveToken,
  userExpiredToken,
  noEmailUser
} = require('../fixtures/confirmEmail');
const errors = require('../fixtures/errors').confirmEmail

const successMsg = 'Your email has been successfully confirmed!';


describe('Confirming Email', function() {
  before(function() {
    cy.task('restoreAll');
  });

  describe('Invalid token', function() {
    let url = `/confirmEmail/${userLiveToken.invalidToken}`;

    it('should display error message', function() {
      cy.visit(url);
      cy.contains(errors.invalidToken);
    });
  });

  describe('Existing but expired token', function() {
    let url = `/confirmEmail/${userExpiredToken.token}`;
    let user = userExpiredToken;

    describe('While not logged in', function() {
      it('should display error message', function() {
        cy.visit(url);
        cy.contains(errors.invalidToken);
      });

      it ('should not display resend email button', function() {
        cy.getTestElement('resend-btn').should('not.be.visible');
      });
    });

    describe('While logged in', function() {
      it('should display error message', function() {
        cy.visit('/login');
        cy.get('input[name=username]').type(user.username);
        cy.get('input[name=password]').type(user.password);
        cy.get('button').click();
        cy.url().should('include','/unconfirmed');
        cy.visit(url);
        cy.contains(errors.invalidToken);
      });

      it ('should display resend email button', function() {
        cy.getTestElement('resend-btn').should('be.visible');
      });

      it('should display success message after clicking resend email button', function() {
        let msg = `Email has been sent to ${user.email} with instructions for email confirmation.`
        cy.getTestElement('resend-btn').click();
        cy.contains(msg);
        cy.logout();
      });
    });


  });

  describe('Valid Token', function() {
    let url = `/confirmEmail/${userLiveToken.token}`;

    it('should display success message', function() {
      cy.visit(url);
      cy.contains(successMsg);
    });
  });

  describe('Logging in with unconfirmed email', function() {
    before(function() {
      cy.task('restoreAll');

    });

    describe('As user without email address', function() {
      let user = noEmailUser;

      it('should redirect to myVMT', function() {
        cy.visit('/login');
        cy.get('input[name=username]').type(user.username);
        cy.get('input[name=password]').type(user.password);
        cy.get('button').click();
        cy.url().should('include', '/myVMT/')
        cy.logout();
      });
    });

    describe('As user with email address', function() {
      let user = userLiveToken;

      it('should redirect to unconfirmed page', function() {
        cy.visit('/login');
        cy.get('input[name=username]').type(user.username);
        cy.get('input[name=password]').type(user.password);
        cy.get('button').click();
        cy.url().should('include', '/unconfirmed')
      });

      it('should display success message after clicking resend email button', function() {
        let msg = `Email has been sent to ${user.email} with instructions for email confirmation.`
        cy.contains('Resend Confirmation Email').click();
        cy.contains(msg);
        cy.logout();
      });
    })
  });
});