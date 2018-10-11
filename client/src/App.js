import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import MyVmt from './Routes/MyVmt';
import Home from './Routes/Home';
import { Provider } from 'react-redux';
import configureStore from './configureStore';

const store = configureStore();
const App = props => (
  <Provider store={store}>
    <Router >
      <Switch>
        <Route path={'/myVMT'} component={MyVmt} />
        <Route path={'/'} component={Home} />
      </Switch>
    </Router>
  </Provider>
);

export default App;
