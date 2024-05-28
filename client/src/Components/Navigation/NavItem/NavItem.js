import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import Notification from '../../Notification/Notification';
import classes from './navItem.css';
import Checkbox from '../../Form/Checkbox/Checkbox';

const NavItem = ({ name, link, ntf, sliderDetails, pattern }) => {
  const currentLocation = new URL(window.location.href);
  const linkURL = new URL(link, window.location.href); // in case the link is relative
  const style =
    currentLocation.pathname === linkURL.pathname ||
    window.location.href.includes(pattern)
      ? classes.ActiveLink
      : classes.Item;

  const dataName = typeof name === 'string' ? name : 'profile';

  if (sliderDetails) {
    const { isOn, onClick, customComponent } = sliderDetails;
    if (customComponent) return <div className={style}>{customComponent}</div>;
    return (
      <div className={style}>
        <Checkbox checked={isOn} change={onClick} dataId={`nav-${dataName}`}>
          {name}
        </Checkbox>
      </div>
    );
  }
  return (
    <div className={style}>
      <NavLink
        data-testid={`nav-${dataName}`}
        className={classes.link}
        to={link}
      >
        {name}
      </NavLink>
      {ntf ? <Notification size="small" /> : null}
    </div>
  );
};

NavItem.propTypes = {
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  link: PropTypes.string,
  ntf: PropTypes.bool,
  sliderDetails: PropTypes.shape({
    isOn: PropTypes.bool,
    onClick: PropTypes.func,
    customComponent: PropTypes.element,
  }),
};

NavItem.defaultProps = {
  ntf: false,
  sliderDetails: null,
  link: null,
};
export default NavItem;
