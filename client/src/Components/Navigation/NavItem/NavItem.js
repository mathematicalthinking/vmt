import React from 'react';
import PropTypes from 'prop-types';
// import classes from './navItem.css';
import { NavLink } from 'react-router-dom';
import Notification from '../../Notification/Notification';
import classes from './navItem.css';

const NavItem = ({ name, link, ntf }) => {
  let style = classes.Item;
  if (
    typeof name === 'string' &&
    window.location.href.toLowerCase().indexOf(
      name
        .toLowerCase()
        .split(' ')
        .join('')
    ) > -1
  ) {
    style = classes.ActiveLink;
  }
  return (
    <div className={style}>
      <NavLink data-testid={`nav-${name}`} className={classes.link} to={link}>
        {name}
      </NavLink>
      {ntf ? <Notification size="small" /> : null}
    </div>
  );
};

NavItem.propTypes = {
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  link: PropTypes.string.isRequired,
  ntf: PropTypes.bool,
};

NavItem.defaultProps = {
  ntf: false,
};
export default NavItem;
