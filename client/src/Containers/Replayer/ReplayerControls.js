import React, { Component } from 'react';
import classes from './replayerControls.css';
import glb from '../../global.css';
// import ProgressMarker from './ProgressMarker';
import Clock from './Clock/Clock';
import Slider from '../../Components/Replayer/Slider/Slider';
import Log from './Log/Log';

class ReplayerControls extends Component{


  componentDidUpdate(prevProps) {
    if (prevProps.playing !== this.props.playing) {
      if (this.props.playing) {
      }
    }
    if (prevProps.startTime !== this.props.startTime) {
      this.originalStartTime = this.props.startTime;
    }
  }

  getProgress = (progress) => {
    this.setState({progress,})
  }

  next = () => {
    const {log, index, duration, goToTime} = this.props;
    const percent = log[index + 1].relTime/duration;
    goToTime(percent)
  }

  back = () => {
    const {log, index, duration, goToTime} = this.props;
    const percent = log[index - 1].relTime/duration;
    goToTime(percent)
  }
  // THIS SEEMS UNNECESSARY BUT IF WE DO THIS IN RENDER IT REDFINES THE FUNCTION EACH RENDER
  first = () => {
    this.props.goToTime(0)
  }

  last = () => {
    this.props.goToTime(1)
  }

  render () {
    const {
      playing,
      startTime,
      duration, //ms
      pausePlay,
      relTime,
      endTime,
      log,
      index,
      goToIndex,
      goToTime,
      absTimeElapsed,
      speed,
      setSpeed,
    } = this.props;
    const pausePlayButton = playing ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i>;
    const progress = relTime/duration * 100; // %
    return (
      <div className={classes.Container}>
        <div className={classes.Log}>
          <Log log={log} currentIndex={index} progress={progress} goToIndex={(index) => goToIndex(index)}/>
        </div>
        <div className={classes.ProgressBar}>
          <div className={classes.Time} style={{marginRight: 3}}>{this.originalStartTime || startTime}</div>
          <Slider progress={progress} log={log} duration={duration} playing={playing} goToTime={(percent) => goToTime(percent)}/>
          <div className={classes.Time} style={{marginLeft: 3}}>{endTime}</div>
        </div>
        <Clock startTime={startTime} playing={playing} duration={duration} relTime={relTime} absTimeElapsed={absTimeElapsed}/>
        <div className={[classes.Controls, glb.FlexRow].join(' ')}>
          <button disabled={index === 0} onClick={this.first} className={classes.Button}><i className="fas fa-fast-backward"></i></button>
          <button disabled={index === 0} onClick={this.back} className={[classes.Button, classes.SideButton].join(" ")}><i className="fas fa-backward"></i></button>
          <button className={[classes.Button, classes.CenterButton].join(" ")} onClick={pausePlay}>{pausePlayButton}</button>
          <button disabled={index === log.length - 1} onClick={this.next} className={[classes.Button, classes.SideButton].join(" ")}><i className="fas fa-forward"></i></button>
          <button disabled={index === log.length - 1} onClick={this.last} className={classes.Button}><i className="fas fa-fast-forward"></i></button>
        </div>
        <div className={classes.Settings}>
          <button className={(speed === 1) ? classes.Active : classes.Inactive} onClick={() => setSpeed(1)}>1x</button>
          <button className={(speed === 2) ? classes.Active : classes.Inactive} onClick={() => setSpeed(2)}>2x</button>
          <button className={(speed === 5) ? classes.Active : classes.Inactive} onClick={() => setSpeed(5)}>5x</button>
          <button className={(speed === 10) ? classes.Active : classes.Inactive} onClick={() => setSpeed(10)}>10x</button>
        </div>
      </div>
    )
  }

}
export default ReplayerControls;
