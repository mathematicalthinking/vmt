import React from 'react';
import NavItem from './NavItem/NavItem';
import classes from './navbar.css';
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
          <NavItem link="/logout" name="Logout" />
        </ul>
      </div>
    </nav>
  );
};

export default withRouter(navbar);
