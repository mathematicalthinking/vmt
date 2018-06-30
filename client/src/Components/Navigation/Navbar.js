import React from 'react';
import NavItem from './NavItem/NavItem';
const navbar = (props) => {
  return (
    <nav className='navbar navbar-default' htmlrole='navigation'>
      <div className='container-fluid'>
        <div className='navbar-header'>
          <a class='navbar-brand' href='#'>VMT</a>
        </div>
        <ul className='nav navbar-nav'>
          <NavItem link='/rooms' name='Rooms' />
          <NavItem link='/rooms/new' name='New Room' />
          <NavItem link='/users/new' name='New User' />
          <NavItem link='/courses/' name='Courses' />
          <NavItem link='/courses/new' name='New Course' />
          <NavItem link='/assign' name='Assign' />
          <NavItem link='/logout' name='Logout' />
        </ul>
      </div>
    </nav>
  )
}

export default navbar;
