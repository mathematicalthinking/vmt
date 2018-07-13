import React from 'react';
import NavItem from './NavItem/NavItem';
import classes from './navbar.css';
const navbar = (props) => {
  return (
    <nav className={classes.NavContainer}>
      <ul className={classes.NavList}>
        <NavItem link='/users/new' name='Register' />
        <NavItem link='/rooms' name='Rooms' />
        <NavItem link='/rooms/new' name='New Room' />
        <NavItem link='/courses/' name='Courses' />
        <NavItem link='/courses/new' name='New Course' />
        <NavItem link='/assign' name='Assign' />
        <NavItem link='/logout' name='Logout' />
      </ul>
    </nav>
  )
}

export default navbar;
