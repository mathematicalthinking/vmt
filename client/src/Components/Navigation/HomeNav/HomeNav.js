import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import NavItem from '../NavItem/NavItem';
import Avatar from '../../UI/Avatar/Avatar';
import DropdownNavItem from '../DropdownNavItem';
import Aux from '../../HOC/Auxil';
import classes from './homeNav.css';

const Navbar = ({ page, user, loggedIn, isDark, toggleAdmin }) => {
  let styles = classes.Nav;
  if (page === '/about') {
    styles = classes.FixedGradientNav;
  } else if (isDark) {
    styles = classes.LightNav;
  }
  let ntf = false;
  if (user && user.notifications && user.notifications.length > 0) {
    ntf = true;
  }

  const list = [
    { name: 'Profile', link: '/myVMT/profile' },
    { name: 'Logout', link: '/logout' },
  ];

  if (user.isAdmin) {
    list.splice(1, 0, {
      name: 'Admin Mode',
      sliderDetails: { isOn: user.inAdminMode, onClick: toggleAdmin },
    });
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
            <NavItem
              link="/community/rooms?privacy=all&roomType=all"
              name="Community"
            />
            {/* optional monitoring link from home */}
            {/* {user.accountType === 'facilitator' ? (
              <NavItem link="/myVMT/monitoring" name="Monitoring" />
            ) : null} */}
            {user.isAdmin ? (
              <NavItem link="/myVMT/dashboard/rooms" name="Dashboard" />
            ) : null}
            <NavItem link="/about" name="About" />
            {loggedIn ? (
              <DropdownNavItem
                name={
                  <Avatar
                    username={user.username}
                    color={user.inAdminMode ? '#ffd549' : '#2d91f2'}
                  />
                }
                list={list}
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
  toggleAdmin: PropTypes.func.isRequired,
};

Navbar.defaultProps = {
  user: null,
  isDark: false,
};

const mapStateToProps = (store) => ({
  loggedIn: store.user.loggedIn,
});

export default connect(
  mapStateToProps,
  null
)(Navbar);
