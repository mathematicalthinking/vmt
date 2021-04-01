/* eslint-disable prettier/prettier */
import React, { Fragment } from 'react';
import PropTypes, { string } from 'prop-types';
import Message from './Message';
import ChatClasses from './chat.css';
import DropdownMenuClasses from './dropdownmenu.css';
import NavItem from '../Navigation/NavItem/NavItem';

const DropdownMenu = (props) => {
  const { name, list } = props;
  return (
    <li
      className={DropdownMenuClasses.Container}
      // eslint-disable-next-line react/destructuring-assignment
      data-testid={props['data-testid']}
    >
      <NavItem link={list[0].link} name={name} />
      <div className={DropdownMenuClasses.DropdownContent}>
        {list.map((item) => {
          return (
            <div className={DropdownMenuClasses.DropdownItem} key={item.name}>
              <NavItem link={item.link} name={item.name} />
            </div>
          );
        })}
      </div>
    </li>
  );
};

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

function SimpleChat({ log, title, menu }) {
  const chatScroll = React.createRef();
  const [showModal, setShowModal] = React.useState(false);

  React.useEffect(() => {
    chatScroll.current.scrollTop = chatScroll.current.scrollHeight;
  }, [title]);

  React.useEffect(() => {
    if (chatScroll.current.scrollTop === chatScroll.current.scrollHeight)
      return;
    if (chatScroll.current.scrollHeight < 300) return;
    setShowModal(true);
  }, [log]);

  return (
    <Fragment>
      <div className={ChatClasses.Container}>
        <div
          className={ChatClasses.Title}
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          {title || 'Chat'}
          <DropdownMenu
            list={menu}
            name={<i className="fas fa-ellipsis-v" />}
          />
        </div>

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
      </div>
    </Fragment>
  );
}

// @todo we need to consider making a different component for replayer chat or conditionally requiring many of these props (like change and submit) if this is NOT a replayer chat
SimpleChat.propTypes = {
  log: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  title: PropTypes.string,
  menu: PropTypes.arrayOf(PropTypes.shape({ name: string, link: string }))
    .isRequired,
};

SimpleChat.defaultProps = {
  title: null,
};

DropdownMenu.propTypes = {
  name: PropTypes.element.isRequired,
  list: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  'data-testid': PropTypes.string,
};

DropdownMenu.defaultProps = {
  'data-testid': 'dropdownMenu',
};

NewMessages.propTypes = {
  show: PropTypes.bool.isRequired,
};

export default SimpleChat;
