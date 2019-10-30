import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import Notification from '../../Notification/Notification';
import classes from './navItem.css';
import Checkbox from '../../Form/Checkbox/Checkbox';

const NavItem = ({ name, link, ntf, sliderDetails }) => {
  let style = classes.Item;
  if (
    typeof name === 'string' &&
    window.location.href.toLowerCase().indexOf(
      name
        .toLowerCase()
        .split(' ')
        .join('')
    ) > -1
  ) {
    style = classes.ActiveLink;
  }

  if (sliderDetails) {
    const { isOn, onClick } = sliderDetails;
    return (
      <div className={style}>
        <Checkbox checked={isOn} change={onClick} dataId={`nav-${name}`}>
          {name}
        </Checkbox>
      </div>
    );
  }
  return (
    <div className={style}>
      <NavLink data-testid={`nav-${name}`} className={classes.link} to={link}>
        {name}
      </NavLink>
      {ntf ? <Notification size="small" /> : null}
    </div>
  );
};

NavItem.propTypes = {
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  link: PropTypes.string.isRequired,
  ntf: PropTypes.bool,
  sliderDetails: PropTypes.shape({
    isOn: PropTypes.bool,
    onClick: PropTypes.func,
  }),
};

NavItem.defaultProps = {
  ntf: false,
  sliderDetails: null,
};
export default NavItem;
