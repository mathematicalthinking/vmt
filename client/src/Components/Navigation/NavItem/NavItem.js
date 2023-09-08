import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import Notification from '../../Notification/Notification';
import classes from './navItem.css';
import Checkbox from '../../Form/Checkbox/Checkbox';

const NavItem = ({ name, link, ntf, sliderDetails }) => {
  // Community wasn't underlined because the link changed when clicking on templates or courses. the or below fixes that
  // @TODO: fix this for all of the Info links
  const style =
    window.location.href.includes(link) ||
    (typeof name === 'string' &&
      window.location.href.includes(name.toLowerCase()))
      ? classes.ActiveLink
      : classes.Item;

  const dataName = typeof name === 'string' ? name : 'profile';

  if (sliderDetails) {
    const { isOn, onClick } = sliderDetails;
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
  }),
};

NavItem.defaultProps = {
  ntf: false,
  sliderDetails: null,
  link: null,
};
export default NavItem;
