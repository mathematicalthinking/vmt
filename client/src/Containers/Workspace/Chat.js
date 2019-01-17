// Should we store chat data in this component's state or in the
// redux store?
import React, { Component } from 'react';
import socket from '../../utils/sockets';
import { Chat as ChatLayout } from '../../Components';
class Chat extends Component {
  state = {
    newMessage: '',
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
    if (!this.props.replaying) {
      socket.removeAllListeners('RECEIVE_MESSAGE')
      socket.on('RECEIVE_MESSAGE', data => {
        this.props.updatedRoom(this.props.roomId, {chat: [...this.props.messages, data]})
        // this.scrollToBottom()
      });
    }
  }

  componentDidUpdate(prevProps, prevState){
    if (!prevProps.referencing && this.props.referencing) {
      this.setState({newMessage: `⬅️ ${this.state.newMessage}`})
    }
    else if (prevProps.referencing && !this.props.referencing) {
      let newMessage = this.state.newMessage.replace(/⬅/g, '')
      this.setState({newMessage,})
    }
    if (((prevState.newMessage.includes('⬅') && !this.state.newMessage.includes('⬅️')) && !this.state.newMessage.includes('⬆️')) ||
        ((prevState.newMessage.includes('⬆️') && !this.state.newMessage.includes('⬆️')) && !this.state.newMessage.includes('⬅'))) {
          this.props.clearReference()
    }
    if (!prevProps.referToEl && this.props.referToEl && this.props.referToEl.elementType === 'chat_message') {
      let updatedMessage = this.state.newMessage;
      let newMessage = updatedMessage.replace('⬅', '⬆️')
      this.setState({newMessage,})
    }

  }

  changeHandler = event => {
    this.setState({
      newMessage: event.target.value,
      // isConnected: socket.connected,
    })
  }

  submitMessage = () => {
    const { roomId, user } = this.props;
    if (!user.connected) {
      return alert('you have disconnected from the server. Check your internet connect and try refreshing the page')
    }
    if (this.state.newMessage.length === 0) return;
    const newMessage = {
      text: this.state.newMessage,
      user: {_id: user._id, username: user.username},
      room: roomId,
      timestamp: new Date().getTime()
    }
    if (this.props.referencing) {
      newMessage.reference = {...this.props.referToEl}
      newMessage.tab = this.props.currentTab
      this.props.clearReference()
    }
    socket.emit('SEND_MESSAGE', newMessage, (res, err) => {
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
      <ChatLayout
        messages={this.props.messages}
        change={this.changeHandler}
        submit={this.submitMessage}
        value={this.state.newMessage}
        referencing={this.props.referencing}
        referToEl={this.props.referToEl}
        referToCoords={this.props.referToCoords}
        referFromEl={this.props.referFromEl}
        referFromCoords={this.props.referFromCoords}
        setToElAndCoords={this.props.setToElAndCoords}
        setFromElAndCoords={this.props.setFromElAndCoords}
        showingReference={this.props.showingReference}
        clearReference={this.props.clearReference}
        showReference={this.props.showReference}
        isConnected={this.props.user.connected}
        expanded={this.props.expanded}
        toggleExpansion={this.props.toggleExpansion}
      />
    )
  }
}

export default Chat;
