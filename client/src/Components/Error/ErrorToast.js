import React, { Component } from 'react';
import classes from './errorToast.css';
class ErrorToast extends Component {
  state = {
    style: {}
  }

  componentDidMount(){
    this.setState({
      style: {
        bottom: "100px",
        opacity: 1,
      }
    })
    setTimeout(() => {
      this.setState({bottom: "-200px", opacity: 0})
    }, 1600)
  }

  render() {
    return (

      <div className={classes.Container} style={this.state.style}>
        {this.props.children}
      </div>
    )
  }
}

export default ErrorToast;