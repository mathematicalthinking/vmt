import React from 'react';
import PropTypes from 'prop-types';
import { timeFrames, API, dateAndTime, amIAFacilitator } from 'utils';
import RecentMonitor from './RecentMonitor';

/**
 * The AllRoomsMonitor provides views into all of the rooms associated with
 * a user. When the monitor is first entered, the room tiles are sorted
 * with the most recently updated room first (i.e., reverse chronological order
 * by updatedAt field).
 */

function AllRoomsMonitor({ user, userResources }) {
  const config = {
    key: 'updatedAt',
    direction: 'descending',
    filter: { timeframe: timeFrames.LAST2DAYS, key: 'updatedAt' },
  };

  const [roomsShown, setRoomsShown] = React.useState(0);

  // Note: THe total might not be accurate if new rooms are created since logging in.
  // However, a person might be the facilitator on 1000s of rooms, so I don't want to do a DB
  // fetch for everything just to get an accourate count.

  const totalRooms = userResources.filter((room) =>
    amIAFacilitator(room, user._id)
  ).length;

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
        Rooms with activity in the past 48 hours {'('}
        {roomsShown} active of {totalRooms} total{')'}
      </p>
      <p>(Use brower refresh to find newly active rooms)</p>
      <br />
      <RecentMonitor
        config={config}
        context={`userRooms-${user._id}`}
        fetchRooms={fetchUserRooms}
        setRoomsShown={setRoomsShown}
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
