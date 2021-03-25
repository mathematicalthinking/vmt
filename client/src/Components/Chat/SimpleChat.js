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

function SimpleChat({ log, title, menu }) {
  const chatScroll = React.createRef();

  React.useEffect(() => {
    chatScroll.current.scrollTop = chatScroll.current.scrollHeight;
  }, []);

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
        >
          {log.map((message) => {
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
  'data-testid': 'dropdownNavItem',
};

export default SimpleChat;
