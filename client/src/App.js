import React from 'react';
import Main from './Layout/Main';
import { Provider } from 'react-redux';
import configureStore from './configureStore';
import Homepage from './Layout/Homepage/Homepage';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

const store = configureStore();
const App = props => (
  <Provider store={store}>
    <Router >
      <Switch>
        <Route path={'/'} component={Homepage} />
        <Route path={'/myVMT'} component={Main} />
      </Switch>
    </Router>
  </Provider>
);

export default App;
