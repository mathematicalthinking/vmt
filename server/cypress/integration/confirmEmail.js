/* eslint-disable no-shadow */
/* eslint-disable no-unused-expressions */
const {
  userLiveToken,
  userExpiredToken,
  noEmailUser,
  // userConfirmed,
} = require('../fixtures/confirmEmail');
const errors = require('../fixtures/errors').confirmEmail;

describe('Confirming Email', function() {
  before(function() {
    cy.task('restoreAll');
  });

  // TODO: Determine better way to mimic clicking email link
  //   xdescribe('Visiting unconfirmed page with already confirmed email', function() {
  //     const user = userConfirmed;
  //     const confirmUrl = `/confirmEmail/${userLiveToken.token}`;
  //     const successMsg = `${userLiveToken.email} has been successfully confirmed`;
  //     const logoutPrompt = `Click Log Out below if you would like to log in to the account
  //     associated with ${userLiveToken.email};
  // `;

  //     xit('should redirect to myVMT', function() {
  //       cy.visit('/login');
  //       cy.get('input[name=username]').type(user.username);
  //       cy.get('input[name=password]').type(user.password);
  //       cy.get('button').click();
  //       cy.url().should('include', '/myVMT/rooms');
  //       cy.wait(1000);
  //     });

  //     xit('should be prompted to logout after confirming email for another account', function() {
  //       cy.visit(confirmUrl);
  //       cy.contains(successMsg);
  //       cy.contains(logoutPrompt);
  //       cy.getTestElement('confirmEmail-logout').click();
  //       cy.url().should('include', '/');
  //     });
  //   });

  describe('Unexpected Errors', function() {
    const url = `/confirmEmail/${userLiveToken.token}`;
    const successMsg = `${userLiveToken.email} has been successfully confirmed`;

    describe('While not logged in', function() {
      describe('Encompass error', function() {
        before(function() {
          cy.task('dropEnc');
        });

        after(function() {
          cy.task('restoreAll');
        });

        it('should display error message', function() {
          cy.visit(url);
          cy.contains('Request failed with status code 500');
        });

        it('should redirect to /unconfirmed after logging in', function() {
          cy.visit('/login');
          cy.get('input[name=username]').type(userLiveToken.username);
          cy.get('input[name=password]').type(userLiveToken.password);
          cy.get('button').click();
          cy.url().should('include', '/unconfirmed');
          cy.wait(1000);
        });

        it("vmt user's email should not be confirmed", function() {
          cy.request('/auth/currentUser').should((response) => {
            expect(response.body.result.isEmailConfirmed).to.be.false;
            expect(response.body.result.confirmEmailDate).to.be.null;
            cy.logout();
            cy.task('restoreEnc');
          });
        });

        it('should succeed on retry with same token', function() {
          cy.visit(url);
          cy.contains(successMsg);
        });
      });
    });

    describe('While logged in', function() {
      describe('Encompass error', function() {
        before(function() {
          cy.task('dropEnc');
        });

        after(function() {
          cy.task('restoreAll');
        });

        it('should display error message', function() {
          cy.visit('/login');
          cy.get('input[name=username]').type(userLiveToken.username);
          cy.get('input[name=password]').type(userLiveToken.password);
          cy.get('button').click();
          cy.url().should('include', '/unconfirmed');
          cy.wait(1000);
          cy.visit(url);
          cy.contains('Request failed with status code 500');
        });

        it('should redirect to unconfirmed after navigating to myVMT', function() {
          cy.contains('My VMT').click();
          cy.url().should('include', '/unconfirmed');
        });

        it("vmt user's email should not be confirmed", function() {
          cy.request('/auth/currentUser').should((response) => {
            const { isEmailConfirmed, confirmEmailDate } = response.body.result;
            expect(isEmailConfirmed).to.be.false;
            expect(confirmEmailDate).to.be.null;
            cy.task('restoreEnc');
          });
        });

        it('should succeed on retry with same token', function() {
          cy.visit(url);
          cy.contains(successMsg);
        });
      });
    });
  });

  describe('Invalid token', function() {
    const url = `/confirmEmail/${userLiveToken.invalidToken}`;

    it('should display error message', function() {
      cy.visit(url);
      cy.contains(errors.invalidToken);
    });
  });

  describe('Existing but expired token', function() {
    const url = `/confirmEmail/${userExpiredToken.token}`;
    const user = userExpiredToken;

    describe('While not logged in', function() {
      it('should display error message', function() {
        cy.visit(url);
        cy.contains(errors.expiredToken);
      });

      it('should not display resend email button', function() {
        cy.getTestElement('resend-btn').should('not.be.visible');
      });
    });

    describe('While logged in', function() {
      it('should display error message', function() {
        cy.visit('/login');
        cy.get('input[name=username]').type(user.username);
        cy.get('input[name=password]').type(user.password);
        cy.get('button').click();
        cy.url().should('include', '/unconfirmed');
        // not sure why we have to wait here
        // not recognizing that we are logged in otherwise
        cy.wait(1000);
        cy.visit(url);
        cy.url().should('include', '/confirmEmail');
        cy.contains(errors.expiredToken);
      });

      it('should display resend email button', function() {
        cy.getTestElement('resend-btn').should('be.visible');
      });

      it('should display success message after clicking resend email button', function() {
        const msg = `Email has been sent to ${user.email} with instructions for email confirmation.`;
        cy.getTestElement('resend-btn').click();
        cy.contains(msg);
        cy.logout();
      });
    });
  });

  describe('Valid Token', function() {
    const url = `/confirmEmail/${userLiveToken.token}`;
    const user = userLiveToken;
    const successMsg = `${userLiveToken.email} has been successfully confirmed`;
    describe('While not logged in', function() {
      it('should display success message', function() {
        cy.visit(url);
        cy.contains(successMsg);
      });
    });

    describe('While logged in', function() {
      before(function() {
        cy.task('restoreAll');
      });
      const successMsg = `${user.email} has been successfully confirmed`;

      it('should display success message', function() {
        cy.visit('/login');
        cy.get('input[name=username]').type(user.username);
        cy.get('input[name=password]').type(user.password);
        cy.get('button').click();
        cy.url().should('include', '/unconfirmed');
        cy.visit(url);
        cy.contains(successMsg);

        cy.logout();
      });
    });

    describe('Confirming email for another account while logged in', function() {
      before(function() {
        cy.task('restoreAll');
      });
    });
  });

  describe('Logging in with unconfirmed email', function() {
    before(function() {
      cy.task('restoreAll');
    });

    describe('As user without email address', function() {
      const user = noEmailUser;

      it('should redirect to myVMT', function() {
        cy.visit('/login');
        cy.get('input[name=username]').type(user.username);
        cy.get('input[name=password]').type(user.password);
        cy.get('button').click();
        cy.url().should('include', '/myVMT/');
        cy.logout();
      });
    });

    describe('As user with email address', function() {
      const user = userLiveToken;

      it('should redirect to unconfirmed page', function() {
        cy.visit('/login');
        cy.get('input[name=username]').type(user.username);
        cy.get('input[name=password]').type(user.password);
        cy.get('button').click();
        cy.url().should('include', '/unconfirmed');
      });

      it('should display success message after clicking resend email button', function() {
        const msg = `Email has been sent to ${user.email} with instructions for email confirmation.`;
        cy.contains('Resend Confirmation Email').click();
        cy.contains(msg);
        cy.logout();
      });
    });
  });
});
