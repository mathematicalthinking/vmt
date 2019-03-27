import React, { Component } from "react";
import classes from "./replayerControls.css";
import glb from "../../global.css";
// import ProgressMarker from './ProgressMarker';
import Clock from "./Clock/Clock";
import Slider from "./Slider/Slider";
import Log from "./Log/Log";

class ReplayerControls extends Component {
  state = {
    showControls: true,
    mouseOverControls: false
  };

  componentDidMount() {
    window.addEventListener("mousemove", this.showControls);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.playing !== this.props.playing) {
      if (this.props.playing) {
      }
    }
    if (prevProps.startTime !== this.props.startTime) {
      this.originalStartTime = this.props.startTime;
    }
  }

  componentWillUnmount() {
    window.removeEventListener("mousemove", this.showControls);
    if (this.hideControlsTimer) {
      clearTimeout(this.hideControlsTimer);
    }
  }

  getProgress = progress => {
    this.setState({ progress });
  };

  next = () => {
    const { log, index, duration, goToTime } = this.props;
    const percent = log[index + 1].relTime / duration;
    goToTime(percent);
  };

  back = () => {
    const { log, index, duration, goToTime } = this.props;
    const percent = log[index - 1].relTime / duration;
    goToTime(percent);
  };

  first = () => {
    this.props.goToTime(0);
  };

  last = () => {
    this.props.goToTime(1);
  };

  showControls = () => {
    if (this.hideControlsTimer) {
      clearTimeout(this.hideControlsTimer);
    }
    if (!this.state.showControls) {
      this.setState({ showControls: true });
    }
    if (!this.state.mouseOverControls) {
      this.hideControlsTimer = setTimeout(
        () => this.setState({ showControls: false }),
        1500
      );
    }
  };

  render() {
    const {
      playing,
      startTime,
      duration, //ms
      pausePlay,
      relTime,
      endTime,
      log,
      index,
      changingIndex,
      goToIndex,
      goToTime,
      absTimeElapsed,
      speed,
      setSpeed
    } = this.props;
    const pausePlayButton = playing ? (
      <i className="fas fa-pause" />
    ) : (
      <i className="fas fa-play" />
    );

    const progress = (relTime / duration) * 100; // %
    console.log(relTime);
    return (
      <div
        className={
          this.state.showControls ? classes.Container : classes.HiddenContainer
        }
        onMouseEnter={() => this.setState({ mouseOverControls: true })}
        onMouseLeave={() => this.setState({ mouseOverControls: false })}
      >
        <div className={classes.ProgressBar}>
          {/* <div className={classes.Time} style={{ marginRight: 3 }}>
              {this.originalStartTime || startTime}
            </div> */}
          <Slider
            progress={progress}
            log={log}
            duration={duration}
            playing={playing}
            goToTime={percent => goToTime(percent)}
          />
          {/* <div className={classes.Time} style={{ marginLeft: 3 }}>
              {endTime}
            </div> */}
        </div>
        <div className={classes.Controls}>
          <div className={classes.PlayControls}>
            <button
              disabled={index === 0}
              onClick={this.back}
              className={classes.Button}
            >
              <i className="fas fa-fast-backward" />
            </button>
            <button
              disabled={index === 0}
              onClick={this.back}
              className={classes.Button}
            >
              <i className="fas fa-backward" />
            </button>
            <button className={classes.Button} onClick={pausePlay}>
              {pausePlayButton}
            </button>
            <button
              disabled={index === log.length - 1}
              onClick={this.next}
              className={classes.Button}
            >
              <i className="fas fa-forward" />
            </button>
            <button
              disabled={index === log.length - 1}
              onClick={this.next}
              className={classes.Button}
            >
              <i className="fas fa-fast-forward" />
            </button>
          </div>
          <Clock
            startTime={startTime}
            playing={playing}
            duration={duration}
            relTime={relTime}
            changingIndex={changingIndex}
            // absTimeElapsed={absTimeElapsed}
          />
          <div className={classes.Settings}>
            <div className={classes.SpeedSettingsContainer}>
              <div className={classes.SpeedSettings}>
                <button
                  className={speed === 1 ? classes.Active : classes.Inactive}
                  onClick={() => setSpeed(1)}
                >
                  1x
                </button>
                <button
                  className={speed === 2 ? classes.Active : classes.Inactive}
                  onClick={() => setSpeed(2)}
                >
                  2x
                </button>
                <button
                  className={speed === 5 ? classes.Active : classes.Inactive}
                  onClick={() => setSpeed(5)}
                >
                  5x
                </button>
                <button
                  className={speed === 10 ? classes.Active : classes.Inactive}
                  onClick={() => setSpeed(10)}
                >
                  10x
                </button>
                <i className="fas fa-cog" />
              </div>
              <i className="far fa-expand" />
            </div>
          </div>
        </div>
        <div className={classes.Backdrop} />
      </div>
    );
  }
}
export default ReplayerControls;
