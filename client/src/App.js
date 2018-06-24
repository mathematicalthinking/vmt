import React from 'react';
import Layout from './Containers/Layout/Layout';
import OtherLayout from './Containers/Layout/OtherLayout';
import { BrowserRouter, Route } from 'react-router-dom';

const App = (props) => (
    <BrowserRouter>
      <main>
        <Route path="/" exact component={Layout} />
        <Route path="/otherPage" component={OtherLayout} />
      </main>
    </BrowserRouter>
);

export default App;
