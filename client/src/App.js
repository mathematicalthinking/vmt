import React from 'react';
import Main from './Layout/Main';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './store/reducers'
import thunk from 'redux-thunk';

const logger = store => {
  return next => {
    return action => {
      const result = next(action);
      return result;
    }
  }
};
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(rootReducer, composeEnhancers(applyMiddleware(logger, thunk)));

const App = (props) => (
  <Provider store={store}>
    <Main />
  </Provider>
);

export default App;
