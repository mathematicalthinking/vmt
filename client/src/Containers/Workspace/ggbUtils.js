// https://wiki.geogebra.org/en/SetPerspective_Command
const perspectiveMap = {
  Algebra: "A",
  "Probability Calculator": "B",
  CAS: "C",
  "Graphics 2": "D",
  Graphics: "G",
  "Construction Protocol": "L",
  Spreadsheet: "S",
  "3D Graphics": "T"
};
export const initPerspectiveListener = (document, perspectiveChanged) => {
  var elements = document.getElementsByClassName("rightButtonPanel");
  elements[0].lastChild.addEventListener("click", function() {
    var menuItems = document.getElementsByClassName("gwt-StackPanelItem");

    for (let item of menuItems) {
      if (item.lastChild.innerHTML.includes("Perspectives")) {
        item.addEventListener("click", function() {
          for (let perspective of item.nextSibling.firstChild.children) {
            perspective.addEventListener("click", () => {
              console.log(perspective.textContent);
              perspectiveChanged(perspectiveMap[perspective.textContent]);
            });
          }
        });
      }
    }
  });
};
