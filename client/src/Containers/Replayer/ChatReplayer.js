// Should we store chat data in this component's state or in the
// redux store?
import React, { Component } from 'react';
import ChatLayout from '../../Components/Chat/Chat';
class Chat extends Component {
  state = {
    messages: [],
  }

  componentDidUpdate(prevProps) {
    if (this.props.event.text && (prevProps.event._id !== this.props.event._id)) {
      this.setState(prevState => ({messages: [...prevState.messages, this.props.event]}))
    }
  }

  render() {
    return (
      <ChatLayout messages={this.state.messages} replayer/>
    )
  }
}

export default Chat;
