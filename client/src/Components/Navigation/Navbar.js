import React from 'react';
import NavItem from './NavItem/NavItem';
import classes from './navbar.css';
const navbar = (props) => {
  return (
    <nav className={classes.NavContainer}>
      <ul className={classes.NavList}>
        <NavItem link='/users/new' name='Login/Signup' />
        <NavItem link='/courses' name='Courses' />
        <NavItem link='/rooms' name='Rooms' />
        <NavItem link='/dashboard/courses' name='Dashboard' />
        <NavItem link='/rooms/new' name='Community' />
        <NavItem link='/logout' name='Logout' />
      </ul>
    </nav>
  )
}

export default navbar;
