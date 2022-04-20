// // https://wiki.geogebra.org/en/SetPerspective_Command
// const perspectiveMap = {
//   Algebra: 'A',
//   'Probability Calculator': 'B',
//   CAS: 'C',
//   'Graphics 2': 'D',
//   Graphics: 'G',
//   Geometry: 'G',
//   'Construction Protocol': 'L',
//   Spreadsheet: 'S',
//   '3D Graphics': 'T',
// };

// export const initPerspectiveListener = (
//   document,
//   currentPerspective,
//   perspectiveChanged
// ) => {
//   var elements = document.getElementsByClassName('rightButtonPanel');
//   if (elements && elements[0]) {
//     elements[0].lastChild.removeEventListener('click', menuClickListener);
//     elements[0].lastChild.addEventListener('click', menuClickListener);
//   }

//   // let item;
//   function menuClickListener() {
//     var menuItems = document.getElementsByClassName('gwt-StackPanelItem');
//     for (let item of menuItems) {
//       if (item.lastChild.innerHTML.includes('Perspectives')) {
//         item.removeEventListener('click', perspectiveClickListener);
//         item.addEventListener('click', perspectiveClickListener);
//       } else if (item.lastChild.innerHTML.includes('View')) {
//         item.removeEventListener('click', viewClickListener);
//         item.addEventListener('click', viewClickListener);
//       }
//     }

//     function perspectiveClickListener() {
//       let perspective;
//       for (perspective of this.nextSibling.firstChild.children) {
//         perspective.removeEventListener('click', cb);
//         perspective.addEventListener('click', cb);
//       }

//       function cb() {
//         perspectiveChanged(`A${perspectiveMap[this.textContent]}`);
//       }
//     }

//     function viewClickListener() {
//       for (let viewItem of this.nextSibling.firstChild.children) {
//         if (Object.keys(perspectiveMap).indexOf(viewItem.textContent) > -1) {
//           viewItem.removeEventListener('click', viewItemClickListener);
//           viewItem.addEventListener('click', viewItemClickListener);
//         }
//       }

//       function viewItemClickListener() {
//         let viewCode = this.textContent;
//         // N.B. setTimeout 0 so the checkbox can update before we look at its value
//         // you might think we could just check the opposite of its value (if its checked that means we're unchecking it)
//         // however, at least one box always needs to be checked so clicking the sole checked box does not actually toggle
//         // its value
//         setTimeout(() => {
//           let checkbox = this.firstChild.firstChild.firstChild.firstChild
//             .firstChild.firstChild;
//           if (checkbox.checked) {
//             currentPerspective = `${currentPerspective}${
//               perspectiveMap[viewCode]
//             }`;
//           } else {
//             currentPerspective = currentPerspective.replace(
//               perspectiveMap[viewCode],
//               ''
//             );
//           }
//           currentPerspective = currentPerspective.split('').sort();
//           currentPerspective = [...new Set(currentPerspective)].join('');
//           perspectiveChanged(currentPerspective); // SOrt so the algebra window is on the right
//         }, 0);
//       }
//     }
//   }
// };

// eslint-disable-next-line import/prefer-default-export
export const blankEditorState = `{"content":"","caret":[0]}`;

export const setGgbBase64Async = (ggbApplet, base64) => {
  return new Promise((resolve, reject) => {
    if (!ggbApplet || typeof base64 !== 'string') {
      reject(new Error('Invalid arguments'));
      return;
    }
    try {
      ggbApplet.setBase64(base64, () => {
        resolve(true);
      });
    } catch (err) {
      reject(err);
    }
  });
};

export const setCodeBase = (ggbApp) => {
  const versionNo = window.env.REACT_APP_GEOGEBRA_VERSION;

  if (versionNo && ggbApp) {
    ggbApp.setHTML5Codebase(`https://www.geogebra.org/apps/${versionNo}/web3d`);
  }
};
