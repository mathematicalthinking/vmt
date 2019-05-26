import React from 'react';
import ReactDOM from 'react-dom';
import DemoBrowser from '../Components/DemoBrowser/DemoBrowser';

const TestComponent = () => {
  return <div>{DemoBrowser}</div>;
};

ReactDOM.render(<TestComponent />, document.getElementById('root'));
