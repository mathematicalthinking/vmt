import user1 from "../fixtures/user";

describe("Workspace/replayer", function() {
  // before(function() {
  //   cy.task("seedDB").then(() => cy.login(user1));
  // });
  // it("loads a workspace", function() {
  //   cy.get("#Rooms").click();
  //   cy.getTestElement("content-box-room 1").click();
  //   cy.wait(500);
  //   cy.getTestElement("Enter").click();
  //   cy.wait(5000);
  //   cy.getTestElement("chat")
  //     .children()
  //     .should("have.length", 1);
  // });
  // it("prevents tool selection without taking control", function() {
  //   cy.get(":nth-child(5) > .toolbar_button > .gwt-Image").click();
  //   cy.get('[mode="16"] > .gwt-Label').click();
  //   cy.wait(5000);
  //   cy.on("window:alert", function() {});
  // });
  // it("allows tool selection after taking control", function() {});
  // it("creates a new tab", function() {});
  // it("loads a replayer", function() {
  //   cy.getTestElement("exit-room").click();
  //   cy.getTestElement("Replayer").click();
  // });
});
