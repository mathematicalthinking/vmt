import React from 'react';
import Main from './Layout/Main';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './store/reducers'
import thunk from 'redux-thunk';
import { loadState, saveState } from './utils/localStorage';

const logger = store => {
  return next => {
    return action => {
      const result = next(action);
      return result;
    }
  }
};
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const persistedState = loadState();
const store = createStore(
  rootReducer,
  persistedState,
  composeEnhancers(applyMiddleware(logger, thunk))
);

store.subscribe(() => {
  saveState(store.getState())
});

const App = props => (
  <Provider store={store}>
    <Main />
  </Provider>
);

export default App;
