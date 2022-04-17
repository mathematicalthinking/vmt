import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TransitionGroup } from 'react-transition-group';
import classes from './errorToast.css';

class ErrorToast extends Component {
  state = {
    style: {},
  };

  componentDidMount() {
    this.setState({
      style: {
        bottom: '100px',
        opacity: 1,
      },
    });
    setTimeout(() => {
      this.setState({ style: { bottom: '-200px', opacity: 0 } });
    }, 2000);
  }

  render() {
    const { children } = this.props;
    const { style } = this.state;

    return (
      <TransitionGroup
        transitionName="example"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={1000}
      >
        <div key="error" className={classes.Container} style={style}>
          {children}
        </div>
      </TransitionGroup>
    );
  }
}

ErrorToast.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorToast;
