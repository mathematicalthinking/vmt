import React, { Component } from 'react';
import classes from './Layout.css';
import Navbar from '../../Components/Navigation/Navbar';
import Login from '../Login/Login';
import api from '../../utils/apiRequests';

class Layout extends Component {
  state = {
    username: '',
    age: '',
    text: '',
  }

  componentDidMount() {
  }

  render() {
    return (
      <div className={classes.Layout}>
        <div>Welcome to Virtual Math Teams</div>
        <Navbar />
        <Login />
      </div>
    )
  }
};

export default Layout;
