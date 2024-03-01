import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import NavItem from './NavItem/NavItem';
import DropdownNavItem from './DropdownNavItem';
import classes from './navbar.css';
import Avatar from '../UI/Avatar/Avatar';

const Navbar = ({ user, location, toggleAdmin }) => {
  let styles = classes.NavContainer;
  let ntf = false;
  if (user && user.notifications && user.notifications.length > 0) {
    ntf = true;
  }
  if (
    location.pathname.indexOf('community') > -1 ||
    location.pathname.indexOf('dashboard') > -1 ||
    location.pathname.indexOf('archive') > -1 ||
    (location.pathname.indexOf('myVMT') > -1 &&
      location.pathname.indexOf('workspace') === -1 &&
      location.pathname.indexOf('explore') === -1)
  ) {
    styles = classes.Fixed;
  }

  if (
    location.pathname.includes('workspace') &&
    location.pathname.includes('activity')
  ) {
    styles = classes.EditorNavContainer;
  }

  const aboutList = [
    { name: 'About', link: '/about' },
    { name: 'Instructions', link: '/instructions' },
    { name: 'FAQ', link: '/faq' },
    { name: 'Contact', link: '/contact' },
  ];

  const profileList = [{ name: 'Profile', link: '/myVMT/profile' }];

  if (user.loggedIn) {
    profileList.push({ name: 'Logout', link: '/logout' });
  }

  if (user.isAdmin) {
    profileList.splice(1, 0, {
      name: 'Admin Mode',
      sliderDetails: { isOn: user.inAdminMode, onClick: toggleAdmin },
    });
  }
  return (
    <nav className={styles}>
      <div className={classes.LogoContainer}>
        <div className={classes.Logo}>
          {' '}
          <Link to="/">Virtual Math Teams</Link>
        </div>
        <div className={classes.LogoShort}>
          {' '}
          <Link to="/">VMT</Link>
        </div>
      </div>
      <div className={classes.NavListContainer}>
        <ul className={classes.NavList}>
          <NavItem link="/myVMT/rooms" name="My VMT" ntf={ntf} />
          <NavItem
            link="/community/rooms?privacy=all&roomType=all"
            name="Community"
          />
          {user.isAdmin ? (
            <NavItem link="/myVMT/monitor" name="Monitor" />
          ) : null}
          {user.isAdmin ? (
            <NavItem link="/myVMT/dashboard/rooms" name="Dashboard" />
          ) : null}
          {user.loggedIn ? (
            <NavItem link="/archive/rooms?roomType=all" name="Archive" />
          ) : null}
          <DropdownNavItem name={<span>Info</span>} list={aboutList} />

          {user.loggedIn ? (
            <DropdownNavItem
              data-testid="avatar"
              name={
                <Avatar
                  username={user ? user.username : ''}
                  color={user.inAdminMode ? '#ffd549' : '#2d91f2'}
                />
              }
              list={profileList}
            />
          ) : null}
        </ul>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  user: PropTypes.shape({
    accountType: PropTypes.string,
    isAdmin: PropTypes.bool,
    inAdminMode: PropTypes.bool,
    loggedIn: PropTypes.bool,
    notifications: PropTypes.arrayOf(PropTypes.shape({})),
    username: PropTypes.string,
  }),
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
    key: PropTypes.string,
    hash: PropTypes.string,
  }).isRequired,
  toggleAdmin: PropTypes.func.isRequired,
};
Navbar.defaultProps = {
  user: null,
};
export default withRouter(Navbar);
