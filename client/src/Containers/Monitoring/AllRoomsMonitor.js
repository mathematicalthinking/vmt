import React from 'react';
import PropTypes from 'prop-types';
import { API, dateAndTime, amIAFacilitator } from 'utils';
import RecentMonitorAlt from './RecentMonitorAlt';
import { Button } from 'Components';

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

  const [rooms, setRooms] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchUserRooms = () => {
    setIsLoading(true);
    const twoDaysAgo = dateAndTime.before(Date.now(), 2, 'days');
    const since = dateAndTime.getTimestamp(twoDaysAgo);
    return (
      API.getAllUserRooms(user._id, { since, isActive: true })
        .then((res) => {
          setIsLoading(false);
          const rooms = res.data.result;
          return rooms.filter((room) => amIAFacilitator(room, user._id));
        })
        // eslint-disable-next-line no-console
        .catch((err) => {
          setIsLoading(false);
          console.log(err);
        })
    );
  };

  React.useEffect(async () => {
    setRooms(await fetchUserRooms());
  }, []);

  return (
    <div>
      <p style={{ fontSize: '1.5em' }}>
        Rooms with activity in the past 48 hours
      </p>
      <p>
        (
        <Button click={async () => setRooms(await fetchUserRooms())}>
          Refresh
        </Button>{' '}
        to find newly active rooms)
      </p>
      <br />
      <RecentMonitorAlt
        config={config}
        rooms={rooms}
        context={`userRooms-${user._id}`}
        fetchRooms={fetchUserRooms}
        sortKeys={sortKeys}
        isLoading={isLoading}
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
