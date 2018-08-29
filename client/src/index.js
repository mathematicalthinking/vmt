import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { observe } from './DnDState'

observe(cardPosition => ReactDOM.render(<App />, document.getElementById('root')));
registerServiceWorker();
