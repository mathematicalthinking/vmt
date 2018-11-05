import React from 'react';
import Aux from '../HOC/Auxil';
import classes from './background.css';
const Background = ({bottomSpace}) => {
  return (
    <Aux>
      {bottomSpace > 0 || !bottomSpace ? <div className={classes.backgroundGraph}></div> : null}
      <div className={[classes.waveWrapper, classes.waveAnimation].join(" ")} style={{bottom: bottomSpace}}>
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