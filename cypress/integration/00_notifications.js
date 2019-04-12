const user1 = require("../fixtures/user");
const user2 = require("../fixtures/user2");
const user3 = require("../fixtures/user3");
const user4 = require("../fixtures/user4");
const user5 = require("../fixtures/user5");
const user6 = require("../fixtures/user6");

describe("test notifications and access to resources", function() {
  before(function() {
    cy.task("seedDB").then(() => cy.login(user2));
  });

  // COURSE
  it("user2 requests access to course 1", function() {
    cy.contains("Community").click();
    cy.wait(1000);
    cy.url().should("include", "community/activities");
    cy.contains("Courses").click();
    cy.url().should("include", "community/courses");
    cy.getTestElement("content-box-course 1").click();
    cy.getTestElement("request-access-btn").click();
    cy.url().should("include", "/confirmation");
  });
  it("user3 requests access to course 1", function() {
    cy.login(user3);
    cy.contains("Community").click();
    cy.wait(1000);
    cy.url().should("include", "community/activities");
    cy.contains("Courses").click();
    cy.url().should("include", "community/courses");
    cy.getTestElement("content-box-course 1").click();
    cy.getTestElement("request-access-btn").click();
    cy.url().should("include", "/confirmation");
  });
  it("user1 gets 2 notifications and grants access to course 1", function() {
    cy.login(user1);
    cy.url().should("include", "myVMT/courses");
    // cy.wait(1111)
    cy.getTestElement("tab-ntf")
      .contains("2")
      .should("exist");
    cy.getTestElement("content-box-ntf")
      .contains("2")
      .should("exist");
    cy.getTestElement("content-box-course 1").click();
    // cy.getTestElement('tab-ntf').contains('1')
    cy.get("#Members").click();
    cy.getTestElement("join-requests")
      .children()
      .should("have.length", 2); // One div is the request the other is the modal to trash it
    cy.getTestElement("grant-access-g-laforge").click();
    cy.getTestElement("tab-ntf")
      .contains("1")
      .should("exist");
    cy.getTestElement("members")
      .children()
      .should("have.length", 2);
    cy.contains(user2.username).should("exist");
    cy.getTestElement("join-requests")
      .children()
      .should("have.length", 1);
    cy.getTestElement("grant-access-data").click();
    cy.getTestElement("members")
      .children()
      .should("have.length", 3);
    cy.getTestElement("join-requests")
      .children()
      .contains("There are no new requests to join")
      .should("exist");

    // MAKE SURE THE NOTIFICATION IS VISUALLY RESOLVED
  });
  it("user3 gets a notification they have access to course 1", function() {
    cy.login(user3);
    cy.getTestElement("tab-ntf").contains("1");
    cy.getTestElement("content-box-ntf").contains("1");
    cy.getTestElement("content-box-course 1").click();
    cy.get("p").contains("Welcome to course 1.");
    cy.contains("Explore").click();
    cy.contains("My VMT").click();
    cy.getTestElement("tab-ntf").should("not.exist");
    cy.getTestElement("content-box-ntf").should("not.exist");
    // NAVIGATE BACK AND MAKE SURE NOTIFICATIONS HAVE BEEN RESOLVED
  });

  it("user1 assigns user3 to a course room", function() {
    cy.login(user1);
    cy.getTestElement("content-box-course 2").click();
    cy.getTestElement("content-box-ACTIVITY 2").click();
    cy.getTestElement("assign").click();
    cy.getTestElement("next-step-assign").click();
    cy.getTestElement("assign-manually").click();
    cy.contains("data").click();
    // cy.contains('worf').click()
    // cy.contains('g-laforge').click()
    cy.getTestElement("assign-rooms").click();
    cy.getTestElement("close-modal").click();
    cy.getTestElement("tab")
      .contains("Rooms")
      .click();
    cy.getTestElement("content-box-ACTIVITY 2 (room 1)").should("exist");
  });

  it("User3 gets a notification they have been assigned to a new course room", function() {
    cy.login(user3);
    cy.getTestElement("tab-ntf")
      .contains("1")
      .should("exist");
    cy.getTestElement("content-box-ntf")
      .contains("1")
      .should("exist");
    cy.getTestElement("content-box-course 2").click();
    cy.getTestElement("tab-ntf")
      .contains("1")
      .should("exist");
    cy.getTestElement("tab-ntf")
      .contains("1")
      .click();
    cy.getTestElement("content-box-ACTIVITY 2 (room 1)").should("exist");
    cy.getTestElement("content-box-ntf")
      .contains("1")
      .should("exist");
    cy.getTestElement("content-box-ACTIVITY 2 (room 1)").click();
    cy.getTestElement("explore-room").click();
    cy.getTestElement("crumb").contains("My VMT");
    cy.getTestElement("tab-ntf").should("not.exist");
  });

  it("user2 assigns user 5 to a stand alone room", function() {
    cy.login(user1);
    cy.getTestElement("tab")
      .contains("Activities")
      .click();
    cy.getTestElement("content-box-stand-alone-activity").click();
    cy.getTestElement("assign").click();
    cy.getTestElement("next-step-assign").click();
    cy.getTestElement("member-search")
      .click()
      .type("D");
    cy.contains("D-troi").click();
    cy.getTestElement("assign-rooms").click();
    cy.getTestElement("tab")
      .contains("Rooms")
      .click();
    cy.getTestElement("content-box-stand-alone-activity (room 1)").should(
      "exist"
    );
  });

  it("d-troi should have a new room notification", function() {
    cy.login(user5);
    cy.getTestElement("tab-ntf")
      .contains("1")
      .should("exist");
    cy.getTestElement("tab")
      .contains("Rooms")
      .click();
    cy.getTestElement("content-box-stand-alone-activity (room 1)").should(
      "exist"
    );
    cy.getTestElement("content-box-ntf")
      .contains("1")
      .should("exist");
    cy.getTestElement("content-box-stand-alone-activity (room 1)").click();
    cy.getTestElement("explore-room").click();
    cy.getTestElement("crumb")
      .contains("My VMT")
      .click();
    cy.getTestElement("tab-ntf").should("not.exist");
  });

  it("user2 enters course with entry-code", function() {
    cy.login(user2);
    cy.contains("Community").click();
    cy.wait(1000);
    cy.contains("Courses").click();
    cy.url().should("include", "community/courses");
    cy.getTestElement("content-box-entry-code course").click();
    cy.get("#entryCode")
      .type("{selectall} {backspace}")
      .type("entry-code-10");
    cy.contains("Join").click();
    cy.getTestElement("tab")
      .contains("Members")
      .click();
    cy.getTestElement("members")
      .children()
      .should("have.length", 2);
    cy.contains(user2.username).should("exist");
  });

  it("user1 gets notification that user2 joined course", function() {
    cy.login(user1);
    cy.getTestElement("tab-ntf").contains("1");
    cy.getTestElement("content-box-ntf").contains("1");
    cy.getTestElement("content-box-entry-code course").click();
    cy.getTestElement("tab-ntf").contains("1");
    cy.getTestElement("tab")
      .contains("Members")
      .click();
    cy.getTestElement("members")
      .children()
      .should("have.length", 2);
    cy.getTestElement("members")
      .children()
      .contains("g-laforge");
    cy.getTestElement("member-ntf").should("exist");
  });

  it("should resolve notificaiton after user1 seees", function() {
    cy.getTestElement("crumb")
      .contains("My VMT")
      .click();
    cy.getTestElement("tab-ntf").should("not.exist");
    cy.getTestElement("content-box-ntf").should("not.exist");
  });

  //  // ROOM
  it("user2 requests access to room", function() {
    cy.login(user2);
    cy.contains("Community").click();
    cy.wait(500);
    cy.contains("Rooms").click();
    cy.wait(500);
    cy.getTestElement("content-box-request access").click();
    cy.getTestElement("request-access-btn").click();
    cy.url().should("include", "/confirmation");
  });

  it("user1 grants access to user2 (room)", function() {
    cy.login(user1);
    cy.getTestElement("tab-ntf")
      .contains("1")
      .click();
    cy.getTestElement("content-box-ntf").contains("1");
    cy.getTestElement("content-box-request access").click();
    cy.getTestElement("tab-ntf").contains("1");
    cy.get("#Members").click();
    cy.getTestElement("join-requests")
      .children()
      .should("have.length", 1);
    cy.getTestElement("grant-access-g-laforge").click();
    cy.getTestElement("tab-ntf").should("not.exist");
    cy.getTestElement("members")
      .children()
      .should("have.length", 2);
    cy.contains(user2.username).should("exist");
  });

  it("user2 now has access to room", function() {
    cy.login(user2);
    cy.getTestElement("tab-ntf")
      .contains("1")
      .should("exist");
    cy.getTestElement("tab")
      .contains("Rooms")
      .click();
    cy.getTestElement("content-box-ntf")
      .contains("1")
      .should("exist");
    cy.getTestElement("content-box-request access").click();
    cy.contains("Explore").click();
    cy.getTestElement("tab")
      .contains("Members")
      .click();
    cy.getTestElement("members")
      .children()
      .should("have.length", 2);
    cy.getTestElement("crumb")
      .contains("My VMT")
      .click();
    // cy.getTestElement('tab-ntf').should('not.exist') // we might want to chec
  });

  it("user2 joins a room by entering entry-code", function() {
    cy.login(user2);
    cy.contains("Community").click();
    cy.wait(500);
    cy.url().should("include", "community/activities");
    cy.contains("Rooms").click();
    cy.url().should("include", "community/rooms");
    cy.getTestElement("content-box-room 1").click();
    cy.get("#entryCode")
      .type("{selectall} {backspace}")
      .type("rare-shrimp-45");
    cy.contains("Join").click();
    cy.url().should("include", "details");
  });

  it("user 1 should get a notification that user2 joined", function() {
    cy.login(user1);
    cy.getTestElement("tab-ntf").contains("1");
    cy.getTestElement("tab")
      .contains("Rooms")
      .click();
    cy.getTestElement("content-box-ntf").contains("1");
    cy.getTestElement("content-box-room 1").click();
    cy.getTestElement("tab-ntf").contains("1");
    cy.getTestElement("tab")
      .contains("Members")
      .click();
    cy.getTestElement("members")
      .children()
      .should("have.length", 2);
    cy.getTestElement("members")
      .children()
      .contains("g-laforge");
    cy.getTestElement("member-ntf").should("exist");
  });

  it("should resolve the notification after user 1 has seen it", function() {
    cy.getTestElement("tab")
      .contains("Details")
      .click();
    cy.getTestElement("tab-ntf").should("not.exist");
  });

  it("Picard invites Beverly to join a course", function() {
    cy.login(user1);
    cy.getTestElement("content-box-course 1").click();
    cy.getTestElement("tab")
      .contains("Members")
      .click();
    cy.getTestElement("member-search")
      .click()
      .type("Bc");
    cy.getTestElement("invite-member-bcrush").click();
    cy.getTestElement("member-bcrush").should("exist");
  });

  it("Picard invites Beverly to join a room", function() {
    cy.getTestElement("crumb")
      .contains("My VMT")
      .click();
    cy.getTestElement("tab")
      .contains("Rooms")
      .click();
    cy.getTestElement("content-box-room 1").click();
    cy.getTestElement("tab")
      .contains("Members")
      .click();
    cy.getTestElement("member-search")
      .click()
      .type("Bc");
    cy.getTestElement("invite-member-bcrush").click();
    cy.getTestElement("member-bcrush").should("exist");
  });

  it("Beverly gets a notification shes been added to a course", function() {
    cy.login(user6);
    cy.getTestElement("tab-ntf")
      .contains("1")
      .should("exist");
    cy.getTestElement("content-box-ntf").contains("1");
    cy.getTestElement("content-box-course 1").click();
    cy.getTestElement("join").click();
  });

  it("Beverly gets a notification shes been added to a room", function() {
    cy.getTestElement("crumb")
      .contains("My VMT")
      .click();
    cy.getTestElement("tab")
      .contains("Rooms")
      .click();
    cy.getTestElement("content-box-ntf").contains("1");
    cy.getTestElement("content-box-room 1").click();
    cy.getTestElement("leave").click();
    cy.getTestElement("content-box-room 1").should("not.exist");
  });

  it("user fails to join with wrong entry code (room)", function() {
    cy.login(user2);
    cy.contains("Community").click();
    cy.wait(1000);
    cy.url().should("include", "community/activities");
    cy.contains("Rooms").click();
    cy.url().should("include", "community/rooms");
    cy.getTestElement("content-box-wrong entry code room").click();
    cy.get("#entryCode")
      .type("{selectall} {backspace}")
      .type("WRONG_CODE");
    cy.contains("Join").click();
    cy.getTestElement("entry-code-error").contains(
      "That entry code was incorrect. Try again."
    );
    cy.getTestElement("close-modal").click();
  });

  it("user fails to join with wrong entry code (course)", function() {
    cy.contains("Courses").click();
    cy.url().should("include", "community/courses");
    cy.getTestElement("content-box-wrong entry code course").click();
    cy.get("#entryCode")
      .type("{selectall} {backspace}")
      .type("WRONG_CODE");
    cy.contains("Join").click();
    cy.getTestElement("entry-code-error")
      .contains("That entry code was incorrect. Try again.")
      .should("exist");
  });
});
