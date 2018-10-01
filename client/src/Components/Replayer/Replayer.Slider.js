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
      const sliderEl = ReactDOM.findDOMNode(this.refs.slider).getBoundingClientRect();
      const percent = (event.clientX - sliderEl.left)/sliderEl.width // As a fraction
      this.props.goToTime(percent)

    }
  }

  startDrag = () => {
    this.setState({dragging: true})
  }

  onDrag = (e, d) => {
    const sliderEl = ReactDOM.findDOMNode(this.refs.slider).getBoundingClientRect();
    let percent = (e.clientX - sliderEl.left)/sliderEl.width
    if (percent < 0) percent = 0;
    if (percent > 1) percent = .9999;
    this.props.goToTime(percent)
    this.setState({dragging: false})
  }

  stopDrag = (e, d) => {
    const sliderEl = ReactDOM.findDOMNode(this.refs.slider).getBoundingClientRect();
    let percent = (e.clientX - sliderEl.left)/sliderEl.width
    if (percent < 0) percent = 0;
    if (percent > 1) percent = .9999;
    this.props.goToTime(percent)
    this.setState({dragging: false})
  }

  render() {
    const {displayDuration, blocks, playing, progress } = this.props;
    // const offset = this.state.x * 600
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
        <Draggable
          axis="x"
          bounds='parent'
          onStart={this.startDrag}
          onDrag={this.onDrag}
          onStop={this.stopDrag}
          // style={{left: `${this.state.x}%`}}
          // Position: x (progress as % * width of slider - 1/2 width of marker)
          position={{x: ((progress/100) * (600 - 6)), y: 0}}
        >
          <div ref='marker' className={classes.ProgressMarker} ></div>
        </Draggable>
      </div>
    )
  }
}

export default Slider;
