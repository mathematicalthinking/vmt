import React from 'react';
// import classes from './navItem.css';
import { Link } from 'react-router-dom';
import Notification from '../../Notification/Notification';
import classes from './navItem.css';
const navItem = props => {
  return (
    <div data-testid={`nav-${props.name}`} className={classes.Item}>
      <Link className={classes.Link} to={props.link}>
        {props.name}
      </Link>
      {props.ntf ? <Notification size={'small'} /> : null}
    </div>
  );
};

export default navItem;
