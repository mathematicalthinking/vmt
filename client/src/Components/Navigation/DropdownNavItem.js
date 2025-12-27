import React from 'react';
import PropTypes from 'prop-types';
import classes from './dropdownNavItem.css';
import NavItem from './NavItem/NavItem';

const DropdownNavItem = (props) => {
  const {
    name,
    list,
    mr = 0,
    'data-testid': dataTestId = 'dropdownNavItem',
  } = props;
  let marginStyle = {};
  if (mr) {
    marginStyle = {
      marginRight: `${mr}px`,
    };
  }
  return (
    <li
      className={classes.Container}
      data-testid={dataTestId}
      style={marginStyle}
    >
      <NavItem link={list[0].link} name={name} />
      <div className={classes.DropdownContent}>
        {list.map((item) => {
          return (
            <div className={classes.DropdownItem} key={item.name}>
              <NavItem
                link={item.link}
                name={item.name}
                sliderDetails={item.sliderDetails}
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
  'data-testid': PropTypes.string,
  mr: PropTypes.number,
};

export default DropdownNavItem;
