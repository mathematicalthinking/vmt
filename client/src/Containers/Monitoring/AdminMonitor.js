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
          marginBottom: '25px',
          fontSize: '30px',
          textAlign: 'center',
        }}
      >
        Rooms Updated in the Past 48 Hours
      </p>
      <RecentMonitor
        config={config}
        context={`adminMonitor`}
        fetchRooms={fetchAllRooms}
        fetchInterval={1000 * 60 * 30} // 30 minutes
      />
    </div>
  );
}

export default AdminMonitor;
