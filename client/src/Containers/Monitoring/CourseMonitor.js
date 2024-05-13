import React from 'react';
import PropTypes from 'prop-types';
import _pick from 'lodash/pick';
import {
  dateAndTime,
  API,
  timeFrames,
  useSortableData,
  usePopulatedRooms,
} from 'utils';
import { SimpleLoading } from 'Components';
import RoomsMonitor from './RoomsMonitor';
import classes from './monitoringView.css';

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

  const [isLoading, setIsLoading] = React.useState(false);
  const [allRooms, setAllRooms] = React.useState([]);

  const { items: rooms } = useSortableData(allRooms, config);

  const fetchAllRooms = () => {
    const twoDaysAgo = dateAndTime.before(Date.now(), 2, 'days');
    const since = dateAndTime.getTimestamp(twoDaysAgo);
    return (
      API.getAllCourseRooms(course._id, { since, isActive: true })
        .then((res) => {
          const rooms = res.data.result || [];
          return rooms;
        })
        // eslint-disable-next-line no-console
        .catch((err) => console.log(err))
    );
  };

  React.useEffect(async () => {
    setIsLoading(true);
    const allTheRooms = await fetchAllRooms();
    setAllRooms(allTheRooms);
    setIsLoading(false);
  }, []);

  const roomIds = rooms.map((room) => room._id);
  const populatedRooms = usePopulatedRooms(roomIds, false, {
    refetchInterval: 10000,
  });

  if (populatedRooms.isError) return <div>There was an error</div>;

  return (
    <div>
      <p style={{ fontSize: '1.5em' }}>
        Rooms with activity in the past 48 hours {'('}
        {rooms.length} active of {allRooms.length} total{')'}
      </p>
      <p>(Use brower refresh to find newly active rooms)</p>
      <br />
      <div className={classes.Container}>
        {populatedRooms.isLoading || isLoading ? (
          <SimpleLoading />
        ) : (
          <RoomsMonitor
            context={`course-${course._id}`}
            populatedRooms={populatedRooms.data || {}}
            isLoading={populatedRooms.isFetching ? roomIds : []}
          />
        )}
      </div>
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
