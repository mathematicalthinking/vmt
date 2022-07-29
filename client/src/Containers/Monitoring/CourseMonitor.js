import React from 'react';
import PropTypes from 'prop-types';
import { usePopulatedRoom } from 'utils';
import RoomsMonitor from './RoomsMonitor';

/**
 * The CourseMonitor provides views into all of the rooms assoicated with
 * a course. When the monitor is first entered, the room tiles are sorted
 * with the most recently updated room first (i.e., reverse chronological order
 * by updatedAt field).
 */

function CourseMonitor({ course }) {
  // Because "useQuery" is the equivalent of useState, do this
  // initialization of queryStates (an object containing the states
  // for the API-retrieved data) at the top level rather than inside
  // of a useEffect.
  const queryStates = {};
  course.rooms.forEach((room) => {
    queryStates[room._id] = usePopulatedRoom(room._id, true, {
      refetchInterval: 10000, // @TODO Should experiment with longer intervals to see what's acceptable to users (and the server)
    });
  });

  return (
    <RoomsMonitor
      populatedRooms={course.rooms
        .sort(
          (a, b) =>
            // Sort the rooms into reverse chronological order (most recently changed first) as of when the course was loaded
            new Date(b.updatedAt) - new Date(a.updatedAt)
        )
        .filter((room) => queryStates[room._id].isSuccess)
        .reduce(
          (res, room) => ({
            ...res,
            [room._id]: queryStates[room._id].data,
          }),
          {}
        )}
    />
  );
}

CourseMonitor.propTypes = {
  course: PropTypes.shape({
    rooms: PropTypes.arrayOf(PropTypes.shape({ _id: PropTypes.string })),
  }).isRequired,
};

export default CourseMonitor;
