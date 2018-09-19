// Should we store chat data in this component's state or in the
// redux store?
import React, { Component } from 'react';
import TextInput from '../../Components/Form/TextInput/TextInput';
import classes from '../Workspace/chat.css';
import glb from '../../global.css';
class Chat extends Component {
  state = {
    messages: [],
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {
    if (this.props.event.text && prevProps.event._id !== this.props.event._id) {
      this.setState(prevState => ({messages: [...prevState.messages, this.props.event]}))
    }
  }

  scrollToBottom = () => {
    if (this.messagesEnd) {
      this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }
  }

  render() {
    let messages;
    if (this.state.messages) {
      messages = this.state.messages.map((message, i) => (
        <div key={i}>
          <b>{message.user.username}: </b><span>{message.text}</span>
        </div>
      ))
      // use this to scroll to the bottom
      messages.push(<div key='end' ref={el => { this.messagesEnd = el}}></div>)
    }

    return (
      <div className={glb.FlexCol} style={{height: window.innerHeight - 300}}>
        <div className={classes.UserList}>
        </div>
        <div className={classes.ChatWindow}>
          <div className={classes.ChatScroll} id='scrollable'>{messages}</div>
        </div>
        <div className={classes.ChatEntry}>
          <TextInput change={this.changeHandler} type='text' name='message' value={this.state.newMessage}/>
          <button onClick={this.submitMessage}>send</button>
        </div>
      </div>
    )
  }
}

export default Chat;
