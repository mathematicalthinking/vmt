// Should we store chat data in this component's state or in the
// redux store?
import React, { Component } from 'react';
import TextInput from '../../../Components/Form/TextInput/TextInput';
import classes from './chat.css';
import glb from '../../../global.css';
import io from 'socket.io-client';
import api from '../../../utils/apiRequests';
class Chat extends Component {
  state = {
    users: [],
    messages: [],
    newMessage: ''
  }

  componentDidMount() {
    // Load existing chat history
    console.log('making api request for chat hiustoryu');
    api.get('message', {room: this.props.roomId})
    .then(result => {
      const fetchedMessages = result.data.results.map(message => (
        {user: message.user.username, text: message.text}
      ))
      this.setState({
        messages: fetchedMessages
      })
    })
    .catch(err => console.log(err))
    //connect to the backend websocket
    this.socket = io.connect(process.env.REACT_APP_SERVER_URL);
    // join a chat for this room
    this.socket.on('connect', () => {
      this.socket.emit('JOIN', this.props.roomId);
      // should get the other users in the room here
    })
    this.socket.on('RECEIVE_MESSAGE', (data) => {
      console.log("received message ")
      let newMessages = [...this.state.messages, data]
      console.log('Setting state line 40')
      this.setState({
        messages: newMessages
      })
    });
  }

  changeHandler = (event) => {
    console.log(event.target.value)
    this.setState({
      newMessage: event.target.value
    })
  }

  submitMessage = () => {
    if (this.state.newMessage.length > 1) {
      const newMessage = {
        text: this.state.newMessage,
        user: this.props.userId,
        timestamp: Date.now()
      }
      newMessage.room = this.props.roomId;
      newMessage.userId = this.props.userId;
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
  }

  render() {
    const users = this.state.users.map(user => (
      <span key={user.username}>{user.username} </span>
    ))

    const messages = this.state.messages.map((message, i) => (
      <div key={i}>
        <b>{message.user}: </b><span>{message.text}</span>
      </div>
    ))

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
