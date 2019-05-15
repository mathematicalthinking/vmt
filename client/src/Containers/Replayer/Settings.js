import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classes from './settings.css';
class Settings extends PureComponent {
  state = {
    currentSetting: 'home',
    showSettings: false,
  };

  componentDidUpdate(prevProps) {
    if (this.props.settingsHidden) {
      this.setState({ currentSetting: 'home', showSettings: false });
    }
  }

  componentWillUnmount() {
    if (this.hideSettingsTimer) {
      clearTimeout(this.hideSettingsTimer);
    }
  }

  setCurrentSetting = event => {
    this.setState({ currentSetting: event.target.id });
  };

  toggleSettings = () => {
    this.setState(prevState => ({
      showSettings: !prevState.showSettings,
    }));
  };

  setSpeed = speed => {
    this.props.setSpeed(speed);
    this.hideSettingsTimer = setTimeout(() => {
      this.setState({ currentSetting: 'home', showSettings: false });
    }, 1000);
  };

  render() {
    let { speed, isFullscreen } = this.props;
    let displaySettings = (
      <Fragment>
        <div
          className={classes.SpeedSetting}
          id="speed"
          onClick={this.setCurrentSetting}
        >
          Speed: {speed}x
        </div>
      </Fragment>
    );

    if (this.state.currentSetting === 'speed') {
      displaySettings = (
        <Fragment>
          <i
            className={['fas fa-long-arrow-alt-left', classes.Back].join(' ')}
            id="home"
            onClick={this.setCurrentSetting}
          />
          <button
            className={speed === 1 ? classes.Active : classes.Inactive}
            onClick={() => this.setSpeed(1)}
          >
            1x
          </button>
          <button
            className={speed === 2 ? classes.Active : classes.Inactive}
            onClick={() => this.setSpeed(2)}
          >
            2x
          </button>
          <button
            className={speed === 5 ? classes.Active : classes.Inactive}
            onClick={() => this.setSpeed(5)}
          >
            5x
          </button>
          <button
            className={speed === 10 ? classes.Active : classes.Inactive}
            onClick={() => this.setSpeed(10)}
          >
            10x
          </button>
        </Fragment>
      );
    }

    return (
      <div className={classes.Container}>
        <div className={classes.SettingsContainer}>
          {this.state.showSettings ? (
            <div className={classes.Settings}>{displaySettings}</div>
          ) : null}
          <i className="fas fa-cog" onClick={this.toggleSettings} />
        </div>
        {!isFullscreen ? (
          <i
            className={['fas fa-expand', classes.Fullscreen].join(' ')}
            onClick={this.props.toggleFullscreen}
          />
        ) : (
          <i
            className={['fas fa-compress', classes.Fullscreen].join(' ')}
            onClick={this.props.toggleFullscreen}
          />
        )}
      </div>
    );
  }
}

Settings.propTypes = {
  setSpeed: PropTypes.func.isRequired,
  speed: PropTypes.number.isRequired,
  settingsHidden: PropTypes.bool.isRequired,
  isFullscreen: PropTypes.bool.isRequired,
  toggleFullscreen: PropTypes.func.isRequired,
};

export default Settings;
