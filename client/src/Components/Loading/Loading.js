import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './loading.css';
import sine from './sine.gif';

class Loading extends Component {
  state = {
    doDisplay: false,
  };
  timer = null;

  componentDidMount() {
    const { waitTimeMs } = this.props;
    this.timer = setTimeout(() => {
      const { doDisplay } = this.state;
      if (!doDisplay) {
        this.setState({ doDisplay: true });
      }
    }, waitTimeMs);
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  render() {
    const { doDisplay } = this.state;
    const { isSmall, message } = this.props;
    return doDisplay ? (
      <div className={!isSmall ? classes.Loading : classes.SmallLoading}>
        <div className={classes.Graph}>
          <img src={sine} height={20} width={100} alt="...loading" />
        </div>
        <div className={classes.Message}>{message}</div>
      </div>
    ) : null;
  }
}

Loading.propTypes = {
  message: PropTypes.string,
  isSmall: PropTypes.bool,
  waitTimeMs: PropTypes.number,
};

Loading.defaultProps = {
  message: null,
  isSmall: false,
  waitTimeMs: 100,
};

export default Loading;
