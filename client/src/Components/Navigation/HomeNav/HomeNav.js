import React from 'react';
import { connect } from 'react-redux';
import NavItem from '../NavItem/NavItem';
import { Link } from 'react-router-dom';
import Aux from '../../HOC/Auxil';
import classes from './homeNav.css';
const navbar = (props) => {
  console.log("NAVBAR PROPS: ", props)
  return (
    <nav className={classes.Nav}>
      <div className={classes.NavContainer}>
        <div className={classes.Logo}><Link to='/'>Logo</Link></div>
        <ul className={classes.NavList}>
          {props.loggedIn ? <NavItem link='/myVMT/courses' name='My VMT' /> :
          <Aux>
            <NavItem link='/login' name='Login' />
            <NavItem link='/signup' name='Signup' />
          </Aux>}
          <NavItem link='/about' name='About' />
          <NavItem link='/tutorials' name='Tutorials' />
        </ul>
      </div>
    </nav>
  )
}


const mapStateToProps = (store) => ({
  loggedIn: store.user.loggedIn,
})

export default connect(mapStateToProps, null)(navbar);

