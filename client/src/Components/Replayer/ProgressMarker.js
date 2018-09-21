import React, { Component } from 'react';
import styled, { keyframes, css } from 'react-emotion';

const progressAnimation = keyframes`
0% {left: 0%}
100% {left: 100%}
`
class ProgressMarker extends Component {
  componentDidMount() {

  }

  render() {
    const Marker = styled('div')`
    border: 3px solid #2f91f2;
    position: absolute;
    border-radius: 15px;
    height: 10px;
    width: 10px;
    animation: ${ this.props.playing ? `${progressAnimation} ${this.props.duration /1000}s` : null};
    border-radius: 50%;
    `
    return (
      <Marker />
    )
  }
}

export default ProgressMarker;
