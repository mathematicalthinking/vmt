import user8 from '../fixtures/user8';
import user from '../fixtures/user';

describe('Data Visualization', function() {
  before(function() {
    cy.task('seedDB').then(() => cy.login(user8));
  });

  after(function() {
    cy.logout();
  });

  it('displays a graph of activity', () => {
    cy.getTestElement('content-box-reference room').click();
    cy.contains('Stats').click();
    cy.getTestElement('chart').should('be.visible');
    cy.getTestElement('line-#2d91f2').should('be.visible');
  });

  it('filters the data', () => {
    cy.getTestElement('5d0d2eae535e3a522445f7a4-checkbox').click();
    cy.getTestElement('line-#2d91f2').should('not.be.visible');
    cy.getTestElement('line-#f26247').should('be.visible');
    cy.getTestElement('messages-checkbox').click();
    cy.getTestElement('line-#f26247').should('not.be.visible');
    cy.getTestElement('line-#5dd74a').should('be.visible');
    cy.getTestElement('actions-checkbox').click();
    cy.getTestElement('line-#5dd74a').should('be.visible');
    cy.getTestElement('line-#8d4adb').should('be.visible');
    cy.getTestElement('User messages-checkbox').click();
    cy.getTestElement('line-#5dd74a').should('not.be.visible');
    cy.getTestElement('line-#8d4adb').should('be.visible');
    cy.getTestElement('line-#43c086').should('be.visible');
    cy.getTestElement('Enter/exit messages-checkbox').click();
    cy.getTestElement('line-#8d4adb').should('be.visible');
    cy.getTestElement('line-#43c086').should('be.visible');
    cy.getTestElement('line-#4655d4').should('be.visible');
    cy.getTestElement('Control-checkbox').click();
    cy.getTestElement('line-#8d4adb').should('be.visible');
    cy.getTestElement('line-#43c086').should('be.visible');
    cy.getTestElement('line-#4655d4').should('be.visible');
    cy.getTestElement('line-#c940ce').should('be.visible');
    cy.getTestElement('Add-checkbox').click();
    cy.getTestElement('line-#8d4adb').should('not.be.visible');
    cy.getTestElement('line-#43c086').should('be.visible');
    cy.getTestElement('line-#4655d4').should('be.visible');
    cy.getTestElement('line-#c940ce').should('be.visible');
    cy.getTestElement('line-#fb4b02').should('be.visible');
    cy.getTestElement('Remove-checkbox').click();
    cy.getTestElement('line-#43c086').should('be.visible');
    cy.getTestElement('line-#4655d4').should('be.visible');
    cy.getTestElement('line-#c940ce').should('be.visible');
    cy.getTestElement('line-#fb4b02').should('be.visible');
    cy.getTestElement('line-#42770a').should('be.visible');
    cy.getTestElement('Update-checkbox').click();
    cy.getTestElement('line-#43c086').should('be.visible');
    cy.getTestElement('line-#4655d4').should('be.visible');
    cy.getTestElement('line-#c940ce').should('be.visible');
    cy.getTestElement('line-#fb4b02').should('be.visible');
    cy.getTestElement('line-#42770a').should('be.visible');
    cy.getTestElement('line-#cf2418').should('be.visible');
    cy.getTestElement('Drag-checkbox').click();
    cy.getTestElement('line-#43c086').should('be.visible');
    cy.getTestElement('line-#4655d4').should('be.visible');
    cy.getTestElement('line-#c940ce').should('be.visible');
    cy.getTestElement('line-#fb4b02').should('be.visible');
    cy.getTestElement('line-#42770a').should('be.visible');
    cy.getTestElement('line-#cf2418').should('be.visible');
    cy.getTestElement('line-#ff8d14').should('be.visible');
    cy.getTestElement('Select-checkbox').click();
    cy.getTestElement('line-#43c086').should('be.visible');
    cy.getTestElement('line-#4655d4').should('be.visible');
    cy.getTestElement('line-#c940ce').should('be.visible');
    cy.getTestElement('line-#fb4b02').should('be.visible');
    cy.getTestElement('line-#42770a').should('be.visible');
    cy.getTestElement('line-#cf2418').should('be.visible');
    cy.getTestElement('line-#ff8d14').should('be.visible');
    cy.getTestElement('line-#e846ba').should('be.visible');
  });

  it('toggles to table data', () => {
    cy.getTestElement('toggle-chart').click();
    cy.getTestElement('table').should('be.visible');
    cy.getTestElement('chart').should('not.be.visible');
    cy.getTestElement('toggle-chart').click();
    cy.getTestElement('table').should('not.be.visible');
    cy.getTestElement('chart').should('be.visible');
  });

  it('downloads csv of data', () => {
    cy.getTestElement('download-csv').click();
    cy.getTestElement('downloadLink')
      .should('not.be.visible')
      .should('have.attr', 'href')
      .and('include', 'blob:http://localhost');
  });
});

describe('Visiting stats page for a room with no recorded data', function() {
  const roomId = '5ba289c57223b9429888b9b5';
  const roomName = 'room 1';

  before(function() {
    cy.login(user);
    cy.contains(roomName).click();
    cy.contains('Stats').click();
  });

  after(function() {
    cy.logout();
  });

  it('Should display no data message', function() {
    cy.url().should('include', `/myVMT/rooms/${roomId}/stats`);
    cy.getTestElement('no-data-message').should('exist');
  });
});
