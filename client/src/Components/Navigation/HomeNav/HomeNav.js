import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import NavItem from '../NavItem/NavItem';
import Avatar from '../../UI/Avatar/Avatar';
import DropdownNavItem from '../DropdownNavItem';
import Aux from '../../HOC/Auxil';
import classes from './homeNav.css';

const Navbar = ({ page, user, loggedIn, scrollPosition }) => {
  let styles = classes.Nav;
  if (page === '/about') {
    styles = classes.FixedGradientNav;
  } else if (
    (scrollPosition > 0.3 && page === '/') ||
    (page !== '/' &&
      page !== '/signup' &&
      page !== '/login' &&
      page !== '/confirmation')
  ) {
    styles = classes.LightNav;
  }
  if (page.indexOf('explore') > -1) {
    styles = classes.TempWorkspaceNav;
  }
  let ntf = false;
  if (user && user.notifications && user.notifications.length > 0) {
    ntf = true;
  }

  return (
    <nav className={styles}>
      <div className={classes.NavContainer}>
        <div className={classes.LogoContainer}>
          <div className={classes.Logo}>
            <Link to="/">Virtual Math Teams</Link>
          </div>
          <div className={classes.LogoShort}>
            {' '}
            <Link to="/">VMT</Link>
          </div>
        </div>
        <div className={classes.NavListContainer}>
          <ul className={classes.NavList}>
            {loggedIn ? (
              <NavItem link="/myVMT/rooms" name="My VMT" ntf={ntf} />
            ) : (
              <Aux>
                <NavItem link="/login" name="Login" />
                <NavItem link="/signup" name="Signup" />
              </Aux>
            )}
            <NavItem link="/community/rooms" name="Community" />
            <NavItem link="/about" name="About" />
            <NavItem link="/tutorials" name="Tutorials" />
            {loggedIn ? (
              <DropdownNavItem
                name={<Avatar username={user.username} />}
                list={[
                  { name: 'Profile', link: '/myVMT/profile' },
                  { name: 'Logout', link: '/logout' },
                ]}
              />
            ) : null}
          </ul>
        </div>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  page: PropTypes.string.isRequired,
  loggedIn: PropTypes.bool.isRequired,
  scrollPosition: PropTypes.number,
  user: PropTypes.shape({}),
};

Navbar.defaultProps = {
  user: null,
  scrollPosition: null,
};

const mapStateToProps = store => ({
  loggedIn: store.user.loggedIn,
});

export default connect(
  mapStateToProps,
  null
)(Navbar);
