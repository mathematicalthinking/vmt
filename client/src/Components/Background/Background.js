import React from 'react';
import PropTypes from 'prop-types';
import classes from './background.css';

const Background = ({ bottomSpace = null, fixed = false }) => {
  return (
    <div className={fixed ? classes.Container : null}>
      {bottomSpace > 0 || !bottomSpace ? (
        <div
          className={classes.backgroundGraph}
          style={bottomSpace ? { top: `${0.07 * bottomSpace}vh` } : null}
        />
      ) : null}
      <div
        className={[classes.waveWrapper, classes.waveAnimation].join(' ')}
        style={{ bottom: bottomSpace }}
      >
        <div className={[classes.waveWrapperInner, classes.bgTop].join(' ')}>
          <div className={[classes.wave, classes.waveTop].join()} />
        </div>
        <div className={[classes.waveWrapperInner, classes.bgMiddle].join(' ')}>
          <div className={[classes.wave, classes.waveMiddle].join(' ')} />
        </div>
        <div className={[classes.waveWrapperInner, classes.bgBottom].join(' ')}>
          <div className={[classes.wave, classes.waveBottom].join(' ')} />
        </div>
      </div>
    </div>
  );
};

Background.propTypes = {
  bottomSpace: PropTypes.number,
  fixed: PropTypes.bool,
};

Background.defaultProps = {
  bottomSpace: null,
  fixed: false,
};

export default Background;
