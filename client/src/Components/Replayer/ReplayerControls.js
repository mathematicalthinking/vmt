import React, { Component } from 'react';
import classes from './replayer.css';
import glb from '../../global.css';
import Aux from '../HOC/Auxil';
class Replayer  extends Component {

  state = {
    progress: 0
  }

  componentDidMount() {
    const movingMarker = setInterval(() => {
      let updatedProgress = this.state.progress
      updatedProgress += 25
      this.setState({progress: updatedProgress});
    }, 25)
    if (!this.props.playing) clearInterval(movingMarker)
  }
  render () {
    const {playing,
    event,
    startTime,
    endTime,
    displayDuration,
    pausePlay,
    goToIndex,
    blocks,} = this.props

    console.log("duration: ", displayDuration)
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
    const disableBack = (event.timeStamp === startTime);
    const disableForward = (event.timeStamp === endTime);
    console.log(this.state.progress)
    return (
      <div className={classes.Container}>
        <div className={classes.Log}>

        </div>

        <div className={classes.ProgressBar}>
          <div className={classes.Time} style={{marginRight: 3}}>{startTime}</div>
          <div className={classes.Slider}>
            {progressBar}
            <div className={classes.ProgressMarker} style={{left: `${(this.state.progress/displayDuration) * 100}%`}}></div>
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
