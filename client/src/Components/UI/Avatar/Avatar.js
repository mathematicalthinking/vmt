import React from "react";
import classes from "./avatar.css";
// import { Link } from 'react-router-dom';
const avatar = props => {
  let fontSize = 15;
  let padding = 7;
  let border = "none";
  if (props.size === "small") fontSize = 10;
  else if (props.size === "medium") fontSize = 25;
  else if (props.size === "large") {
    padding = 28;
    fontSize = 80;
    border = "3px solid white";
  }
  return (
    <div className={classes.UserInfo}>
      {/* <Link to='/#'> eventually a link to their profile page*/}
      <span className={props.size === "large" ? classes.AvatarContainer : null}>
        <i
          className={["fas fa-user", classes.Avatar].join(" ")}
          style={{ fontSize, padding, border }}
        />
      </span>
      <span data-testid="avatar-name" className={classes.Username}>
        {props.username}
      </span>
      {/* </Link> */}
    </div>
  );
};

export default avatar;
