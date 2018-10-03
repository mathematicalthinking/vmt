import React from 'react';
import NavItem from '../NavItem/NavItem';
import classes from './homeNav.css';
const navbar = (props) => {
  return (
    <nav className={classes.NavContainer}>
      <div className={classes.Logo}>Logo</div>
      <ul className={classes.NavList}>
        <NavItem link='/Login' name='Login' />
        <NavItem link='/Signup' name='Signup' />
        <NavItem link='/About' name='About' />
        <NavItem link='/Tutorials' name='Tutorials' />
      </ul>
    </nav>
  )
}

export default navbar;
