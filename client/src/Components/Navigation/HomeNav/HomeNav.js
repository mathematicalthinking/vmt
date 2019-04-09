import React from "react";
import { connect } from "react-redux";
import NavItem from "../NavItem/NavItem";
import { Link } from "react-router-dom";
import Aux from "../../HOC/Auxil";
import classes from "./homeNav.css";
const navbar = props => {
  let styles = classes.Nav;
  if (props.page === "/about") {
    styles = classes.FixedGradientNav;
  } else if (props.page.includes("/explore") > 0) {
    styles = classes.GradientNav;
  } else if (
    (props.scrollPosition > 0.3 && props.page === "/") ||
    (props.page !== "/" &&
      props.page !== "/signup" &&
      props.page !== "/login" &&
      props.page !== "/confirmation")
  ) {
    styles = classes.LightNav;
  }
  let ntf = false;
  if (
    props.user &&
    props.user.notifications &&
    props.user.notifications.length > 0
  ) {
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
            {" "}
            <Link to="/">VMT</Link>
          </div>
        </div>
        <div className={classes.NavListContainer}>
          <ul className={classes.NavList}>
            {props.loggedIn ? (
              <NavItem link="/myVMT/courses" name="My VMT" ntf={ntf} />
            ) : (
              <Aux>
                <NavItem link="/login" name="Login" />
                <NavItem link="/signup" name="Signup" />
              </Aux>
            )}
            <NavItem link="/community/activities" name="Community" />
            <NavItem link="/about" name="About" />
            <NavItem link="/tutorials" name="Tutorials" />
            {props.loggedIn ? <NavItem link="/logout" name="Logout" /> : null}
          </ul>
        </div>
      </div>
    </nav>
  );
};

const mapStateToProps = store => ({
  loggedIn: store.user.loggedIn
});

export default connect(
  mapStateToProps,
  null
)(navbar);
