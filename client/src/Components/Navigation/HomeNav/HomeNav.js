import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import NavItem from '../NavItem/NavItem';
import Avatar from '../../UI/Avatar/Avatar';
import DropdownNavItem from '../DropdownNavItem';
import Aux from '../../HOC/Auxil';
import classes from './homeNav.css';
import navItemClasses from '../NavItem/navItem.css';

const Navbar = ({ page, user, loggedIn, isDark }) => {
  let styles = classes.Nav;
  if (page === '/about') {
    styles = classes.FixedGradientNav;
  } else if (isDark) {
    styles = classes.LightNav;
  }
  // if (page.indexOf('explore') > -1) {
  //   styles = classes.TempWorkspaceNav;
  // }
  let ntf = false;
  if (user && user.notifications && user.notifications.length > 0) {
    ntf = true;
  }

  const envType = process.env.NODE_ENV;

  let mtLoginUrl;
  if (envType === 'production') {
    mtLoginUrl = process.env.REACT_APP_MT_LOGIN_URL_PRODUCTION;
  } else if (envType === 'staging') {
    mtLoginUrl = process.env.REACT_APP_MT_LOGIN_URL_STAGING;
  } else {
    mtLoginUrl = process.env.REACT_APP_MT_LOGIN_URL_DEV;
  }
  const { origin } = window.location;

  const mtUrlWithRedirect = `${mtLoginUrl}?redirectURL=${origin}`;

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
                <a className={navItemClasses.Item} href={mtUrlWithRedirect}>
                  Login
                </a>
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
  isDark: PropTypes.bool,
  user: PropTypes.shape({}),
};

Navbar.defaultProps = {
  user: null,
  isDark: false,
};

const mapStateToProps = store => ({
  loggedIn: store.user.loggedIn,
});

export default connect(
  mapStateToProps,
  null
)(Navbar);
