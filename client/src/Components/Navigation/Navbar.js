import React from 'react';
import classes from './navbar.css';
import NavItem from './NavItem/NavItem';
const navbar = (props) => {
  return (
    <div className={classes.Navbar}>
      <NavItem link='/' name='VMT' />
      <NavItem link='/rooms' name='Rooms' />
      <NavItem link='/rooms/new' name='New Room' />
      <NavItem link='/users/new' name='New User' />
      <NavItem link='/courses/' name='Courses' />
      <NavItem link='/courses/new' name='New Course' />
      <NavItem link='/assign' name='Assign' />
      <button onClick={props.Logout}>Logout</button>
    </div>
  )
}

export default navbar;
