import React from 'react';
import { timeFrames, API, dateAndTime } from 'utils';
import RecentMonitor from './RecentMonitor';

/**
 * The AdminMonitor provides views into all of the rooms with activity in the past 48 hours.
 */

function AdminMonitor() {
  const config = {
    key: 'updatedAt',
    direction: 'descending',
    filter: { timeframe: timeFrames.LAST2DAYS, key: 'updatedAt' },
  };

  const fetchAllRooms = () => {
    const twoDaysAgo = dateAndTime.before(Date.now(), 2, 'days');
    const since = dateAndTime.getTimestamp(twoDaysAgo);
    return (
      API.getRecentActivity('rooms', null, 0, { since })
        .then((res) => {
          const [rooms] = res.data.results;
          return rooms;
        })
        // eslint-disable-next-line no-console
        .catch((err) => console.log(err))
    );
  };

  return (
    <div style={{ marginTop: '100px', width: '90%', alignSelf: 'center' }}>
      <p
        style={{
          fontSize: '30px',
          textAlign: 'center',
        }}
      >
        Rooms Updated in the Past 48 Hours
      </p>
      <p style={{ textAlign: 'center' }}>
        (Use brower refresh to find newly active rooms)
      </p>
      <br />
      <RecentMonitor
        config={config}
        context={`adminMonitor`}
        fetchRooms={fetchAllRooms}
      />
    </div>
  );
}

export default AdminMonitor;
