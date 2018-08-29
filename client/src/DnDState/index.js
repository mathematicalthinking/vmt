// @IDEA Consider moving this to the redux store?
let cardPosition = [0,0]
let observer = null;

function emitChange() {
 observer(cardPosition)
}

export function observe(o) {
  if(observer) {
    throw new Error('Multiple observers not implemented.')
  }
  observer = o;
  emitChange();
}

export function moveCard(toX, toY) {
  cardPosition = [toX, toY];
  emitChange();
}
// export function moveCard(toX, toY) {
//   const cardPosition = [toX, toY];
//   emitChange()
// }
