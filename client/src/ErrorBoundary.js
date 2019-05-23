import React, { Component } from 'react';
import { Redirect } from 'react-router';
import PropTypes from 'prop-types';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, info);
    // this.props.fail('Uh oh! Something went wrong!')
    // this.props.history.push('/')
  }

  render() {
    const { hasError } = this.state;
    const { children } = this.props;
    return hasError ? (
      <Redirect
        to={{
          pathname: '/',
          state: { error: 'Sorry, something went wrong! Please try again.' },
        }}
      />
    ) : (
      // ? <div>gheleelo</div>
      children
    );
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};
export default ErrorBoundary;
