import React from 'react';
import NavItem from './NavItem/NavItem';
import classes from './navbar.css';
const navbar = (props) => {
  return (
    <nav className={classes.NavContainer}>
      <ul className={classes.NavList}>
        <NavItem link='/users/new' name='Login/Signup' />
        <NavItem link='/publicList/courses' name='Courses' />
        <NavItem link='/publicList/rooms' name='Rooms' />
        <NavItem link='/profile/courses' name='Profile' />
        <NavItem link='/rooms/new' name='Community' />
        <NavItem link='/logout' name='Logout' />
      </ul>
    </nav>
  )
}

export default navbar;
