import React, { Component } from 'react';
import TextInput from '../Form/TextInput/TextInput';
import glb from '../../global.css';
import { GRAPH_HEIGHT } from '../../constants';
import classes from './chat.css';
class Chat extends Component {

  messagesEnd = React.createRef();

  scrollToBottom = () => {
    if (this.messagesEnd) {
      this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }
  }

  render() {
    console.log('rendering chat component')
    console.log(this.props)
    const {messages, replayer, change, submitMessage} = this.props;
    let displayMessages = [];
    if (messages) {
      displayMessages = messages.map((message, i) => (
        <div key={i}>
          <b>{message.user.username}: </b><span>{message.text}</span>
        </div>
      ))
      // use this to scroll to the bottom
      displayMessages.push(<div key='end' ref={el => { this.messagesEnd = el}}></div>)
    }
    return (
      <div className={glb.FlexCol} style={{height: GRAPH_HEIGHT / 2}}>
        <div className={classes.UserList}>
        </div>
        <div className={classes.ChatWindow}>
          <div className={classes.ChatScroll} id='scrollable'>{displayMessages}</div>
        </div>
        {!replayer ?
          <div className={classes.ChatEntry}>
            <TextInput autoComplete="off" change={change} type='text' name='message' />
            <button onClick={submitMessage}>send</button>
          </div> : null
        }
      </div>
    )
  }
}

export default Chat;
