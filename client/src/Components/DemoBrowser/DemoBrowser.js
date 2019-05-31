import React from 'react';
import PropTypes from 'prop-types';
import classes from './demoBrowser.css';

const DemoBrowser = ({ children }) => {
  return (
    <div className={classes.DemoBrowser}>
      <div className={classes.BrowserMenu}>
        <div className={classes.Circles}>
          <div className={[classes.Circle, classes.Red].join(' ')} />
          <div className={[classes.Circle, classes.Yellow].join(' ')} />
          <div className={[classes.Circle, classes.Green].join(' ')} />
        </div>
        <div className={classes.BroswerContent}>{children}</div>
      </div>
    </div>
  );
};

DemoBrowser.propTypes = {
  children: PropTypes.node.isRequired,
};
export default DemoBrowser;
