// Should we store chat data in this component's state or in the
// redux store?
import React, { PureComponent } from 'react';
import ChatLayout from '../../Components/Chat/Chat';
class Chat extends PureComponent {
  state = {
    messages: [],
  }

  componentDidMount(){
    console.log("props in cheat: ", this.props)
    if (this.props.event.text) {
      this.setState({messages: [this.props.event]})

    }
  }

  componentDidUpdate(prevProps) {
    console.log('chat updating')
    console.log(this.props)
    if (!prevProps.skipping && this.props.skipping) {
      let messages = [];
      this.props.log.some((entry, i) => {
        if (i <= this.props.index) {
          messages.push(entry)
          return false;
        } return true;
      })
      console.log(messages)
      this.props.reset();
      this.setState({messages,})
    }
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
