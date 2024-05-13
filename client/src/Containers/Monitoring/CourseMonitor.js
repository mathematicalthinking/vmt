import React from 'react';
import PropTypes from 'prop-types';
import { timeFrames, API, dateAndTime } from 'utils';
import RecentMonitor from './RecentMonitor';

/**
 * The CourseMonitor provides views into all of the rooms assoicated with
 * a course. When the monitor is first entered, the room tiles are sorted
 * with the most recently updated room first (i.e., reverse chronological order
 * by updatedAt field).
 */

function CourseMonitor({ course }) {
  const config = {
    key: 'updatedAt',
    direction: 'descending',
    filter: { timeframe: timeFrames.LAST2DAYS, key: 'updatedAt' },
  };

  const [roomsShown, setRoomsShown] = React.useState(0);
  const [roomsTotal, setRoomsTotal] = React.useState(0);

  const fetchCourseRooms = () => {
    return (
      API.getAllCourseRooms(course._id, { isActive: true })
        .then((res) => {
          const rooms = res.data.result || [];
          setRoomsTotal(rooms.length);
          return rooms;
        })
        // eslint-disable-next-line no-console
        .catch((err) => console.log(err))
    );
  };

  return (
    <div>
      <p style={{ fontSize: '1.5em' }}>
        Rooms with activity in the past 48 hours {'('}
        {roomsShown} active of {roomsTotal} total{')'}
      </p>
      <p>(Use brower refresh to find newly active rooms)</p>
      <br />
      <RecentMonitor
        config={config}
        context={`course-${course._id}`}
        fetchRooms={fetchCourseRooms}
        setRoomsShown={setRoomsShown}
      />
    </div>
  );
}

CourseMonitor.propTypes = {
  course: PropTypes.shape({
    _id: PropTypes.string,
    rooms: PropTypes.arrayOf(PropTypes.shape({ _id: PropTypes.string })),
  }).isRequired,
};

export default CourseMonitor;
