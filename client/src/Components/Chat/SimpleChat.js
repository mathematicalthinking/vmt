/* eslint-disable prettier/prettier */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Button from 'Components/UI/Button/Button';
import { useUIState } from 'utils';
import Message from './Message';
import ChatClasses from './chat.css';

/**
 * A simplifield version of Chat, which uses some of the original's CSS.
 * Shows an alert if new messages have appeared off screen.
 */
function SimpleChat({ log, isSimplified = true, context }) {
  if (!log) log = [];
  const chatScroll = React.createRef();
  const prevLogLength = React.useRef(0);
  const [showNewMessages, setShowNewMessages] = React.useState(false);
  const [messages, setMessages] = React.useState([]);

  // Save the place that the user has scrolled:
  // - if the user deliberately scrolls to a location that is not near the bottom, store that location
  // - if the user deliberately scrolls to the end of the chat, use a big number (1e9) for the scrollTop so the chat stays scrolled to bottom
  // - if the user clicks on the NEW MESSAGES button, use a big number so the chat stays scrolled to the bottom
  // - if nothing is stored, scroll the chat to the bottom

  const LOCK_TO_BOTTOM = 1e9;
  const [scrollState, setScrollState] = useUIState(context, LOCK_TO_BOTTOM);

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
    setTimeout(() => setMessages(newMessages), 0);
    // setMessages(newMessages);
  };

  React.useEffect(resetMessages, [isSimplified]);

  React.useEffect(() => {
    const wasNearBottom = _isNearBottom() || prevLogLength.current === 0;
    if (prevLogLength.current < log.length) resetMessages();
    prevLogLength.current = log.length;
    if (wasNearBottom) _scrollToBottom();
    else setShowNewMessages(true);
  }, [log]);

  // Whenever we change the displayed messages, make sure we scroll to the saved state, which might be an intermediate value or the large value
  // that locks the chat to the bottom of the messages (LOCK_TO_BOTTOM)
  React.useEffect(() => {
    chatScroll.current.scrollTop = scrollState;
  }, [messages]);

  return (
    <Fragment>
      <div
        className={ChatClasses.ChatScroll}
        data-testid="chat"
        id="scrollable"
        ref={chatScroll}
        onScrollCapture={() => {
          if (_isNearBottom()) {
            setShowNewMessages(false);
            setScrollState(LOCK_TO_BOTTOM);
          } else setScrollState(chatScroll.current.scrollTop);
        }}
      >
        {!messages.length ? 'No logs for this room' : messages}
        <div className={ChatClasses.Timestamp}>End of message log</div>
      </div>
      {showNewMessages && (
        <Button
          click={() => {
            _scrollToBottom();
            setScrollState(LOCK_TO_BOTTOM);
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
  context: PropTypes.string.isRequired,
};

export default SimpleChat;
