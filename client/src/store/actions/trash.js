import { MOVE_CARD } from './actionTypes';

export const setCardPosition = (x, y) => {
  return {
    type: MOVE_CARD,
    position: {x, y}
  }
}
