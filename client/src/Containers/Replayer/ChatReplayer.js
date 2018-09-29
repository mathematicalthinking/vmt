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
    if (this.props.log[0].text) {
      this.setState({messages: [this.props.log[0]]})

    }
  }

  componentDidUpdate(prevProps) {
    console.log('chat updated')
    const { log, index, reset, skipping } = this.props;
    console.log(log, index)
    if (!prevProps.skipping && skipping) {
      const messages = log.filter((entry, i) => (i <= index && entry.text))
      console.log("'we're skipping ahead and reposting these messages: ", console.log(messages))
      this.setState({messages,})
      reset();
    }
    else if (log[index].text && (prevProps.log[prevProps.index]._id !== log[index]._id)) {
      console.log('playing and appending new chat message: ', log[index])
      this.setState(prevState => ({messages: [...prevState.messages, log[index]]}))
    }
  }

  render() {
    return (
      <ChatLayout messages={this.state.messages} replayer/>
    )
  }
}

export default Chat;
