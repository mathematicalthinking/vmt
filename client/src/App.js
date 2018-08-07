import React from 'react';
import Main from './Layout/Main';
import { Provider } from 'react-redux';
import configureStore from './configureStore';
import { BrowserRouter as Router, Route } from 'react-router-dom';

const store = configureStore();
const App = props => (
  <Provider store={store}>
    <Router >
      <Route path={'/'} component={Main} />
    </Router>
  </Provider>
);

export default App;
