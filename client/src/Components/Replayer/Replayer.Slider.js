import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import styled, { keyframes } from 'react-emotion';
import classes from './Replayer.Styles.css'
import Aux from '../HOC/Auxil';


class Slider extends PureComponent {

  state = {
    position: 0
  }

  componentDidMount(){
    this.progressAnimation = keyframes`
    0% {left: 0%}
    100% {left: 100%}
    `

  }

  shouldComponentUpdate(nextProps){
    if (nextProps.playing !== this.props.playing) {
      return true;
    }
    else return false;
  }

  componentDidUpdate(prevProps){
    // PAUSE
    if (prevProps.playing && !this.props.playing) {
      this.progressAnimation = keyframes`
      0% {left: ${this.props.progress}%}
      100% {left: 100%}
      `
    }
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
      animation: ${this.progressAnimation} linear ${displayDuration /1000}s;
      animation-play-state: ${playing ? 'running' : 'paused'};
      border-radius: 50%;
    `
    return (
      <div className={classes.Slider}>
        {progressBar}
        <ProgressMarker ref="marker" onCLick={() => console.log('clicked the marker')} />
      </div>
    )
  }
}

export default Slider;
