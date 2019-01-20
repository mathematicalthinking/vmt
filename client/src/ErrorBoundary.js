import React, { Component } from 'react';
import { Redirect } from 'react-router';
class ErrorBoundary extends Component {

  state = { hasError: false, };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, info);
    // this.props.fail('Uh oh! Something went wrong!')
    // this.props.history.push('/')
  }

  render(){
    return (
      this.state.hasError
      ? <Redirect to={{pathname: "/", state: {error: 'Sorry, something went wrong! Please try again.'}}} />
      // ? <div>gheleelo</div>
      : this.props.children
    )
  }
}

export default ErrorBoundary;