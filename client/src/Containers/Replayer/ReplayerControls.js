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
    const { playing } = this.props;
    if (prevProps.playing !== playing) {
      // if (playing) {
      // }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.showControls);
    if (this.hideControlsTimer) {
      clearTimeout(this.hideControlsTimer);
    }
  }

  next = () => {
    const { log, index, duration, goToTime, playing } = this.props;
    const percent = log[index + 1].relTime / duration;
    if (playing) {
      goToTime(percent + 0.05, true);
    } else {
      goToTime(percent);
    }
  };

  back = () => {
    const { log, index, duration, goToTime, playing } = this.props;
    const percent = log[index - 1].relTime / duration;
    if (playing) {
      goToTime(percent - 0.05, true);
    } else {
      goToTime(percent);
    }
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
        1750
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
    const backwardButton = playing ? (
      <i className="fas fa-backward" />
    ) : (
      <i className="fas fa-step-backward" />
    );
    const forwardButton = playing ? (
      <i className="fas fa-forward" />
    ) : (
      <i className="fas fa-step-forward" />
    );
    return (
      <div
        className={showControls ? classes.Container : classes.HiddenContainer}
        onMouseEnter={() => this.setState({ mouseOverControls: true })}
        onMouseLeave={() => this.setState({ mouseOverControls: false })}
      >
        <div className={classes.ProgressBar} data-testid="progress-bar">
          {slider}
        </div>
        <div className={classes.Controls}>
          <div className={classes.PlayControls} data-testid="play-controls">
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
              {backwardButton}
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
              {forwardButton}
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
