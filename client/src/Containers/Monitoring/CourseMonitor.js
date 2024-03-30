import React from 'react';
import PropTypes from 'prop-types';
import {
  timeFrames,
  usePopulatedRooms,
  useSortableData,
  API,
  dateAndTime,
} from 'utils';
import RoomsMonitor from './RoomsMonitor';
import { SimpleLoading } from 'Components';

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

  const roomsToSort = React.useRef(course.rooms);

  const { items: rooms } = useSortableData(roomsToSort.current, config);

  const roomIds = React.useMemo(() => rooms.map((room) => room._id), [rooms]);

  const populatedRooms = usePopulatedRooms(roomIds, false, {
    refetchInterval: 10000,
  });

  const fetchCourseRooms = () => {
    const twoDaysAgo = dateAndTime.before(Date.now(), 2, 'days');
    const since = dateAndTime.getTimestamp(twoDaysAgo);
    return (
      API.getAllCourseRooms(course._id, { since, isActive: true })
        .then((res) => res.data.result)
        // eslint-disable-next-line no-console
        .catch((err) => console.log(err))
    );
  };

  // if the UI state changes, update the UIState variable and pull lean versions of the rooms (to get updatedAt field) from the DB
  React.useEffect(() => {
    const fetchAndSetRooms = async () => {
      roomsToSort.current = await fetchCourseRooms();
    };

    fetchAndSetRooms();

    const intervalId = setInterval(fetchAndSetRooms, 10000);

    return () => clearInterval(intervalId);
  }, []);

  if (populatedRooms.isError) return <div>There was an error.</div>;

  return (
    <div>
      <p style={{ fontSize: '1.5em', marginBottom: '20px' }}>
        Rooms with activity in the past 48 hours:{' '}
        {Object.keys(populatedRooms.data || {}).length} of {course.rooms.length}
      </p>
      {populatedRooms.isLoading ? (
        <SimpleLoading />
      ) : (
        <RoomsMonitor
          context={`course-${course._id}`}
          populatedRooms={populatedRooms.data || {}}
          isLoading={populatedRooms.isFetching ? roomIds : []}
        />
      )}
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
