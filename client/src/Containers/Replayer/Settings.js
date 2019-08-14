import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classes from './settings.css';

class Settings extends PureComponent {
  state = {
    currentSetting: 'home',
    showSettings: false,
  };

  componentDidUpdate() {
    const { settingsHidden } = this.props;
    if (settingsHidden) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ currentSetting: 'home', showSettings: false });
    }
  }

  componentWillUnmount() {
    if (this.hideSettingsTimer) {
      clearTimeout(this.hideSettingsTimer);
    }
  }

  setCurrentSetting = (event) => {
    this.setState({ currentSetting: event.target.id });
  };

  toggleSettings = () => {
    this.setState((prevState) => ({
      showSettings: !prevState.showSettings,
    }));
  };

  setSpeed = (speed) => {
    const { setSpeed } = this.props;
    setSpeed(speed);
    this.hideSettingsTimer = setTimeout(() => {
      this.setState({ currentSetting: 'home', showSettings: false });
    }, 1000);
  };

  render() {
    const { speed, isFullscreen, toggleFullscreen } = this.props;
    const { currentSetting, showSettings } = this.state;
    let displaySettings = (
      <Fragment>
        <div
          className={classes.SpeedSetting}
          id="speed"
          onClick={this.setCurrentSetting}
          onKeyPress={this.setCurrentSetting}
          tabIndex="-1"
          role="button"
        >
          Speed: {speed}x
        </div>
      </Fragment>
    );

    if (currentSetting === 'speed') {
      displaySettings = (
        <Fragment>
          <i
            className={['fas fa-long-arrow-alt-left', classes.Back].join(' ')}
            id="home"
            onClick={this.setCurrentSetting}
            onKeyPress={this.setCurrentSetting}
            tabIndex="-2"
            role="button"
          />
          <button
            className={speed === 1 ? classes.Active : classes.Inactive}
            onClick={() => this.setSpeed(1)}
            type="button"
          >
            1x
          </button>
          <button
            className={speed === 2 ? classes.Active : classes.Inactive}
            onClick={() => this.setSpeed(2)}
            type="button"
          >
            2x
          </button>
          <button
            className={speed === 5 ? classes.Active : classes.Inactive}
            onClick={() => this.setSpeed(5)}
            type="button"
          >
            5x
          </button>
          <button
            className={speed === 10 ? classes.Active : classes.Inactive}
            onClick={() => this.setSpeed(10)}
            type="button"
          >
            10x
          </button>
        </Fragment>
      );
    }

    return (
      <div className={classes.Container}>
        <div className={classes.SettingsContainer}>
          {showSettings ? (
            <div className={classes.Settings}>{displaySettings}</div>
          ) : null}
          <i
            className="fas fa-cog"
            onClick={this.toggleSettings}
            onKeyPress={this.setCurrentSetting}
            tabIndex="-3"
            role="button"
          />
        </div>
        {!isFullscreen ? (
          <i
            className={['fas fa-expand', classes.Fullscreen].join(' ')}
            onClick={toggleFullscreen}
            onKeyPress={toggleFullscreen}
            tabIndex="-4"
            role="button"
          />
        ) : (
          <i
            className={['fas fa-compress', classes.Fullscreen].join(' ')}
            onClick={toggleFullscreen}
            onKeyPress={toggleFullscreen}
            tabIndex="-1"
            role="button"
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
