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
    this.setState({
      newMessage: event.target.value
    })
  }

  submitMessage = () => {
    const { roomId, user } = this.props;
    if (this.state.newMessage.length === 0) return;
    const newMessage = {
      text: this.state.newMessage,
      user: {_id: user._id, username: user.username},
      room: roomId,
      timestamp: new Date().getTime()
    }
    this.props.socket.emit('SEND_MESSAGE', newMessage, (res, err) => {
      if (err) {
        console.log(err);
        return;
        // IF THERES AN ERROR WE NEED TO UNDO THE SETSTATE BELOW
      }
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
