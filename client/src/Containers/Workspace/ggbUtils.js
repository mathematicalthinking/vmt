export const initPerspectiveListener = (document, perspectiveChanged) => {
  var elements = document.getElementsByClassName("rightButtonPanel");
  elements[0].lastChild.addEventListener("click", function() {
    var menuItems = document.getElementsByClassName("gwt-StackPanelItem");

    for (let item of menuItems) {
      if (item.lastChild.innerHTML.includes("Perspectives")) {
        item.addEventListener("click", function() {
          for (let perspective of item.nextSibling.firstChild.children) {
            perspective.addEventListener("click", () => {
              perspectiveChanged();
            });
          }
        });
      }
    }
  });
};
