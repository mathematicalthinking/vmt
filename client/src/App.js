import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from 'react-query';
import MyVmt from 'Routes/MyVmt';
import Home from 'Routes/Home';
import { SocketProvider, GeneralModal, IdleDetector } from 'Components';

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
    <Router onUpdate={hashLinkScroll}>
      <SocketProvider>
        <QueryClientProvider client={queryClient}>
          <div
            style={{
              display: 'flex',
              flexFlow: 'column',
              minHeight: '100vh',
            }}
          >
            <IdleDetector>
              <GeneralModal>
                <Switch>
                  <Route path="/myVMT" component={MyVmt} />
                  <Route path="/" component={Home} />
                </Switch>
              </GeneralModal>
            </IdleDetector>
          </div>
        </QueryClientProvider>
      </SocketProvider>
    </Router>
  </Provider>
);

export default App;
