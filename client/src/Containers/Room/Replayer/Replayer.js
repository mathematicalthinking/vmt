import React, { Component } from 'react';

class Replayer extends Component {

  render() {
    return (
      <div>
        <button onClick={this.props.play} className='button'>play</button>
      </div>
    )
  }
}

export default Replayer;
