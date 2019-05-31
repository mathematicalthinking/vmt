/* eslint-disable react/no-did-update-set-state */
// Should we store chat data in this component's state or in the
// redux store?
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import socket from '../../utils/sockets';
import mongoIdGenerator from '../../utils/createMongoId';
import { Chat as ChatLayout } from '../../Components';

class Chat extends Component {
  state = {
    newMessage: '',
  };

  componentDidMount() {
    const { addToLog, replaying, roomId } = this.props;
    const { newMessage } = this.state;
    // event handler for enter key presses
    document.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        // handle differenct contexts of Enter clicks
        if (newMessage.length > 0) {
          this.submitMessage();
          //  @TODO we need to check if the chat enry is in focuse with a ref()
        }
      }
    });
    if (!replaying) {
      socket.removeAllListeners('RECEIVE_MESSAGE');
      socket.on('RECEIVE_MESSAGE', data => {
        addToLog(roomId, data);
        // this.scrollToBottom()
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { referencing, referToEl, clearReference } = this.props;
    const { newMessage } = this.state;
    if (!prevProps.referencing && referencing) {
      this.setState(currentState => ({
        newMessage: `⬅️ ${currentState.newMessage}`,
      }));
    } else if (prevProps.referencing && !referencing) {
      this.setState(currentState => ({
        newMessage: currentState.newMessage.replace(/⬅/g, ''),
      }));
    }
    if (
      (prevState.newMessage.includes('⬅') &&
        !newMessage.includes('⬅️') &&
        !newMessage.includes('⬆️')) ||
      (prevState.newMessage.includes('⬆️') &&
        !newMessage.includes('⬆️') &&
        !newMessage.includes('⬅'))
    ) {
      clearReference();
    }
    if (
      !prevProps.referToEl &&
      referToEl &&
      referToEl.elementType === 'chat_message'
    ) {
      this.setState(currentState => ({
        newMessage: currentState.replace('⬅', '⬆️'),
      }));
    }
  }

  changeHandler = event => {
    this.setState({
      newMessage: event.target.value,
      // isConnected: socket.connected,
    });
  };

  submitMessage = () => {
    const {
      referToEl,
      referencing,
      currentTab,
      clearReference,
      addToLog,
      roomId,
      user,
      myColor,
    } = this.props;
    const { newMessage } = this.state;
    if (!user.connected) {
      // eslint-disable-next-line no-alert
      window.alert(
        'you have disconnected from the server. Check your internet connect and try refreshing the page'
      );
    }
    if (newMessage.length === 0) return;
    const messageData = {
      _id: mongoIdGenerator(),
      text: newMessage,
      user: { _id: user._id, username: user.username },
      room: roomId,
      color: myColor,
      messageType: 'TEXT',
      timestamp: new Date().getTime(),
    };

    if (referencing) {
      newMessage.reference = {
        ...referToEl,
        tab: currentTab,
      };
      clearReference();
    }
    socket.emit('SEND_MESSAGE', messageData, (res, err) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.log(err);
        return;
        // IF THERES AN ERROR WE NEED TO UNDO THE SETSTATE BELOW
      }
      addToLog(roomId, { ...messageData, _id: res._id });
    });
    delete newMessage.room;
    // this.scrollToBottom(); @TODO
    this.setState({
      newMessage: '',
    });
    // this.props.updateRoom({chat: updatedMessages})
  };

  render() {
    const { newMessage } = this.state;
    return (
      <ChatLayout
        change={this.changeHandler}
        submit={this.submitMessage}
        value={newMessage}
        {...this.props}
      />
    );
  }
}

Chat.propTypes = {
  referencing: PropTypes.bool.isRequired,
  referToEl: PropTypes.shape({}),
  addToLog: PropTypes.func.isRequired,
  replaying: PropTypes.bool,
  roomId: PropTypes.string.isRequired,
};

Chat.defaultProps = {
  referToEl: null,
  replaying: false,
};

export default Chat;
