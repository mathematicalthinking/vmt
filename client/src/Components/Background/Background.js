import React from 'react';
import Aux from '../HOC/Auxil';
import classes from './background.css';
const Background = (props) => {
  return (
    <Aux>
      <div className={classes.backgroundGraph}></div>
      <div className={[classes.waveWrapper, classes.waveAnimation].join(" ")}>
          <div className={[classes.waveWrapperInner, classes.bgTop].join(" ")}>
              <div className={[classes.wave, classes.waveTop].join()}></div>
          </div>
          <div className={[classes.waveWrapperInner, classes.bgMiddle].join(" ")}>
              <div className={[classes.wave, classes.waveMiddle].join(" ")}></div>
          </div>
          <div className={[classes.waveWrapperInner, classes.bgBottom].join(" ")}>
              <div className={[classes.wave, classes.waveBottom].join(" ")}></div>
          </div>
      </div>   
    </Aux>

  )
}

export default Background;