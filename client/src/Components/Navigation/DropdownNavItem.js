import React from 'react';
import PropTypes from 'prop-types';
import classes from './dropdownNavItem.css';
import NavItem from './NavItem/NavItem';

const DropdownNavItem = (props) => {
  const { name, list } = props;
  return (
    // eslint-disable-next-line react/destructuring-assignment
    <li className={classes.Container} data-testid={props['data-testid']}>
      <NavItem link={list[0].link} name={name} />
      <div className={classes.DropdownContent}>
        {list.map((item) => {
          return (
            <div className={classes.DropdownItem} key={item.name}>
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

DropdownNavItem.propTypes = {
  name: PropTypes.element.isRequired,
  list: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  'data-testid': PropTypes.string,
};

DropdownNavItem.defaultProps = {
  'data-testid': 'dropdownNavItem',
};

export default DropdownNavItem;
