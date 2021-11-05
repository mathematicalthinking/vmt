import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from 'react-query';
import MyVmt from './Routes/MyVmt';
import Home from './Routes/Home';
import SocketProvider from './Components/HOC/SocketProvider';

import configureStore from './configureStore';
import './global.css';

export const store = configureStore();
const queryClient = new QueryClient();

function hashLinkScroll() {
  const { hash } = window.location;
  if (hash !== '') {
    // Push onto callback queue so it runs after the DOM is updated,
    // this is required when navigating from a different page so that
    // the element is rendered on the page before trying to getElementById.
    setTimeout(() => {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) element.scrollIntoView();
    }, 0);
  }
}

const App = () => (
  <Provider store={store}>
    <SocketProvider>
      <QueryClientProvider client={queryClient}>
        <Router onUpdate={hashLinkScroll}>
          <div
            style={{ display: 'flex', flexFlow: 'column', minHeight: '100vh' }}
          >
            <Switch>
              <Route path="/myVMT" component={MyVmt} />
              <Route path="/" component={Home} />
            </Switch>
          </div>
        </Router>
      </QueryClientProvider>
    </SocketProvider>
  </Provider>
);

export default App;
