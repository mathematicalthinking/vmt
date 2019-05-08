import React from 'react';
import classes from './dropdownNavItem.css';
import NavItem from './NavItem/NavItem';
import { Link } from 'react-router-dom';
export default props => {
  return (
    <li className={classes.Container}>
      <div className={classes.Header}>{props.name}</div>
      <div className={classes.DropdownContent}>
        {props.list.map(item => {
          return (
            <div className={classes.DropdownItem}>
              <NavItem
                // className={classes.DropdownItem}
                link={item.link}
                name={item.name}
              />
            </div>
          );
        })}
      </div>
    </li>
  );
};
