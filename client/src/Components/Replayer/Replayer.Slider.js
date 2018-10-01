import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import classes from './Replayer.Styles.css';
import Aux from '../HOC/Auxil';
import Draggable from 'react-draggable';


class Slider extends PureComponent {

  state = {
    dragging: false,
    x: 0,
  }

  jumpToPosition = event => {
    // if (this.state.dragging) {
    //   event.preventDefault();
    // }
    if (!this.state.dragging) {
      console.log(event.clientX)
      const sliderEl = ReactDOM.findDOMNode(this.refs.slider).getBoundingClientRect();
      const percent = (event.clientX - sliderEl.left)/sliderEl.width // As a fraction
      console.log(percent)
      this.setState({x: percent * 100})
      this.props.goToTime(percent)

    }
  }

  startDrag = () => {
    this.setState({dragging: true, x: 0})
    console.log("start drag ")
    const sliderEl = ReactDOM.findDOMNode(this.refs.slider).getBoundingClientRect();
    console.log(sliderEl)
  }
  dragging = (e, d) => {
    // console.log(e)
    // console.log(d)
    // console.log("dragging")
  }
  stopDrag = (e, d) => {
    console.log(e.clientX)
    const sliderEl = ReactDOM.findDOMNode(this.refs.slider).getBoundingClientRect();
    console.log(sliderEl)
    const percent = (e.clientX - sliderEl.left)/sliderEl.width
    console.log(percent)
    this.props.goToTime(percent)
    this.setState({dragging: false})
  }

  render() {
    const {displayDuration, blocks, playing, progress } = this.props;
    console.log(this.state.x)
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
          <div ref='marker' className={classes.ProgressMarker} style={{left: `${this.state.x}%`}}></div>
        </Draggable>
      </div>
    )
  }
}

export default Slider;
