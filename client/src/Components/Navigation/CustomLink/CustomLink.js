import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import classes from './customLink.css';

const CustomLink = ({ to, children }) => {
  const location =
    children.toLowerCase() === 'templates'
      ? 'activities'
      : children.toLowerCase();

  return (
    <NavLink
      exact
      to={to}
      className={classes.Link}
      style={
        window.location.href.indexOf(location) > -1
          ? { borderBottom: '1px solid #2d91f2' }
          : null
      }
      activeStyle={{ borderBottom: '1px solid #2d91f2' }}
    >
      {children}
    </NavLink>
  );
};

CustomLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
export default CustomLink;
