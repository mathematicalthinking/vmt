/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, Fragment } from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';
import moment from 'moment';
import classes from './timeline.css';
// import Aux from '../../HOC/Auxil';
// import EventDesc from './EventDesc/EventDesc';

const Timeline = ({ startTime, endTime, startDateF, endDateF }) => {
  console.log({ startTime, endTime });
  const startSlider = useRef(null);
  const endSlider = useRef(null);
  const endTimeRef = useRef(null);
  const timeline = useRef(null);
  const [[currentStart, currentEnd], setCurrent] = useState([
    startTime,
    endTime,
  ]);

  const onStop = e => {
    const timelineEl = timeline.current.getBoundingClientRect();
    let percent = (e.clientX - timelineEl.left) / timelineEl.width;
    if (percent < 0) percent = 0;
    if (percent > 1) percent = 1;
    let position = e.clientX - timelineEl.left;
    if (position < 0) position = 0;
    if (position > timelineEl.width) position = timelineEl.width;
    setCurrent([position, currentEnd]);
  };

  console.log(currentStart, currentEnd);
  const [timelineWidth, setWidth] = useState(0);
  useEffect(() => {
    let width;
    if (timeline.current) {
      ({ width } = timeline.current.getBoundingClientRect());

      const duration = endTime - startTime;
      setCurrent([0, width]);
    }
  }, [startTime, endTime]);

  return (
    <div className={classes.Container}>
      <div className={classes.Timeline} ref={timeline}>
        <Draggable
          axis="x"
          bounds="parent"
          position={{ x: currentStart, y: 0 }}
          onStop={onStop}
        >
          <div className={classes.SliderContainer}>
            <div ref={startSlider} className={classes.Marker} />
            <div className={classes.Time}>{startDateF}</div>
          </div>
        </Draggable>
        <Draggable axis="x" bounds="parent" position={{ x: currentEnd, y: 0 }}>
          <div className={classes.SliderContainer}>
            <div ref={endSlider} className={classes.Marker} />
            <div
              className={classes.Time}
              ref={endTimeRef}
              style={{
                right: 0,
              }}
            >
              {endDateF}
            </div>
          </div>
        </Draggable>
        <div className={classes.CurrentTimeline} />
      </div>
      {/* <div className={classes.AbsoluteTimes}>
      </div> */}
    </div>
  );
};
//   slider = React.createRef();

//   componentDidMount() {
//     this.getSliderWidth();
//     window.addEventListener('resize', this.getSliderWidth);
//   }

//   componentWillUnmount() {
//     window.removeEventListener('resize', this.getSliderWidth);
//   }

//   getSliderWidth = () => {
//     this.setState({
//       sliderWidth: this.slider.current.getBoundingClientRect().width,
//     });
//   };

//   jumpToPosition = event => {
//     const { goToTime } = this.props;
//     const { dragging } = this.state;
//     // if (this.state.dragging) {
//     //   event.preventDefault();
//     // }
//     if (!dragging) {
//       const sliderEl = this.slider.current.getBoundingClientRect();
//       const percent = (event.clientX - sliderEl.left) / sliderEl.width; // As a fraction
//       goToTime(percent);
//     }
//   };

//   startDrag = () => {
//     this.setState({ dragging: true });
//   };

//   onDrag = e => {
//     const { goToTime } = this.props;
//     const sliderEl = this.slider.current.getBoundingClientRect();
//     let percent = (e.clientX - sliderEl.left) / sliderEl.width;
//     if (percent < 0) percent = 0;
//     if (percent > 1) percent = 1;
//     goToTime(percent);
//     this.setState({ dragging: false });
//   };

//   stopDrag = e => {
//     const { goToTime } = this.props;
//     const sliderEl = this.slider.current.getBoundingClientRect();
//     let percent = (e.clientX - sliderEl.left) / sliderEl.width;
//     if (percent < 0) percent = 0;
//     if (percent > 1) percent = 1;
//     goToTime(percent);
//     this.setState({ dragging: false });
//   };

//   showEventDetail = event => {
//     const { dragging } = this.state;
//     if (!dragging) {
//       event.target.children.style = { display: 'flex' };
//     }
//   };

//   render() {
//     const { log, duration, progress } = this.props;
//     const { dragging, sliderWidth } = this.state;
//     const eventMarks = log.map(entry => {
//       const color = entry.synthetic ? 'red' : entry.color;
//       const percentFromStart = (entry.relTime / duration) * 100;
//       return (
//         <EventDesc
//           key={entry.relTime}
//           color={color}
//           offset={percentFromStart}
//           entry={entry}
//           dragging={dragging}
//         />
//       );
//     });
//     const x =
//       (progress / 100) * (sliderWidth - 6) > sliderWidth - 6
//         ? sliderWidth - 6
//         : (progress / 100) * (sliderWidth - 6);
//     return (
//       <div
//         ref={this.slider}
//         className={classes.Slider}
//         onClick={this.jumpToPosition}
//         onKeyPress={this.jumpToPosition}
//         tabIndex="-2"
//         role="button"
//       >
//         {eventMarks}
//         <Draggable
//           axis="x"
//           bounds="parent"
//           onStart={this.startDrag}
//           onDrag={this.onDrag}
//           onStop={this.stopDrag}
//           position={{ x, y: 0 }}
//         >
//           <div ref={this.slider} className={classes.ProgressMarker} />
//         </Draggable>
//       </div>
//     );
//   }
// }

Timeline.propTypes = {
  startTime: PropTypes.number.isRequired,
  endTime: PropTypes.number.isRequired,
  startDateF: PropTypes.string.isRequired,
  endDateF: PropTypes.string.isRequired,
  // progress: PropTypes.number.isRequired,
  // log: PropTypes.arrayOf(PropTypes.object).isRequired,
  // duration: PropTypes.number.isRequired,
  // goToTime: PropTypes.func.isRequired,
};

export default Timeline;
