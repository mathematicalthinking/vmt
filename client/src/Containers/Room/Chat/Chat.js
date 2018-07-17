// Should we store chat data in this component's state or in the
// redux store?
import React, { Component } from 'react';
import TextInput from '../../../Components/Form/TextInput/TextInput';
import classes from './chat.css';
import glb from '../../../global.css';
class Chat extends Component {
  state = {
    messages: [],
    newMessage: '',
  }

  componentDidMount() {
    // event handler for enter key presses
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Enter'){
        // handle differenct contexts of Enter clicks
        if (this.state.messages.length > 0){
          // this.submitMessage(); @TODO we need to check if the chat enry is in focuse with a ref()
        }
      }
    })
    // start the chat scrolled to the bottom
    // this.scrollToBottom(); @TODO this function isnt working properly
    // initialize the socket listener
    this.setState({
      messages: this.props.messages
    })
    // we dont want the chat to be live on replay
    if (!this.props.replaying) {
      this.socket = this.props.socket;
      this.socket.on('RECEIVE_MESSAGE', data => {
        console.log('receive message')
        let newMessages = [...this.state.messages, data]
        this.setState({
          messages: newMessages
        })
        this.props.updateRoom({chat: data})
        // this.scrollToBottom() @TODO
      });
    }
  }

  scrollToBottom = () => {
    if (this.messagesEnd) {
      console.log(this.messagesEnd)
      this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }
  }

  changeHandler = event => {
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
      console.log("MESSAGE SENT");
    })

    let updatedMessages = [...this.state.messages, newMessage]
    // this.scrollToBottom(); @TODO
    this.setState({
      messages: updatedMessages,
      newMessage: '',
    })
    this.props.updateRoom({chat: newMessage})
  }

  render() {
    let messages;
    if (this.state.messages) {
      messages = this.state.messages.map((message, i) => (
        <div key={i}>
          <b>{message.user ? message.user.username : null}: </b><span>{message.text}</span>
        </div>
      ))
      // use this to scroll to the bottom
      messages.push(<div ref={el => { this.messagesEnd = el}}></div>)
    }

    return (
      <div className={glb.FlexCol}>
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
