/* eslint-disable prettier/prettier */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Message from './Message';
import ChatClasses from './chat.css';
import { Button } from '..';

/**
 * A simplifield version of Chat, which uses some of the original's CSS.
 * Shows an alert if new messages have appeared off screen.
 */

function SimpleChat({ log }) {
  const chatScroll = React.createRef();
  const [showNewMessages, setShowNewMessages] = React.useState(false);

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

  React.useEffect(() => {
    _scrollToBottom();
  }, []);

  React.useEffect(() => {
    if (_isNearBottom()) _scrollToBottom();
    else setShowNewMessages(true);
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
        {!log.length
          ? 'No logs for this room'
          : log.map((message) => {
              return (
                <Message
                  key={message._id}
                  message={message}
                  id={message._id} // ?? no message._id ??
                  onClick={() => {}}
                  showReference={() => {}}
                  highlighted={false}
                  reference={false}
                  referencing={false}
                />
              );
            })}
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
};

SimpleChat.defaultProps = {};

export default SimpleChat;
