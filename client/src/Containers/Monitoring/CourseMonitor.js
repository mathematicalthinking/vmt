import React from 'react';
import PropTypes from 'prop-types';
import _throttle from 'lodash/throttle';
import { API, dateAndTime } from 'utils';
import RecentMonitor from './RecentMonitor';

/**
 * The CourseMonitor provides views into all of the rooms assoicated with
 * a course that were updated in the past 48 hours (see fetchCourseRooms).
 *
 */

function CourseMonitor({ course }) {
  const config = {
    key: 'updatedAt',
    direction: 'descending',
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

  const fetchCourseRooms = React.useCallback(
    _throttle(() => {
      const twoDaysAgo = dateAndTime.before(Date.now(), 2, 'days');
      const since = dateAndTime.getTimestamp(twoDaysAgo);
      return API.getAllCourseRooms(course._id, { since, isActive: true })
        .then((res) => {
          const rooms = res.data.result || [];
          return rooms;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    }, 2000),
    [course._id]
  );

  return (
    <div>
      <p style={{ fontSize: '1.5em' }}>
        Rooms with activity in the past 48 hours
      </p>
      <br />
      <RecentMonitor
        config={config}
        sortKeys={sortKeys}
        context={`course-${course._id}`}
        fetchRooms={fetchCourseRooms}
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
