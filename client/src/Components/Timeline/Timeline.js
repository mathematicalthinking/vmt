/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, Fragment } from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';
import moment from 'moment';
import classes from './timeline.css';
// import Aux from '../../HOC/Auxil';
// import EventDesc from './EventDesc/EventDesc';

const Timeline = ({ startTime, endTime, startDateF, endDateF }) => {
  const startSlider = useRef(null);
  const endSlider = useRef(null);
  const timeline = useRef(null);

  const [width, setWidth] = useState(0);
  const [[currentStart, currentEnd], setCurrent] = useState([
    startTime,
    endTime,
  ]);
  useEffect(() => {
    if (timeline.current) {
      const { width: initWidth } = timeline.current.getBoundingClientRect();
      setWidth(initWidth);
      setCurrent([0, initWidth]);
    }
  }, [startTime, endTime]);
  const onDrag = (e, id) => {
    const timelineEl = timeline.current.getBoundingClientRect();
    // instead of using clientX we could use position of endSlider or startSlider
    // this way they can drag from label and progress bar won't get off
    let percent = (e.clientX - timelineEl.left) / timelineEl.width;
    if (percent < 0) percent = 0;
    if (percent > 1) percent = 1;
    let position = e.clientX - timelineEl.left;
    if (position < 0) position = 0;
    if (position > timelineEl.width) position = timelineEl.width;
    setCurrent(
      id === 'start' ? [position, currentEnd] : [currentStart, position]
    );
  };

  const onStop = (e, id) => {
    const timelineEl = timeline.current.getBoundingClientRect();
    const {percent, position } = getPercentAndPosition(timelineEl, e)
    dispatch({type: 'UPDATE_TIME', payload: {id, percent}})
    setCurrent(
      id === 'start' ? [position, currentEnd] : [currentStart, position]
    );
  }
  return (
    <div className={classes.Container}>
      <div className={classes.Timeline} ref={timeline}>
        <Draggable
          axis="x"
          bounds="parent"
          position={{ x: currentStart, y: 0 }}
          // onStop={e => onDrag(e, 'start')}
          onDrag={e => onDrag(e, 'start')}
        >
          <div className={classes.SliderContainer}>
            <div ref={startSlider} className={classes.Marker} />
            <div className={classes.StartTime}>{startDateF}</div>
          </div>
        </Draggable>
        <Draggable
          axis="x"
          bounds="parent"
          position={{ x: currentEnd, y: 0 }}
          onStop={e => onDrag(e, 'end')}
          onDrag={e => onDrag(e, 'end')}
        >
          <div className={classes.SliderContainer}>
            <div ref={endSlider} className={classes.Marker} />
            <div className={classes.EndTime} style={{ right: 0 }}>
              {endDateF}
            </div>
          </div>
        </Draggable>
        <div
          className={classes.CurrentTimeline}
          style={{ left: currentStart + 10, right: width - currentEnd + 4 }}
        />
      </div>
      {/* <div className={classes.AbsoluteTimes}>
      </div> */}
    </div>
  );
};

const getPercentAndPosition()
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
