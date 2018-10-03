import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Main from './Layout/Main';
import Home from './Home';
import { Provider } from 'react-redux';
import configureStore from './configureStore';
import { Login} from './Containers';

const store = configureStore();
const App = props => (
  <Provider store={store}>
    <Router >
      <Switch>
        {/* <Route path={'/'} component={Homepage} /> */}
        <Route path={'/'} component={Home} />
        {/* <Route path={'/Signup'} component={Signup} /> */}
        <Route path={'/myVMT'} component={Main} />
      </Switch>
    </Router>
  </Provider>
);

export default App;
