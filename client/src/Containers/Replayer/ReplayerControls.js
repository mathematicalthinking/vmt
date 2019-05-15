import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './replayerControls.css';
class ReplayerControls extends Component {
  state = {
    mouseOverControls: false,
  };

  componentDidMount() {
    window.addEventListener('mousemove', this.showControls);
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
    window.removeEventListener('mousemove', this.showControls);
    if (this.hideControlsTimer) {
      clearTimeout(this.hideControlsTimer);
    }
  }

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
      playing, //ms
      pausePlay,
      log,
      index,
      settings,
      clock,
      slider,
    } = this.props;
    const pausePlayButton = playing ? (
      <i className="fas fa-pause" />
    ) : (
      <i className="fas fa-play" />
    );
    return (
      <div
        className={
          this.state.showControls ? classes.Container : classes.HiddenContainer
        }
        onMouseEnter={() => this.setState({ mouseOverControls: true })}
        onMouseLeave={() => this.setState({ mouseOverControls: false })}
      >
        <div className={classes.ProgressBar}>{slider}</div>
        <div className={classes.Controls}>
          <div className={classes.PlayControls}>
            <button
              disabled={index === 0}
              onClick={this.first}
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
              onClick={this.last}
              className={classes.Button}
            >
              <i className="fas fa-fast-forward" />
            </button>
            {clock}
          </div>
          {settings}
        </div>
        <div className={classes.Backdrop} />
      </div>
    );
  }
}

ReplayerControls.propTypes = {
  playing: PropTypes.bool.isRequired,
  pausePlay: PropTypes.func.isRequired,
  speed: PropTypes.number.isRequired,
  setSpeed: PropTypes.func.isRequired,
  duration: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  log: PropTypes.arrayOf(PropTypes.object).isRequired,
  goToTime: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  settings: PropTypes.element.isRequired,
  slider: PropTypes.element.isRequired,
  clock: PropTypes.element.isRequired,
};

export default ReplayerControls;
