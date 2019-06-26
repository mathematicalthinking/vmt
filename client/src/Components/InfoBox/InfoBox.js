import React from 'react';
import PropTypes from 'prop-types';
import classes from './InfoBox.css';

const InfoBox = ({ title, children, icon }) => {
  return (
    <div className={classes.Section}>
      <div className={classes.Header}>
        <div className={classes.Icon}>{icon}</div> {title}
      </div>
      <div className={classes.Content}>{children}</div>
    </div>
  );
};

InfoBox.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.element,
  children: PropTypes.element.isRequired,
};

InfoBox.defaultProps = {
  icon: null,
};
export default InfoBox;
