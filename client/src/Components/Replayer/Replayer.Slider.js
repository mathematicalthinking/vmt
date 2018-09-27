import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import classes from './Replayer.Styles.css'
import Aux from '../HOC/Auxil';


class Slider extends PureComponent {

  componentDidMount(){

  }

  jumpToPosition = event => {
    console.log(event)
    console.log(event.clientX)
    console.log(event.target)
    console.log(ReactDOM.findDOMNode(this.refs.slider).getBoundingClientRect())
  }

  render() {
    const {displayDuration, blocks, playing, progress } = this.props;

    let borderRadius;
    const progressBar = blocks.map((block, i) => {
      if (i === 0) borderRadius = '7px 0 0 7px';
      else if (i === blocks.length - 1) borderRadius = '0 7px 7px 0';
      else borderRadius = 'none';
      return (
        <Aux>
          <div className={classes.Active} style={{width: `${ (block.duration/displayDuration) * 100 }%`, borderRadius: borderRadius}}></div>
          {i < blocks.length - 1 ? <div className={classes.Break} style={{width: `${(2000/displayDuration) * 100}%`}}></div> : null}
        </Aux>
      )
    })
    return (
      <div ref="slider" className={classes.Slider} onClick={this.jumpToPosition}>
        {progressBar}
        <div ref="marker" style={{left: `${progress}%`}} className={classes.ProgressMarker}></div>
      </div>
    )
  }
}

export default Slider;
