import React, { PureComponent } from 'react';
import classes from './replayer.css';
import glb from '../../global.css';
// import ProgressMarker from './ProgressMarker';
import styled, { keyframes, css } from 'react-emotion';
import Aux from '../HOC/Auxil';


class Replayer extends PureComponent{

  // componentShouldUpdate(nextProps){
  //   // if (nextProps.playing !== this.props.playing) {
  //   //   console.log('updating')
  //   //   return true;
  //   // } else { return false}
  //   return false
  // }

  componentDidUpdate(prevProps) {
    console.log('componentDidUpdate')
    if (prevProps.playing !== this.props.playing && this.props.playing) {
      console.log('started playing')
    }
  }

  render () {
    console.log('rendering')
    const {
      playing,
      event,
      startTime,
      endTime,
      displayDuration,
      pausePlay,
      goToIndex,
      blocks,
    } = this.props;
    const progressAnimation = keyframes`
    0% {left: 0%}
    100% {left: 100%}
    `
    const ProgressMarker = styled('div')`
      border: 3px solid #2f91f2;
      position: absolute;
      border-radius: 15px;
      height: 12px;
      width: 12px;
      animation: ${ playing ? `${progressAnimation} linear ${displayDuration /1000}s`: null};
      border-radius: 50%;
    `
    const index = 0;
    let borderRadius;
    const progressBar = blocks.map((block, i) => {
      if (i === 0) borderRadius = '7px 0 0 7px';
      else if (i === blocks.length - 1) borderRadius = '0 7px 7px 0';
      else borderRadius = 'none';
      return (
        <Aux>
          <div className={classes.Active} style={{width: `${ (block.duration/displayDuration) * 100 }%`, borderRadius: borderRadius}}></div>
          {i < blocks.length - 1 ? <div className={classes.Break}></div> : null}
        </Aux>
      )
    })
    const pausePlayButton = playing ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i>;
    // const progress = (index / (duration - 1)) * 100
    const disableBack = false;
    // (event.timestamp === startTime);
    const disableForward = false;
    // (event.timestamp === endTime);


    return (
      <div className={classes.Container}>
        <div className={classes.Log}>

        </div>

        <div className={classes.ProgressBar}>
          <div className={classes.Time} style={{marginRight: 3}}>{startTime}</div>
          <div className={classes.Slider}>
            {progressBar}
            <ProgressMarker />
          </div>
          <div className={classes.Time} style={{marginLeft: 3}}>{endTime}</div>
        </div>
        <div className={[classes.Controls, glb.FlexRow].join(' ')}>
          <button disabled={disableBack} onClick={() => goToIndex(0)} className={classes.Button}><i className="fas fa-fast-backward"></i></button>
          <button disabled={disableBack} onClick={() => goToIndex(index - 1)} className={classes.Button}><i className="fas fa-backward"></i></button>
          <button onClick={pausePlay} className={classes.Button}>{pausePlayButton}</button>
          <button disabled={disableForward} onClick={() => goToIndex(index + 1)} className={classes.Button}><i className="fas fa-forward"></i></button>
          <button disabled={disableForward} onClick={() => goToIndex(0)} className={classes.Button}><i className="fas fa-fast-forward"></i></button>
        </div>
      </div>
    )
  }

}
export default Replayer;
