/* eslint-disable react/no-did-update-set-state */
// Should we store chat data in this component's state or in the
// redux store?
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import findLast from 'lodash/findLast';
import moment from 'moment';
import socket from '../../utils/sockets';
import mongoIdGenerator from '../../utils/createMongoId';
import { Chat as ChatLayout } from '../../Components';

class Chat extends Component {
  state = {
    newMessage: '',
  };

  chatInput = React.createRef();

  componentDidMount() {
    const { addToLog, replaying } = this.props;
    // event handler for enter key presses
    document.addEventListener('keydown', (event) => {
      const { newMessage } = this.state;

      if (event.key === 'Enter') {
        // handle differenct contexts of Enter clicks
        const isChatInputInFocus =
          this.chatInput.current === document.activeElement;
        if (isChatInputInFocus && newMessage.length > 0) {
          this.submitMessage();
        }
      }
    });
    if (!replaying) {
      socket.removeAllListeners('RECEIVE_MESSAGE');
      socket.on('RECEIVE_MESSAGE', (data) => {
        console.log('Received message ', data);
        addToLog(data);
        // this.scrollToBottom()
      });
    }
  }

  changeHandler = (event) => {
    this.setState({
      newMessage: event.target.value,
    });
  };

  submitMessage = () => {
    const {
      referToEl,
      referencing,
      currentTabId,
      clearReference,
      addToLog,
      roomId,
      user,
      myColor,
      log,
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

    if (referencing && referToEl) {
      messageData.reference = {
        ...referToEl,
        tab: currentTabId,
      };

      let refDescription = `${user.username} referenced`;

      if (referToEl.elementType === 'chat_message') {
        const msg = findLast(log, (event) => {
          return event._id === referToEl.element;
        });
        if (msg) {
          const oneWeekAgo = moment().subtract(7, 'days');
          const oneYearAgo = moment().subtract(1, 'year');
          const momentTimestamp = moment.unix(msg.timestamp / 1000);

          let format = 'ddd h:mm:ss a';
          if (momentTimestamp.isBefore(oneYearAgo)) {
            format = 'MMMM Do YYYY, h:mm:ss a';
          } else if (momentTimestamp.isBefore(oneWeekAgo)) {
            format = 'MMMM Do, h:mm:ss a';
          }
          refDescription += ` the chat message created by ${
            msg.user.username
          } on ${momentTimestamp.format(format)}`;
        } else {
          refDescription += ' a chat message';
        }
      } else {
        refDescription += ` ${referToEl.elementType} ${referToEl.element}`;
      }
      messageData.description = refDescription;

      // per annie's request, referencing should stay on after submitting msg
      clearReference({
        doKeepReferencingOn: true,
        // refBeingSaved: messageData.reference, // so we don't clear the reference before it has a chance to be saved
      });
    }

    socket.emit('SEND_MESSAGE', messageData, (res, err) => {
      if (err) {
        console.log(err);
        return;
      }
      // console.log('Sending Message: ', messageData);
      addToLog(messageData);
    });
    delete newMessage.room;
    // this.scrollToBottom(); @TODO
    this.setState(
      {
        newMessage: '',
      },
      () => {
        if (this.chatInput.current) {
          this.chatInput.current.focus();
        }
      }
    );
  };

  render() {
    const { newMessage } = this.state;
    return (
      <ChatLayout
        change={this.changeHandler}
        submit={this.submitMessage}
        value={newMessage}
        chatInput={this.chatInput}
        {...this.props}
      />
    );
  }
}

Chat.propTypes = {
  referencing: PropTypes.bool.isRequired,
  referToEl: PropTypes.oneOfType([PropTypes.shape({}), PropTypes.string]),
  addToLog: PropTypes.func.isRequired,
  replaying: PropTypes.bool,
  roomId: PropTypes.string.isRequired,
  currentTabId: PropTypes.string.isRequired,
};

Chat.defaultProps = {
  referToEl: null,
  replaying: false,
};

export default Chat;
