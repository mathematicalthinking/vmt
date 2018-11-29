// Should we store chat data in this component's state or in the
// redux store?
import React, { Component } from 'react';
import { Chat as ChatLayout } from '../../Components';
class Chat extends Component {
  state = {
    newMessage: '',
    referencing: false,
  }

  componentDidMount() {
    // event handler for enter key presses
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Enter'){
        // handle differenct contexts of Enter clicks
        if (this.state.newMessage.length > 0){
          this.submitMessage();
          //  @TODO we need to check if the chat enry is in focuse with a ref()
        }
      }
    })
    // start the chat scrolled to the bottom
    // this.scrollToBottom(); @TODO this function isnt working properly
    // this.setState({
    //   messages: this.props.messages
    // })
    // we dont want the chat to be live on replay
    if (!this.props.replaying) {
      this.props.socket.on('RECEIVE_MESSAGE', data => {
        this.props.updatedRoom(this.props.roomId, {chat: [...this.props.messages, data]})
        // this.scrollToBottom() 
      });
    }
  }

  componentDidUpdate(prevProps){
    if (prevProps.referencedElement !== this.props.referencedElement) {
      console.log(this.props.referencedElement)
      this.setState({newMessage: `⬅️ ${this.state.newMessage}`, referencing: true})
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
    this.props.updatedRoom(roomId, {chat: [...this.props.messages, newMessage]})
    // this.scrollToBottom(); @TODO
    this.setState({
      newMessage: '',
    })
    // this.props.updateRoom({chat: updatedMessages})
  }

  render() {
    return (
      <ChatLayout messages={this.props.messages} change={this.changeHandler} submit={this.submitMessage} value={this.state.newMessage} referencing={this.state.referencing}/>
    )
  }
}

export default Chat;
