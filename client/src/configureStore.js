import { createStore, applyMiddleware, compose } from "redux";

import throttle from "lodash/throttle";
import rootReducer from "./store/reducers";
import thunk from "redux-thunk";
import { loadState, saveState } from "./utils/localStorage";
const configureStore = () => {
  const logger = store => {
    return next => {
      return action => {
        const result = next(action);
        return result;
      };
    };
  };
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  const persistedState = loadState();
  const store = createStore(
    rootReducer,
    persistedState,
    composeEnhancers(applyMiddleware(logger, thunk))
  );

  store.subscribe(
    throttle(() => {
      saveState(store.getState());
    }, 1000)
  );

  return store;
};

export default configureStore;
