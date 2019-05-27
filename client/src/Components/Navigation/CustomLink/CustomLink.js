import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import classes from './customLink.css';

const CustomLink = ({ to, children }) => {
  return (
    <NavLink to={to} className={classes.Link} activeStyle={{ color: '#999' }}>
      {children}
    </NavLink>
  );
};

CustomLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
export default CustomLink;
