import React from 'react';
import PropTypes from 'prop-types';
import _throttle from 'lodash/throttle';
import { API, dateAndTime } from 'utils';
import { Button } from 'Components';
import RecentMonitor from './RecentMonitor';

/**
 * The CourseMonitor provides views into all of the rooms assoicated with
 * a course that were updated in the past 48 hours (see fetchRooms).
 */

function CourseMonitor({ course }) {
  const config = {
    key: 'name',
    direction: 'ascending',
  };

  const sortKeys = [
    { property: 'updatedAt', name: 'Last Updated' },
    { property: 'name', name: 'Name' },
  ];

  const TABLE_CONFIG = [
    { property: 'name', label: 'Room Name' },
    {
      property: 'updatedAt',
      label: 'Last Updated',
      formatter: (date) => dateAndTime.toDateTimeString(date),
    },
    {
      property: 'createdAt',
      label: 'Created',
      formatter: (date) => dateAndTime.toDateTimeString(date),
    },
    // {
    //   property: 'currentMembers',
    //   label: 'Currently In Room',
    //   style: { textAlign: 'center' },
    //   formatter: (currentMembers) => currentMembers && currentMembers.length,
    // },
  ];

  const [rooms, setRooms] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchRooms = React.useCallback(
    _throttle(() => {
      setIsLoading(true);
      const twoDaysAgo = dateAndTime.before(Date.now(), 2, 'days');
      const since = dateAndTime.getTimestamp(twoDaysAgo);
      return API.getAllCourseRooms(course._id, { since, isActive: true })
        .then((res) => {
          setIsLoading(false);
          const rooms = res.data.result || [];
          return rooms;
        })
        .catch((err) => {
          setIsLoading(false);
          console.log(err);
          return [];
        });
    }, 2000),
    [course._id]
  );

  React.useEffect(async () => {
    setRooms(await fetchRooms());
  }, []);

  return (
    <div>
      <p style={{ fontSize: '1.5em' }}>
        Rooms with activity in the past 48 hours
      </p>
      <p>
        (
        <Button theme="Inline" click={async () => setRooms(await fetchRooms())}>
          Refresh
        </Button>{' '}
        to find newly active rooms)
      </p>
      <br />
      <RecentMonitor
        config={config}
        rooms={rooms}
        sortKeys={sortKeys}
        context={`course-${course._id}`}
        isLoading={isLoading}
        selectionConfig={TABLE_CONFIG}
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
