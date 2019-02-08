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
  perspectiveChanged,
  store
) => {
  console.log("reinitiazlizing!");
  // console.log("SOTTT: ", store)
  var elements = document.getElementsByClassName("rightButtonPanel");
  elements[0].lastChild.removeEventListener("click", menuClickListener);
  elements[0].lastChild.addEventListener("click", menuClickListener);

  // let item;
  function menuClickListener() {
    console.log("menu clicked");
    var menuItems = document.getElementsByClassName("gwt-StackPanelItem");
    for (let item of menuItems) {
      if (item.lastChild.innerHTML.includes("Perspectives")) {
        item.removeEventListener("click", perspectiveClickListener);
        item.addEventListener("click", perspectiveClickListener);
      } else if (item.lastChild.innerHTML.includes("View")) {
        item.removeEventListener("click", viewClickListener);
        item.addEventListener("click", viewClickListener);
      }
    }

    function perspectiveClickListener() {
      console.log("perspective clicked");
      let perspective;
      for (perspective of this.nextSibling.firstChild.children) {
        perspective.removeEventListener("click", cb);
        perspective.addEventListener("click", cb);
      }

      function cb() {
        perspectiveChanged(perspectiveMap[perspective.textContent]);
      }
    }

    function viewClickListener() {
      console.log("view clicked");
      let viewItem;
      // console.log(item);
      console.log(this);
      for (viewItem of this.nextSibling.firstChild.children) {
        console.log(viewItem);
        if (Object.keys(perspectiveMap).indexOf(viewItem.textContent) > -1) {
          viewItem.removeEventListener("click", viewItemClickListener);
          viewItem.addEventListener("click", viewItemClickListener);
        }
      }

      function viewItemClickListener() {
        console.log("viewItem clicked");
        let newPerspective;
        let viewCode = this.textContent;
        console.log("View code: ", viewCode);
        console.log(this);
        let checkbox = this.firstChild.firstChild.firstChild.firstChild
          .firstChild.firstChild;
        console.log(checkbox);
        // we're actually checking if it IS CHECKED...this click will switch it checked
        if (!checkbox.checked) {
          console.log("CHECKED!");
          console.log("currentPerspective");
          newPerspective = `${currentPerspective}${perspectiveMap[viewCode]}`;
        } else {
          let regex = new RegExp(perspectiveMap[viewCode], "g");
          newPerspective = currentPerspective.replace(regex, "");
        }
        console.log("NEW: ", newPerspective);
        perspectiveChanged(newPerspective);
      }
    }
  }
};
