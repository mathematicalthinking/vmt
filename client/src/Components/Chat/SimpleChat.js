/* eslint-disable prettier/prettier */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Message from './Message';
import ChatClasses from './chat.css';

/**
 * A simplifield version of Chat, which uses some of the original's CSS.
 * Shows an alert if new messages have appeared off screen.
 */

function SimpleChat({ log }) {
  const chatScroll = React.createRef();
  const [showModal, setShowModal] = React.useState(false);
  const previousInfo = React.useRef();

  React.useEffect(() => {
    const previous = previousInfo.current;
    previousInfo.current = {
      height: chatScroll.current.scrollHeight,
      top: chatScroll.current.scrollTop,
    };
    const nonScrollToScroll =
      previous &&
      previous.height < chatScroll.current.clientHeight &&
      chatScroll.current.scrollHeight >= chatScroll.current.clientHeight;

    // For some reason, there's some imprecision in the client height,
    // so if we're within 60px of the bottom, we say we are at the bottom.
    const wasAtBottom =
      previous &&
      previous.height -
        Math.floor(previous.top) -
        chatScroll.current.clientHeight -
        60 <
        0;

    // If this is the first time here, or we hadn't been scrollable but now we are, then
    // scroll to the bottom
    if (!previous || nonScrollToScroll || wasAtBottom) {
      chatScroll.current.scrollTop = chatScroll.current.scrollHeight;
      return;
    }

    // do nothing if we don't need to scroll
    if (chatScroll.current.scrollHeight < chatScroll.current.clientHeight)
      return;

    // If we do need to scroll and we weren't at the bottom (i.e., all other cases),
    // show that there's new messages
    setShowModal(true);
  }, [log]);

  return (
    <Fragment>
      <div
        className={ChatClasses.ChatScroll}
        data-testid="chat"
        id="scrollable"
        ref={chatScroll}
        onScroll={() => setShowModal(false)}
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
      <NewMessages show={showModal} />
    </Fragment>
  );
}

/**
 * NewMessages is a small alert for when there are new log messages
 * that the user might not see.
 */
const NewMessages = (props) => {
  const { show } = props;
  return show ? (
    <div
      style={{
        zIndex: 1,
        backgroundColor: 'blue',
        color: 'white',
        fontSize: '9px',
        position: 'relative',
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: 'center',
        borderRadius: '10px',
      }}
    >
      New Messages
    </div>
  ) : null;
};

SimpleChat.propTypes = {
  log: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

SimpleChat.defaultProps = {};

NewMessages.propTypes = {
  show: PropTypes.bool.isRequired,
};

export default SimpleChat;
