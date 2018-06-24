import React from 'react';
import classes from './navbar.css';
import NavItem from './NavItem/NavItem';
const navbar = (props) => {
  return (
    <div className={classes.Navbar}>
      <NavItem link='/' name='VMT' />
      <NavItem link='/rooms' name='Rooms' />
      <NavItem link='/rooms/new' name='New Room' />
      <NavItem link='/' name='New User' />
      <NavItem link='/' name='Courses' />
      <NavItem link='/' name='New Course' />
      <NavItem link='/' name='Assign' />
      <NavItem link='/' name='Logout' />
    </div>
  )
}

export default navbar;
