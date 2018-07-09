// Should we store chat data in this component's state or in the
// redux store?
import React, { Component } from 'react';
import TextInput from '../../../Components/Form/TextInput/TextInput';
import classes from './chat.css';
import glb from '../../../global.css';
import api from '../../../utils/apiRequests';
class Chat extends Component {
  state = {
    users: [],
    messages: [],
    newMessage: ''
  }

  componentDidMount() {
    api.get('message', {room: this.props.roomId})
    .then(response => {
      console.log('messages: ', response.data.results)
      this.setState({
        messages: response.data.results
      })
    })
    .catch(err => console.log(err))
    // API call to get initial users

    // initialize the socket listener
    this.socket = this.props.socket;
    this.socket.on('RECEIVE_MESSAGE', (data) => {
      console.log("received message ")
      let newMessages = [...this.state.messages, data]
      console.log('Setting state line 40')
      this.setState({
        messages: newMessages
      })
    });

    this.socket.on('NEW_USER', user => {
      console.log('new user joined: ', user)
      const updatedUsers = [...this.state.users, user]
      this.setState({
        users: updatedUsers
      })
    })
  }

  changeHandler = event => {
    console.log(event.target.value)
    this.setState({
      newMessage: event.target.value
    })
  }

  submitMessage = () => {
    const newMessage = {
      text: this.state.newMessage,
      user: {username: this.props.username, userId: this.props.userId},
      room: this.props.roomId,
      timestamp: Date.now()
    }
    this.socket.emit('SEND_MESSAGE', newMessage, () => {
      // we should set state in here so we can handle errors and
      // let the user know whether their message made it to the others
      console.log("SETTING STATE");
      console.log("MESSAGE SENT");
    })

    let updatedMessages = [...this.state.messages, newMessage]
    this.setState({
      messages: updatedMessages,
      newMessage: '',
    })
  }

  render() {
    const users = this.state.users.map(user => (
      <span key={user}>{user} </span>
    ))
    let messages;
    if (this.state.messages) {
      messages = this.state.messages.map((message, i) => (
        <div key={i}>
          <b>{message.user ? message.user.username : null}: </b><span>{message.text}</span>
        </div>
            ))
          }

    return (
      <div className={glb.FlexCol} id='chatPane'>
        <div>Users in Session</div>
        <section className={classes.UserList} id='userList'>
          {users}
        </section>
        <section className={classes.ChatWindow} id='chatWindow'>
          {messages}
        </section>
        <div id='chatEntryPanel'>
          <TextInput change={this.changeHandler} type='text' name='message' value={this.state.newMessage}/>
          <button onClick={this.submitMessage}>send</button>
        </div>
      </div>
    )
  }
}

export default Chat;
