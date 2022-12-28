import React from 'react';
import PropTypes from 'prop-types';
import classes from './InfoBox.css';

const InfoBox = ({ title, children, icon, rightIcons, rightTitle }) => {
  return (
    <div className={classes.Section}>
      <div className={classes.Header}>
        <div className={classes.Left}>
          <div className={classes.Icon}>{icon}</div> {title}
        </div>
        <div className={classes.Right}>{rightIcons}</div>
        <div className={`${classes.Right} ${classes.RightTitle}`}>
          {rightTitle}
        </div>
      </div>
      <div className={classes.Content}>{children}</div>
    </div>
  );
};

InfoBox.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.element,
  rightIcons: PropTypes.element,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.number,
    PropTypes.node,
  ]).isRequired,
  rightTitle: PropTypes.string,
};

InfoBox.defaultProps = {
  icon: null,
  rightIcons: null,
  rightTitle: null,
};
export default InfoBox;
