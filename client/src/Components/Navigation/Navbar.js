import React from "react";
import NavItem from "./NavItem/NavItem";
import classes from "./navbar.css";
import { Link, withRouter } from "react-router-dom";
const navbar = props => {
  console.log("nav props: ", props);
  let styles = classes.NavContainer;
  if (props.location.pathname.indexOf("workspace") > -1) {
    styles = classes.WorkspaceNav;
  }
  return (
    <nav className={styles}>
      <div className={classes.LogoContainer}>
        <div className={classes.Logo}>
          {" "}
          <Link to="/">Virtual Math Teams</Link>
        </div>
        <div className={classes.LogoShort}>
          {" "}
          <Link to="/">VMT</Link>
        </div>
      </div>
      <div className={classes.NavListContainer}>
        <ul className={classes.NavList}>
          <NavItem link="/myVMT/courses" name="My VMT" />
          <NavItem link="/community/activities" name="Community" />
          {/* <NavItem link='/profile' name='Profile' /> */}
          <NavItem link="/logout" name="Logout" />
        </ul>
      </div>
    </nav>
  );
};

export default withRouter(navbar);
