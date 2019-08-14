const user = require('../fixtures/user');
const errors = require('../fixtures/errors').forgotPassword;
const { clearInputByName, typeInputByName } = require('../helpers');

const submit = () => {
  cy.get('button').click();
};

const clearAllFields = () => {
  clearInputByName('email');
  clearInputByName('username');
};

describe('Forgot Password', function() {
  before(function() {
    cy.task('restoreAll');
    cy.visit('/login');
  });
  after(function() {
    cy.logout();
  });

  it('Clicks on Request Password Reset link from login page', function() {
    cy.contains('Request Password Reset').click();
    cy.url().should('include', 'forgotPassword');
  });

  describe('Submitting invalid form', function() {
    it('Should display error submitting empty form', function() {
      submit();
      cy.contains(errors.emptyForm);
    });

    it('Should display error providing both username and email', function() {
      typeInputByName('username', user.username);
      typeInputByName('email', user.email);
      submit();
      cy.contains(errors.tooMuchInfo);
    });
  });

  describe('Submitting valid form for nonexistant user', function() {
    before(function() {
      clearAllFields();
    });

    afterEach(function() {
      clearAllFields();
    });

    it('Should display error providing nonexistant email address', function() {
      typeInputByName('email', 'fakeemail@fake.com');
      submit();
      cy.contains(errors.noUserWithEmail);
    });

    it('Should display error providing nonexistant username', function() {
      typeInputByName('username', 'fakeusername');
      submit();
      cy.contains(errors.noUserWithUsername);
    });
  });

  describe('Submitting valid form with existing email address', function() {
    const successMsg =
      'An email with further instructions has been sent to the email address on file';

    it('should display success message', function() {
      typeInputByName('email', user.email);
      submit();
      cy.contains(successMsg);
    });
  });

  describe('Submitting valid form with existing username', function() {
    const successMsg =
      'An email with further instructions has been sent to the email address on file';
    before(function() {
      cy.visit('/forgotPassword');
    });

    it('should display success message', function() {
      typeInputByName('username', user.username);
      submit();
      cy.contains(successMsg);
    });
  });
});
