import React from 'react';
import PropTypes from 'prop-types';
import _keyBy from 'lodash/keyBy';
import {
  timeFrames,
  usePopulatedRooms,
  useSortableData,
  useUIState,
  API,
} from 'utils';
import RoomsMonitor from './RoomsMonitor';
import { SortUI, SimpleLoading } from 'Components';
import { STATUS } from 'constants.js';

/**
 * The CourseMonitor provides views into all of the rooms assoicated with
 * a course. When the monitor is first entered, the room tiles are sorted
 * with the most recently updated room first (i.e., reverse chronological order
 * by updatedAt field).
 */

function CourseMonitor({ course }) {
  const timeFrameOptions = [
    { label: 'Last Day', value: timeFrames.LASTDAY },
    { label: 'Last 2 Days', value: timeFrames.LAST2DAYS },
    { label: 'Last Week', value: timeFrames.LASTWEEK },
    { label: 'Last Month', value: timeFrames.LASTMONTH },
    { label: 'Last 3 Months', value: timeFrames.LAST3MONTHS },
    { label: 'Last 6 Months', value: timeFrames.LAST6MONTHS },
    { label: 'Last 9 Months', value: timeFrames.LAST9MONTHS },
    { label: 'Last Year', value: timeFrames.LASTYEAR },
    { label: 'All', value: timeFrames.ALL },
  ];

  const initialConfig = {
    key: 'updatedAt',
    direction: 'descending',
    filter: { timeframe: timeFrames.LAST2DAYS, key: 'updatedAt' },
  };

  const [uIState, setUIState] = useUIState(`CourseMonitor-${course._id}`, {
    config: initialConfig,
  });

  const roomsToSort = React.useRef(_keyBy(course.rooms, '_id'));

  const { items: rooms, sortConfig, resetSort } = useSortableData(
    Object.values(roomsToSort.current),
    uIState.config
  );

  const roomIds = React.useMemo(() => rooms.map((room) => room._id), [rooms]);

  const populatedRooms = usePopulatedRooms(roomIds, false, {
    refetchInterval: 10000,
  });

  const fetchCourseRoomsFromDB = () => {
    return (
      API.getAllCourseRooms(course._id)
        .then((res) => {
          const courseRooms = res.data.result;
          const activeCourseRooms = courseRooms.filter(
            (room) => room.status === STATUS.DEFAULT
          );
          return _keyBy(activeCourseRooms, '_id');
        })
        // eslint-disable-next-line no-console
        .catch((err) => console.log(err))
    );
  };

  // if the UI state changes, update the UIState variable and pull lean versions of the rooms (to get updatedAt field) from the DB
  React.useEffect(async () => {
    roomsToSort.current = await fetchCourseRoomsFromDB();
    setUIState({ config: sortConfig });
  }, [sortConfig]);

  if (populatedRooms.isError) return <div>There was an error.</div>;

  return (
    <div>
      <SortUI
        sortConfig={sortConfig}
        sortFn={resetSort}
        disableSort
        disableSearch
        timeFrames={timeFrameOptions}
      />
      <br />
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
