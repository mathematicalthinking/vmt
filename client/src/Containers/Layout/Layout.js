import React, { Component } from 'react';
import classes from './Layout.css';
import Navbar from '../../Components/Navigation/Navbar';
import api from '../../utils/apiRequests';

class Layout extends Component {
  state = {
    username: '',
    age: '',
    text: '',
  }
  
  componentDidMount() {
    // get a user and a message from the backend
    api.getUsers()
    .then(result => {
      const userInfo = result[0];
      this.setState({
        username: userInfo.username,
        age: userInfo.age
      })
    })
    .catch(err => {
      return;
    })

    api.getMessages()
    .then(result => {
      const messageInfo = result[0]
      this.setState({
        text: messageInfo.text
      })
    })
    .catch(err => {
      return;
    })
  }

  render() {
    return (
      <div className={classes.Layout}>
        <div>Welcome to Virtual Math Teams</div>
        <Navbar />
      </div>
    )
  }
};

export default Layout;
