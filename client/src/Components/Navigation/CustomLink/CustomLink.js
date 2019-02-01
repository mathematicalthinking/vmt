import React from "react";
import { NavLink } from "react-router-dom";
import classes from "./customLink.css";
const CustomLink = props => {
  return (
    <NavLink
      to={props.to}
      className={classes.Link}
      activeStyle={{ color: "#999" }}
    >
      {props.children}
    </NavLink>
  );
};

export default CustomLink;
