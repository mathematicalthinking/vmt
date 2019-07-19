const {
  userLiveToken,
  userExpiredToken,
} = require('../fixtures/resetPassword');
const errors = require('../fixtures/errors').resetPassword;
const { clearInputByName, typeInputByName } = require('../helpers');

const submit = () => {
  cy.get('button').click();
};

const clearAllFields = () => {
  clearInputByName('password');
  clearInputByName('confirmPassword');
};

describe('Reset Password', function() {
  before(function() {
    cy.task('restoreAll');
  });

  describe('Visiting reset page with invalid token', function() {
    let url = `/resetPassword/${userLiveToken.invalidToken}`;

    it('Should display error message', function() {
      cy.visit(url);
      cy.contains(errors.invalidToken);
    });
  });

  describe('Visiting reset page with valid but expired token', function() {
    let url = `/resetPassword/${userExpiredToken.token}`;
    it('Should display error message', function() {
      cy.visit(url);
      cy.contains(errors.invalidToken);
    });
  });

  describe('Visiting reset page with valid token', function() {
    let url = `/resetPassword/${userLiveToken.token}`;
    it('Should load resetPassword page / form', function() {
      cy.visit(url);
      cy.url().should('include', '/resetPassword');
    });

    describe('Submitting invalid form', function() {
      afterEach(function() {
        clearAllFields();
      });

      describe('Submitting empty form', function() {
        it('Should display error', function() {
          submit();
          cy.contains(errors.emptyForm);
        });
      });

      describe('Submitting when confirmPassword does not match password', function() {
        it('Should display error', function() {
          typeInputByName('password', 'testapples11');
          typeInputByName('confirmPassword', 'testapple11');
          submit();
          cy.contains(errors.mismatch);
        });
      });

      describe('Submitting matching but invalid password', function() {
        it('Should display error', function() {
          typeInputByName('password', 'tooshort');
          typeInputByName('confirmPassword', 'tooshort');
          submit();
          cy.contains(errors.tooShort);
        });
      });
    });
    describe('Submitting valid form', function() {
      it('Should automaticaly log user in and redirect to myVmt', function() {
        typeInputByName('password', userLiveToken.newPassword);
        typeInputByName('confirmPassword', userLiveToken.newPassword);
        submit();
        cy.url().should('include', '/myVMT/rooms');
      });
    });

    describe('Future login', function() {
      before(function() {
        cy.logout();
      });

      it('Should not let user login with old password', function() {
        cy.visit('/login');
        cy.url().should('include', '/login');

        typeInputByName('username', userLiveToken.username);
        typeInputByName('password', userLiveToken.oldPassword);
        submit();
        cy.contains('Incorrect password');
      });

      it('Should let user login with new password', function() {
        clearInputByName('username');
        clearInputByName('password');
        typeInputByName('username', userLiveToken.username);
        typeInputByName('password', userLiveToken.newPassword);
        submit();
        cy.url().should('include', '/myVMT/rooms');
      });
    });
  });
});
