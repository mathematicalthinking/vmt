import React from 'react';
import PropTypes from 'prop-types';
import { API, dateAndTime, amIAFacilitator } from 'utils';
import RecentMonitorAlt from './RecentMonitorAlt';

/**
 * The AllRoomsMonitor provides views into all of the rooms associated with
 * a user. When the monitor is first entered, the room tiles are sorted
 * with the most recently updated room first (i.e., reverse chronological order
 * by updatedAt field).
 */

function AllRoomsMonitor({ user }) {
  const config = {
    key: 'updatedAt',
    direction: 'descending',
  };

  const sortKeys = [
    { property: 'updatedAt', name: 'Sort by Last Updated' },
    { property: 'name', name: 'Sort by Name' },
  ];

  const fetchUserRooms = () => {
    const twoDaysAgo = dateAndTime.before(Date.now(), 2, 'days');
    const since = dateAndTime.getTimestamp(twoDaysAgo);
    return (
      API.getAllUserRooms(user._id, { since, isActive: true })
        .then((res) => {
          const rooms = res.data.result;
          return rooms.filter((room) => amIAFacilitator(room, user._id));
        })
        // eslint-disable-next-line no-console
        .catch((err) => console.log(err))
    );
  };

  return (
    <div>
      <p style={{ fontSize: '1.5em' }}>
        Rooms with activity in the past 48 hours
      </p>
      <p>(Navigate away and back to find newly active rooms)</p>
      <br />
      <RecentMonitorAlt
        config={config}
        context={`userRooms-${user._id}`}
        fetchRooms={fetchUserRooms}
        sortKeys={sortKeys}
      />
    </div>
  );
}

AllRoomsMonitor.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    rooms: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default AllRoomsMonitor;
