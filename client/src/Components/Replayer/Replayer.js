import React, { Component } from 'react';
import classes from './Replayer.Styles.css';
import glb from '../../global.css';
// import ProgressMarker from './ProgressMarker';
import Clock from './Replayer.Clock';
import Slider from './Replayer.Slider';
import Log from './Log/Log';

class Replayer extends Component{
  componentDidMount(){

  }
  componentDidUpdate(prevProps) {
    if (prevProps.playing !== this.props.playing) {
      if (this.props.playing) {
      }
    }
  }

  getProgress = (progress) => {
    this.setState({progress,})
  }

  render () {
    const {
      playing,
      event,
      startTime,
      endTime,
      displayDuration, //ms
      pausePlay,
      relTime,
      log,
      index,
      goToIndex,
      goToTime,
      blocks,
    } = this.props;
    const pausePlayButton = playing ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i>;
    // const progress = (index / (duration - 1)) * 100
    const disableBack = false;
    // (event.timestamp === startTime);
    const disableForward = false;
    // (event.timestamp === endTime);
    const progress = relTime/displayDuration * 100; // %

    return (
      <div className={classes.Container}>
        <Log log={log} currentIndex={index} progress={progress} goToIndex={(index) => goToIndex(index)}/>
        <div className={classes.ProgressBar}>
          <div className={classes.Time} style={{marginRight: 3}}>{startTime}</div>
          <Slider progress={progress} blocks={blocks} displayDuration={displayDuration} playing={playing} goToTime={(percent) => goToTime(percent)}/>
          <div className={classes.Time} style={{marginLeft: 3}}>{endTime}</div>
        </div>
        <Clock startTime={startTime} playing={playing} duration={displayDuration} relTime={relTime} />
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
