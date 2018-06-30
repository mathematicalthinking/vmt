// Should we store chat data in this component's state or in the
// redux store?
import React, { Component } from 'react';

class Chat extends Component {
  state = {
    users: [{username: 'mike', }, {username: 'steve'}],
    messages: [{
      text: 'hello',
      user: 'mike',
      timestamp: 'some date'
    }]
  }
  render() {
    const users = this.state.users.map(user => (
      <span>{user.username}</span>
    ))

    const messages = this.state.messages.map((message, i) => (
      <div key={i}>
        {message.text}
      </div>
    ))

    return (
      <div id='chatPane'>
        <section id='userList'>
          <div>Users in Session</div>
          {users}
        </section>
        <section id='chatWindow'>
          {messages}
        </section>
        <div id='chatEntryPanel'></div>
      </div>
    )
  }
}

export default Chat;
