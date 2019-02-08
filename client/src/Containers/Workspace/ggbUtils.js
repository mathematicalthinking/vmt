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
                let newPerspective;
                let viewCode = view.textContent;
                console.log("CURRENT PER: ", currentPerspective);
                if (currentPerspective.indexOf(perspectiveMap[viewCode]) > -1) {
                  console.log("removing");
                  // remove from perspective string if the currentPerspective already has it
                  let regex = new RegExp(perspectiveMap[viewCode], "g");
                  newPerspective = currentPerspective.replace(regex, "");
                } else {
                  console.log("adding new perspective");
                  newPerspective = `${currentPerspective}${
                    perspectiveMap[viewCode]
                  }`;
                }
                console.log("NEW: ", newPerspective);
                perspectiveChanged(newPerspective);
              });
            }
          }
        });
      }
    }
  });
};
