/* eslint-disable prettier/prettier */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Button from 'Components/UI/Button/Button';
import Message from './Message';
import ChatClasses from './chat.css';

/**
 * A simplifield version of Chat, which uses some of the original's CSS.
 * Shows an alert if new messages have appeared off screen.
 */

function SimpleChat({ log, isSimplified }) {
  if (!log) log = [];
  const chatScroll = React.createRef();
  const prevLogLength = React.useRef(0);
  const [showNewMessages, setShowNewMessages] = React.useState(false);
  const [messages, setMessages] = React.useState([]);

  const _scrollToBottom = () => {
    const chat = chatScroll.current;
    chat.scrollTop = chat.scrollHeight;
  };

  const _isNearBottom = () => {
    const chat = chatScroll.current;
    return (
      chat.scrollHeight - Math.floor(chat.scrollTop) - chat.clientHeight - 100 <
      0
    );
  };

  const resetMessages = () => {
    const newMessages = log.map((message) => (
      <Message
        key={message._id}
        message={message}
        id={message._id} // ?? no message._id ??
        onClick={() => {}}
        showReference={() => {}}
        highlighted={false}
        reference={false}
        referencing={false}
        isSimplified={isSimplified}
      />
    ));
    setMessages(newMessages);
  };

  React.useEffect(() => {
    _scrollToBottom();
  }, []);

  React.useEffect(() => {
    if (_isNearBottom() || prevLogLength.current === 0) _scrollToBottom();
    else setShowNewMessages(true);
    if (prevLogLength.current !== log.length) resetMessages();
    prevLogLength.current = log.length;
  }, [log]);

  return (
    <Fragment>
      <div
        className={ChatClasses.ChatScroll}
        data-testid="chat"
        id="scrollable"
        ref={chatScroll}
        onScroll={() => {
          if (_isNearBottom()) setShowNewMessages(false);
        }}
      >
        {!messages.length ? 'No logs for this room' : messages}
        <div className={ChatClasses.Timestamp}>End of message log</div>
      </div>
      {showNewMessages && (
        <Button
          click={() => {
            _scrollToBottom();
            setShowNewMessages(false);
          }}
          theme="xs"
        >
          &#8595; New Messages &#8595;
        </Button>
      )}
    </Fragment>
  );
}

SimpleChat.propTypes = {
  log: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  isSimplified: PropTypes.bool,
};

SimpleChat.defaultProps = {
  isSimplified: true,
};

export default SimpleChat;
