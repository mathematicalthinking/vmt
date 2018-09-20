// Should we store chat data in this component's state or in the
// redux store?
import React, { Component } from 'react';
import ChatLayout from '../../Components/Chat/Chat';
class Chat extends Component {
  state = {
    messages: [],
    newMessage: '',
  }

  componentDidMount() {
    console.log("DOES THIS WORK")
    console.log(this.props.socket)
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
    this.setState({
      messages: this.props.messages
    })
    // we dont want the chat to be live on replay
    if (!this.props.replaying) {
      this.props.socket.on('RECEIVE_MESSAGE', data => {
        let newMessages = [...this.state.messages, data]
        this.setState({
          messages: newMessages
        })
        // this.props.updateRoom({chat: data})
        // this.scrollToBottom() @TODO
      });
    }
  }

  changeHandler = event => {
    console.log('new message: ', event.target.value)
    this.setState({
      newMessage: event.target.value
    })
  }

  submitMessage = () => {
    console.log('submitting message')
    const { roomId, user } = this.props;
    const newMessage = {
      text: this.state.newMessage,
      user: {_id: user.id, username: user.username},
      room: this.props.roomId,
      timeStamp: new Date().getTime()
    }
    console.log(newMessage)
    this.props.socket.emit('SEND_MESSAGE', newMessage, (res, err) => {
      if (err) {
        console.log(err);
        return;
      }
      // we should set state in here so we can handle errors and
      // let the user know whether their message made it to the others

    })
    delete newMessage.room;
    let updatedMessages = [newMessage]
    if (this.state.messages) {
      updatedMessages = [...this.state.messages, newMessage]
    }
    // this.scrollToBottom(); @TODO
    this.setState({
      messages: updatedMessages,
      newMessage: '',
    })
    // this.props.updateRoom({chat: updatedMessages})
  }

  render() {
    return (
      <ChatLayout messages={this.state.messages} change={this.changeHandler} submit={this.submitMessage}/>
    )
  }
}

export default Chat;
