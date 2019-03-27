import React, { Component } from "react";
import ReactDOM from "react-dom";
import Draggable from "react-draggable";
import classes from "./slider.css";
// import Aux from '../../HOC/Auxil';
import EventDesc from "./EventDesc/EventDesc";

class Slider extends Component {
  state = {
    dragging: false,
    sliderWidth: 0
  };

  slider = React.createRef();

  componentDidMount() {
    this.getSliderWidth();
    window.addEventListener("resize", this.getSliderWidth);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.getSliderWidth);
  }

  getSliderWidth = () => {
    this.setState({
      sliderWidth: this.slider.current.getBoundingClientRect().width
    });
  };

  jumpToPosition = event => {
    // if (this.state.dragging) {
    //   event.preventDefault();
    // }
    if (!this.state.dragging) {
      let sliderEl = this.slider.current.getBoundingClientRect();
      let percent = (event.clientX - sliderEl.left) / sliderEl.width; // As a fraction
      this.props.goToTime(percent);
    }
  };

  startDrag = () => {
    this.setState({ dragging: true });
  };

  onDrag = (e, d) => {
    let sliderEl = this.slider.current.getBoundingClientRect();
    let percent = (e.clientX - sliderEl.left) / sliderEl.width;
    if (percent < 0) percent = 0;
    if (percent > 1) percent = 1;
    this.props.goToTime(percent);
    this.setState({ dragging: false });
  };

  stopDrag = (e, d) => {
    let sliderEl = this.slider.current.getBoundingClientRect();
    let percent = (e.clientX - sliderEl.left) / sliderEl.width;
    if (percent < 0) percent = 0;
    if (percent > 1) percent = 1;
    this.props.goToTime(percent);
    this.setState({ dragging: false });
  };

  showEventDetail = event => {
    if (!this.state.dragging) {
      event.target.children.style = { display: "flex" };
    }
  };

  render() {
    let eventMarks = this.props.log.map((entry, i) => {
      let color = entry.synthetic ? "red" : entry.color;
      let percentFromStart = (entry.relTime / this.props.duration) * 100;
      return (
        <EventDesc
          color={color}
          offset={percentFromStart}
          entry={entry}
          dragging={this.state.dragging}
        />
      );
    });
    let x =
      (this.props.progress / 100) * (this.state.sliderWidth - 6) >
      this.state.sliderWidth - 6
        ? this.state.sliderWidth - 6
        : (this.props.progress / 100) * (this.state.sliderWidth - 6);
    return (
      <div
        ref={this.slider}
        className={classes.Slider}
        onClick={this.jumpToPosition}
      >
        {eventMarks}
        <Draggable
          axis="x"
          bounds="parent"
          onStart={this.startDrag}
          onDrag={this.onDrag}
          onStop={this.stopDrag}
          position={{ x: x, y: 0 }}
        >
          <div ref="marker" className={classes.ProgressMarker} />
        </Draggable>
      </div>
    );
  }
}

export default Slider;
