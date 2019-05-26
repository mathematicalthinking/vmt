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
    const { playing, startTime } = this.props;
    if (prevProps.playing !== playing) {
      // if (playing) {
      // }
    }
    if (prevProps.startTime !== startTime) {
      this.originalStartTime = startTime;
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
    const { goToTime } = this.props;
    goToTime(0);
  };

  last = () => {
    const { goToTime } = this.props;
    goToTime(1);
  };

  showControls = () => {
    const { showControls, mouseOverControls } = this.state;
    if (this.hideControlsTimer) {
      clearTimeout(this.hideControlsTimer);
    }
    if (!showControls) {
      this.setState({ showControls: true });
    }
    if (!mouseOverControls) {
      this.hideControlsTimer = setTimeout(
        () => this.setState({ showControls: false }),
        1500
      );
    }
  };

  render() {
    const {
      playing,
      pausePlay,
      log,
      index,
      settings,
      clock,
      slider,
    } = this.props;
    const { showControls } = this.state;
    const pausePlayButton = playing ? (
      <i className="fas fa-pause" />
    ) : (
      <i className="fas fa-play" />
    );
    return (
      <div
        className={showControls ? classes.Container : classes.HiddenContainer}
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
              type="button"
            >
              <i className="fas fa-fast-backward" />
            </button>
            <button
              disabled={index === 0}
              onClick={this.back}
              className={classes.Button}
              type="button"
            >
              <i className="fas fa-backward" />
            </button>
            <button
              className={classes.Button}
              onClick={pausePlay}
              type="button"
            >
              {pausePlayButton}
            </button>
            <button
              disabled={index === log.length - 1}
              onClick={this.next}
              className={classes.Button}
              type="button"
            >
              <i className="fas fa-forward" />
            </button>
            <button
              disabled={index === log.length - 1}
              onClick={this.last}
              className={classes.Button}
              type="button"
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
  startTime: PropTypes.number.isRequired,
  playing: PropTypes.bool.isRequired,
  pausePlay: PropTypes.func.isRequired,
  duration: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  log: PropTypes.arrayOf(PropTypes.object).isRequired,
  goToTime: PropTypes.func.isRequired,
  settings: PropTypes.element.isRequired,
  slider: PropTypes.element.isRequired,
  clock: PropTypes.element.isRequired,
};

export default ReplayerControls;
