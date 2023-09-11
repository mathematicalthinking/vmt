import React from 'react';
import PropTypes from 'prop-types';
import _pick from 'lodash/pick';
import { usePopulatedRooms } from 'utils';
import RoomsMonitor from './RoomsMonitor';

/**
 * The CourseMonitor provides views into all of the rooms assoicated with
 * a course. When the monitor is first entered, the room tiles are sorted
 * with the most recently updated room first (i.e., reverse chronological order
 * by updatedAt field).
 */

function CourseMonitor({ course }) {
  const orderedRoomIds = React.useRef();

  const roomIds = React.useMemo(
    () =>
      course.rooms
        .sort(
          (a, b) =>
            // Sort the rooms into reverse chronological order (most recently changed first) as of when the course was loaded
            new Date(b.updatedAt) - new Date(a.updatedAt)
        )
        .map((room) => room._id),
    [course.rooms]
  );

  // initially, do a fetch on all rooms
  const [visibleIds, setVisibleIds] = React.useState(roomIds);
  const populatedRooms = usePopulatedRooms(visibleIds, false, {
    initialCache: _pick(
      course.rooms.map((room) =>
        _pick(room, [
          '_id',
          'name',
          'createdAt',
          'updateAt',
          'currentMembers',
          'members',
        ])
      ),
      roomIds
    ),
    // refetchInterval: 10000, // every 10 seconds
    refetchInterval: () => false, // don't refetch
  });

  // Once data come in for the first time, sort the rooms by updatedAt according to the DB.
  React.useEffect(() => {
    if (populatedRooms.data && !orderedRoomIds.current)
      orderedRoomIds.current = Object.values(populatedRooms.data)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .map((room) => room._id);
  }, [populatedRooms.isFetched]);

  return !populatedRooms.isError ? (
    <RoomsMonitor
      context={`course-${course._id}`}
      populatedRooms={_pick(
        populatedRooms.data,
        orderedRoomIds.current || roomIds
      )}
      onVisible={setVisibleIds}
      isLoading={populatedRooms.isFetching ? visibleIds : []}
    />
  ) : (
    <div>There was an error</div>
  );
}

CourseMonitor.propTypes = {
  course: PropTypes.shape({
    _id: PropTypes.string,
    rooms: PropTypes.arrayOf(PropTypes.shape({ _id: PropTypes.string })),
  }).isRequired,
};

export default CourseMonitor;
