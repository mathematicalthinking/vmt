import React from 'react';
import NavItem from './NavItem/NavItem';
import classes from './navbar.css';
const navbar = (props) => {
  return (
    <nav className={classes.NavContainer}>
    <div className={classes.SubContainer}>
      <div className={classes.Logo}>Logo</div>
      <ul className={classes.NavList}>
        <NavItem link='/community/activities' name='Community' />
        <NavItem link='/profile' name='Profile' />
        <NavItem link='/logout' name='Logout' />
      </ul>
    </div>
    </nav>
  )
}

export default navbar;
