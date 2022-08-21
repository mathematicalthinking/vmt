import React from 'react';
import PropTypes from 'prop-types';
import { usePopulatedRooms } from 'utils';
import { Loading } from 'Components';
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
  const roomIds = course.rooms
    .sort(
      (a, b) =>
        // Sort the rooms into reverse chronological order (most recently changed first) as of when the course was loaded
        new Date(b.updatedAt) - new Date(a.updatedAt)
    )
    .map((room) => room._id);
  const populatedRooms = usePopulatedRooms(roomIds, true, {
    // refetchInterval: 10000, // @TODO Should experiment with longer intervals to see what's acceptable to users (and the server)
  });

  if (populatedRooms.isError) return <div>There was an error</div>;

  console.log(populatedRooms.isSuccess && populatedRooms.data);
  return populatedRooms.isSuccess ? (
    <RoomsMonitor populatedRooms={populatedRooms.data} />
  ) : (
    <Loading message="Getting the course rooms" />
  );
}

CourseMonitor.propTypes = {
  course: PropTypes.shape({
    rooms: PropTypes.arrayOf(PropTypes.shape({ _id: PropTypes.string })),
  }).isRequired,
};

export default CourseMonitor;
