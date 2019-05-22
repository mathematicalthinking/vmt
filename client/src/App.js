import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import MyVmt from './Routes/MyVmt';
import Home from './Routes/Home';
import SocketProvider from './Components/HOC/SocketProvider';

import configureStore from './configureStore';
import './global.css';

export const store = configureStore();

const App = () => (
  <Provider store={store}>
    <SocketProvider>
      <Router>
        <div style={{ display: 'flex', flexFlow: 'column', minHeight: '100%' }}>
          <Switch>
            <Route path={'/myVMT'} component={MyVmt} />
            <Route path={'/'} component={Home} />
          </Switch>
        </div>
      </Router>
    </SocketProvider>
  </Provider>
);

export default App;
