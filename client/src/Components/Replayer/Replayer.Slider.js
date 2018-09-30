import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import classes from './Replayer.Styles.css';
import Aux from '../HOC/Auxil';
import Draggable from 'react-draggable';


class Slider extends PureComponent {

  state = {

  }

  jumpToPosition = event => {
    const sliderEl = ReactDOM.findDOMNode(this.refs.slider).getBoundingClientRect();
    const percent = (event.clientX - sliderEl.left)/sliderEl.width // As a fraction
    this.props.goToTime(percent)
  }

  startDrag = () => {
    console.log("start drag ")
  }
  dragging = (e, d) => {
    console.log(e)
    console.log(d)
    console.log("dragging")
  }
  stopDrag = (e, d) => {
    console.log(d)
    const sliderEl = ReactDOM.findDOMNode(this.refs.slider).getBoundingClientRect();
    const percent = (d.x - sliderEl.left)/sliderEl.width
    console.log(percent)
    this.props.goToTime(percent)
  }

  render() {
    const {displayDuration, blocks, playing, progress } = this.props;

    let borderRadius;
    // const progressBar = blocks.map((block, i) => {
    //   if (i === 0) borderRadius = '7px 0 0 7px';
    //   else if (i === blocks.length - 1) borderRadius = '0 7px 7px 0';
    //   else borderRadius = 'none';
    //   return (
    //     <Aux>
    //       <div className={classes.Active} style={{width: `${ (block.duration/displayDuration) * 100 }%`, borderRadius: borderRadius}}></div>
    //       {i < blocks.length - 1 ? <div className={classes.Break} style={{width: `${(2000/displayDuration) * 100}%`}}></div> : null}
    //     </Aux>
    //   )
    // })

    return (
      <div ref="slider" className={classes.Slider} onClick={this.jumpToPosition}>
        {/* {progressBar} */}
        <Draggable axis="x" bounds='parent' onStart={this.startDrag} onDrag={this.dragging} onStop={this.stopDrag}>
          <div style={{left: `calc(${progress}% - 6px)`}} className={classes.ProgressMarker}></div>
        </Draggable>
      </div>
    )
  }
}

export default Slider;
