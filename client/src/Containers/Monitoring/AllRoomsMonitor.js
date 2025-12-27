import React from 'react';
import PropTypes from 'prop-types';
import _throttle from 'lodash/throttle';
import { Button } from 'Components';
import { API, dateAndTime, amIAFacilitator } from 'utils';
import RecentMonitor from './RecentMonitor';

/**
 * The AllRoomsMonitor provides views into all of the rooms associated with
 * a user that have been updated in the last 48 hours.
 */

function AllRoomsMonitor({ user }) {
  const config = {
    key: 'name',
    direction: 'ascending',
  };

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
  ];

  const sortKeys = [
    { property: 'name', name: 'Sort by Name' },
    { property: 'updatedAt', name: 'Sort by Last Updated' },
  ];

  const [rooms, setRooms] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchRooms = React.useCallback(
    _throttle(() => {
      setIsLoading(true);
      const twoDaysAgo = dateAndTime.before(Date.now(), 2, 'days');
      const since = dateAndTime.getTimestamp(twoDaysAgo);
      return API.getAllUserRooms(user._id, { since, isActive: true })
        .then((res) => {
          setIsLoading(false);
          const rooms = res.data.result || [];
          return rooms.filter((room) => amIAFacilitator(room, user._id));
        })
        .catch((err) => {
          setIsLoading(false);
          console.log(err);
        });
    }, 2000),
    [user._id]
  );

  React.useEffect(() => {
    const loadRooms = async () => {
      setRooms(await fetchRooms());
    };
    loadRooms();
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
        context={`userRooms-${user._id}`}
        sortKeys={sortKeys}
        isLoading={isLoading}
        selectionConfig={TABLE_CONFIG}
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
