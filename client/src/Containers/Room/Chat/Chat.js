// Should we store chat data in this component's state or in the
// redux store?
import React, { Component } from 'react';
import TextInput from '../../../Components/Form/TextInput/TextInput';
import classes from './chat.css';
import glb from '../../../global.css';
class Chat extends Component {
  state = {
    users: [{username: 'mike', }, {username: 'steve'}],
    messages: [{
      text: 'hello',
      user: 'mike',
      timestamp: 'some date'
    }],
    newMessage: ''
  }

  changeHandler = (event) => {
    console.log(event.target.value)
    this.setState({
      newMessage: event.target.value
    })
  }

  submitMessage = () => {
    const newMessage = {
      text: this.state.newMessage,
      user: this.props.user,
      timestamp: Date.now()
    }
    let updatedMessages = [...this.state.messages, newMessage]
    console.log(updatedMessages);
    this.setState({
      messages: updatedMessages,
      newMessage: '',
    })
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
          <TextInput change={this.changeHandler} type='text' name='message'/>
          <button onClick={this.submitMessage}>send</button>
        </div>
      </div>
    )
  }
}

export default Chat;
