import React, { Component } from 'react';
import TextInput from '../Form/TextInput/TextInput';
import classes from './chat.css';
class Chat extends Component {

  messagesEnd = React.createRef();
  componentDidMount() {
    this.scrollToBottom();
  }
  componentDidUpdate(prevProps){
    this.scrollToBottom();
  }
  scrollToBottom = () => {
    if (this.messagesEnd) {
      this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }
  }

  render() {
    const {messages, replayer, change, submit} = this.props;
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
      <div className={classes.Container}>
        <div className={classes.ChatScroll} id='scrollable'>{displayMessages}</div>
        {!replayer ?
          <div className={classes.ChatEntry}>
            <TextInput autoComplete="off" change={change} type='text' name='message' />
            <button onClick={submit}>send</button>
          </div> : null
        }
      </div>
    )
  }
}

export default Chat;
