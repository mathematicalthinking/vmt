import React, { PureComponent } from 'react';
import styled, { keyframes } from 'react-emotion';
import classes from './replayer.css'
import Aux from '../HOC/Auxil';
const progressAnimation = keyframes`
0% {left: 0%}
100% {left: 100%}
`

class Slider extends PureComponent {
  componentDidMount() {

  }

  render() {
    const {displayDuration, blocks, playing} = this.props;
    
    let borderRadius;
    const progressBar = blocks.map((block, i) => {
      if (i === 0) borderRadius = '7px 0 0 7px';
      else if (i === blocks.length - 1) borderRadius = '0 7px 7px 0';
      else borderRadius = 'none';
      return (
        <Aux>
          <div className={classes.Active} style={{width: `${ (block.duration/displayDuration) * 100 }%`, borderRadius: borderRadius}}></div>
          {i < blocks.length - 1 ? <div className={classes.Break} style={{width: `${(2000/displayDuration) * 100}%`}}></div> : null}
        </Aux>
      )
    })
    const ProgressMarker = styled('div')`
    border: 3px solid #2f91f2;
    position: absolute;
    border-radius: 15px;
    height: 12px;
    width: 12px;
    animation: ${ playing ? `${progressAnimation} linear ${displayDuration /1000}s`: null};
    border-radius: 50%;
    `
    return (
      <div className={classes.Slider}>
        {progressBar}
        <ProgressMarker />
      </div>
    )
  }
}

export default Slider;
