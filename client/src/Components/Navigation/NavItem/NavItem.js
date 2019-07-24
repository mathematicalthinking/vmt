import React from 'react';
import PropTypes from 'prop-types';
// import classes from './navItem.css';
import { Link } from 'react-router-dom';
import Notification from '../../Notification/Notification';
import classes from './navItem.css';

const NavItem = ({ name, link, ntf }) => {
  return (
    <div className={classes.Item}>
      <Link data-testid={`nav-${name}`} className={classes.Link} to={link}>
        {name}
      </Link>
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
