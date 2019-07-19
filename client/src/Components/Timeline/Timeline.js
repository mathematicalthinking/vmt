/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, Fragment } from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';
import moment from 'moment';
import classes from './timeline.css';
// import Aux from '../../HOC/Auxil';
// import EventDesc from './EventDesc/EventDesc';

const Timeline = ({
  dispatch,
  startTime,
  endTime,
  startDateF,
  endDateF,
  durationDisplay,
}) => {
  const startSlider = useRef(null);
  const endSlider = useRef(null);
  const currentTimeline = useRef(null);
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
    const slider = id === 'start' ? startSlider : endSlider;
    const sliderEl = slider.current.getBoundingClientRect();
    const { percent, position } = getPercentAndPosition(
      timelineEl,
      sliderEl,
      currentEnd - currentStart
    );
    dispatch({ type: 'UPDATE_TIME', payload: { id, percent } });
    setCurrent(
      id === 'start' ? [position, currentEnd] : [currentStart, position]
    );
  };

  const dragBoth = () => {
    console.log('dragBoth');
    // const timelineRect = timeline.current.getBoundingClientRect();
    // console.log({ timelineRect });
    // const currentTimelineRect = currentTimeline.current.getBoundingClientRect();
    // console.log(currentTimelineRect);
    // const newStart = currentTimelineRect.left - timelineRect.left;
    // const newEnd = newStart + currentTimelineRect.width;
    // console.log({ newStart, newEnd });
    // const sliderEl = startSlider.current.getBoundingClientRect();
    // const { percent, position } = getPercentAndPosition(
    //   timelineEl,
    //   sliderEl,
    //   currentEnd - currentStart
    // );
    // dispatch({ type: 'UPDATE_TIME', payload: { id, percent } });
    // setCurrent([newStart, newEnd]);
    // id === 'start' ? [position, currentEnd] : [currentStart, position]
  };

  const onStop = (e, id) => {
    const timelineEl = timeline.current.getBoundingClientRect();
    const slider = id === 'start' ? startSlider : endSlider;
    const sliderEl = slider.current.getBoundingClientRect();
    const { percent, position } = getPercentAndPosition(
      timelineEl,
      sliderEl,
      currentEnd - currentStart
    );
    dispatch({ type: 'UPDATE_TIME', payload: { id, percent } });
    setCurrent(
      id === 'start' ? [position, currentEnd] : [currentStart, position]
    );
  };
  const x = 1;
  // eslint-disable-next-line no-array-constructor
  const markers = Array(Math.floor(durationDisplay))
    .fill()
    .map((e, i) => x + i); // needs to be filled to map over;
  const markerEls = markers.map((e, i) => {
    const currentWidth = currentEnd - currentStart;
    const offset = (currentWidth / markers.length - 1) * (i + 1);
    return <div className={classes.Marker} key={e} style={{ left: offset }} />;
  });
  console.log(currentStart, currentEnd);
  return (
    <div className={classes.Container}>
      <div className={classes.Timeline} ref={timeline}>
        <Draggable
          axis="x"
          bounds="parent"
          position={{ x: currentStart, y: 0 }}
          onStop={e => onStop(e, 'start')}
          onDrag={e => onDrag(e, 'start')}
        >
          <div className={classes.SliderContainer}>
            <div ref={startSlider} className={classes.Slider} />
            <div className={classes.StartTime}>{startDateF}</div>
          </div>
        </Draggable>
        <Draggable
          axis="x"
          bounds="parent"
          position={{ x: currentEnd, y: 0 }}
          onStop={e => onStop(e, 'end')}
          onDrag={e => onDrag(e, 'end')}
        >
          <div className={classes.SliderContainer}>
            <div ref={endSlider} className={classes.Slider} />
            <div className={classes.EndTime} style={{ right: 0 }}>
              {endDateF}
            </div>
          </div>
        </Draggable>
        <Draggable
          axis="x"
          bounds="parent"
          position={{ x: 0, y: 0 }}
          onDrag={dragBoth}
        >
          <div
            className={classes.CurrentTimeline}
            ref={currentTimeline}
            style={{ left: currentStart + 10, right: width - currentEnd + 4 }}
          />
        </Draggable>
        {/* {markerEls} */}
      </div>
      {/* <div className={classes.AbsoluteTimes}>
      </div> */}
    </div>
  );
};

const getPercentAndPosition = (container, slider, adjustment) => {
  console.log({ adjustment });
  if (adjustment < 75) {
    adjustment = 75; // i.e. min-width of timeline bar is 75px
  }
  // instead of using clientX we could use position of endSlider or startSlider
  // this way they can drag from label and progress bar won't get off
  const zoomFactor = (1 - adjustment / container.width) * 0.35;
  console.log({ zoomFactor });
  let percent =
    (slider.left + slider.width / 2 - container.left) / container.width -
    zoomFactor;
  if (percent < 0) percent = 0.0001;
  if (percent > 1) percent = 1;
  console.log({ percent });
  let position = slider.left + slider.width / 2 - container.left;
  if (position < 0) position = 0;
  if (position > container.width) position = container.width;
  return { percent, position };
};

Timeline.propTypes = {
  startTime: PropTypes.number.isRequired,
  endTime: PropTypes.number.isRequired,
  startDateF: PropTypes.string.isRequired,
  endDateF: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  // progress: PropTypes.number.isRequired,
  // log: PropTypes.arrayOf(PropTypes.object).isRequired,
  durationDisplay: PropTypes.number.isRequired,
  // goToTime: PropTypes.func.isRequired,
};

export default Timeline;
