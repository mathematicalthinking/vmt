import React from 'react';
import Layout from './Containers/Layout/Layout';
import { BrowserRouter, Route } from 'react-router-dom';

const App = (props) => (
    <BrowserRouter>
      <main>
        <Route path="/" exact component={Layout} />
      </main>
    </BrowserRouter>
);

export default App;
