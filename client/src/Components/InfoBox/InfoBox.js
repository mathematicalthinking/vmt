import React from 'react';
import PropTypes from 'prop-types';
import classes from './InfoBox.css';

const InfoBox = ({
  title,
  children,
  icon = null,
  rightIcons = null,
  rightTitle = null,
  customStyle = {},
}) => {
  const classNames = {
    section: 'Section',
    header: 'Header',
    left: 'Left',
    icon: 'Icon',
    right: 'Right',
    rightTitle: 'RightTitle',
  };

  return (
    <div className={classes.Section} style={customStyle.section}>
      <div className={classes.Header} style={customStyle.header}>
        <div className={classes.Left} style={customStyle.left}>
          <div className={classes.Icon} style={customStyle.icon}>
            {icon}
          </div>{' '}
          {title}
        </div>
        <div className={classes.Right} style={customStyle.right}>
          {rightIcons}
        </div>
        {rightTitle && (
          <div
            className={`${classes.Right} ${classes.RightTitle}`}
            style={customStyle.rightTitle}
          >
            {rightTitle}
          </div>
        )}
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
  customStyle: PropTypes.shape({
    section: PropTypes.shape({}),
    header: PropTypes.shape({}),
    left: PropTypes.shape({}),
    icon: PropTypes.shape({}),
    right: PropTypes.shape({}),
    rightTitle: PropTypes.shape({}),
  }),
};

export default InfoBox;
