import React from 'react';
import _throttle from 'lodash/throttle';
import { API, dateAndTime } from 'utils';
import { Button } from 'Components';
import RecentMonitor from './RecentMonitor';

/**
 * The AdminMonitor provides views into all of the rooms with activity in the past 48 hours.
 */

function AdminMonitor() {
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
  ];

  const [rooms, setRooms] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchRooms = React.useCallback(
    _throttle(() => {
      setIsLoading(true);
      const twoDaysAgo = dateAndTime.before(Date.now(), 2, 'days');
      const since = dateAndTime.getTimestamp(twoDaysAgo);
      return API.getRecentActivity('rooms', null, 0, { since })
        .then((res) => {
          setIsLoading(false);
          const [rooms] = res.data.results;
          return rooms;
        })
        .catch((err) => {
          setIsLoading(false);
          console.log(err);
        });
    }, 2000),
    []
  );

  React.useEffect(async () => {
    setRooms(await fetchRooms());
  }, []);

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
        context={`adminMonitor`}
        isLoading={isLoading}
        selectionConfig={TABLE_CONFIG}
      />
    </div>
  );
}

export default AdminMonitor;
