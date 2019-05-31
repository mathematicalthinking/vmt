import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactCSSTRansitionGroup from 'react-addons-css-transition-group';
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
    }, 1600);
  }

  render() {
    const { children } = this.props;
    const { style } = this.state;
    return (
      // @TODO TRANSITION GROUP IS NOT WORKING AS IS
      <ReactCSSTRansitionGroup
        transitionName="example"
        transitionAppear
        transitionAppearTimeout={1000}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={1000}
      >
        <div key="error" className={classes.Container} style={style}>
          {children}
        </div>
      </ReactCSSTRansitionGroup>
    );
  }
}

ErrorToast.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorToast;
