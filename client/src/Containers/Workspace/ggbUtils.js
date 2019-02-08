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

export const initPerspectiveListener = (
  document,
  currentPerspective,
  perspectiveChanged
) => {
  var elements = document.getElementsByClassName("rightButtonPanel");
  elements[0].lastChild.addEventListener("click", function() {
    var menuItems = document.getElementsByClassName("gwt-StackPanelItem");
    for (let item of menuItems) {
      if (item.lastChild.innerHTML.includes("Perspectives")) {
        item.addEventListener("click", function() {
          for (let perspective of item.nextSibling.firstChild.children) {
            perspective.addEventListener("click", () => {
              perspectiveChanged(perspectiveMap[perspective.textContent]);
            });
          }
        });
      } else if (item.lastChild.innerHTML.includes("View")) {
        item.addEventListener("click", function() {
          for (let view of item.nextSibling.firstChild.children) {
            if (Object.keys(perspectiveMap).indexOf(view.textContent) > -1) {
              view.addEventListener("click", () => {
                console.log(view.textContent);
                console.log(
                  `${currentPerspective}${perspectiveMap[view.textContent]}`
                );
                perspectiveChanged(
                  `${currentPerspective}${perspectiveMap[view.textContent]}`
                );
              });
            }
          }
        });
      }
    }
  });
};
