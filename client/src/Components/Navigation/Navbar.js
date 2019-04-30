import React from 'react';
import NavItem from './NavItem/NavItem';
import DropdownNavItem from './DropdownNavItem';
import classes from './navbar.css';
import Avatar from '../UI/Avatar/Avatar';
import { Link, withRouter } from 'react-router-dom';
const navbar = props => {
  let styles = classes.NavContainer;
  let ntf = false;
  if (props.location.pathname.indexOf('workspace') > -1) {
    styles = classes.WorkspaceNav;
    if (
      props.user &&
      props.user.notifications &&
      props.user.notifications.length > 0
    ) {
      ntf = true;
    }
  } else if (props.fixed) styles = classes.Fixed;

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
          <NavItem link="/community/rooms" name="Community" />
          {/* <NavItem link='/profile' name='Profile' /> */}
          <DropdownNavItem
            name={<Avatar username={props.user.username} />}
            list={[
              { name: 'Profile', link: '/profile' },
              { name: 'Logout', link: '/logout' },
            ]}
          />
        </ul>
      </div>
    </nav>
  );
};

export default withRouter(navbar);
