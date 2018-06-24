import React, { Component } from 'react';
import User from '../../Components/User/User';
import Message from '../../Components/Message/Message';
import { Link } from 'react-router-dom';
import classes from './layout.css';
import image from './Assets/mern.jpg';
import api from '../../utils/apiRequests';

class OtherLayout extends Component {
  state = {
    username: '',
    age: '',
    text: '',
  }

  componentDidMount() {
    // get a user and a message from the backend
    api.getUsers()
    .then(results => {
      const userInfo = results[0];
      this.setState({
        username: userInfo.username,
        age: userInfo.age
      })
    })
    .catch(err => {
      return;
    })

    api.getMessages()
    .then(results => {
      const messageInfo = results[0]
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
        <div className={classes.Content}>
          <User name={this.state.username} age={this.state.age} />
          <Message text={this.state.text} user={this.state.username} />
        </div>
        <img className={classes.Image} src={image} alt="mern"/>
        <Link to="/">go to home page</Link>
      </div>
    )
  }
};

export default OtherLayout;
