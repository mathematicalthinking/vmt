import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import Draggable from 'react-draggable';
import classes from './slider.css';
// import Aux from '../../HOC/Auxil';
import EventDesc from './EventDesc/EventDesc';

class Slider extends PureComponent {

  state = {
    dragging: false,
  }

  componentDidMount() {

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
    if (percent > 1) percent = 1;
    this.props.goToTime(percent)
    this.setState({dragging: false})
  }

  stopDrag = (e, d) => {
    const sliderEl = ReactDOM.findDOMNode(this.refs.slider).getBoundingClientRect();
    let percent = (e.clientX - sliderEl.left)/sliderEl.width
    if (percent < 0) percent = 0;
    if (percent > 1) percent = 1;
    this.props.goToTime(percent)
    this.setState({dragging: false})
  }

  showEventDetail = (event) => {
    if (!this.state.dragging) {
      event.target.children.style = {display: 'flex'}
    }
  }

  eventMarks = this.props.log.map((entry, i) => {
    let color = entry.synthetic ? 'red' : 'green';
    let percentFromStart = entry.relTime/this.props.duration * 100;
    return <EventDesc color={color} offset={percentFromStart} entry={entry} dragging={this.state.dragging}/>
  })

  render() {
    let x = (this.props.progress/100 * (600 - 6)) > 594 ? 594 : (this.props.progress/100 * (600 - 6))
    return (
      <div ref="slider" className={classes.Slider} onClick={this.jumpToPosition}>
        {this.eventMarks}
        <Draggable
          axis="x"
          bounds='parent'
          onStart={this.startDrag}
          onDrag={this.onDrag}
          onStop={this.stopDrag}
          position={{x: x, y: 0}}
        >
          <div ref='marker' className={classes.ProgressMarker} ></div>
        </Draggable>
      </div>
    )
  }
}

export default Slider;
