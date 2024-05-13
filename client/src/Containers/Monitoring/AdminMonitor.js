import React from 'react';
import {
  timeFrames,
  API,
  dateAndTime,
  useSortableData,
  usePopulatedRooms,
} from 'utils';
import _pick from 'lodash/pick';
import { SimpleLoading } from 'Components';
import RoomsMonitor from './RoomsMonitor';
import classes from './monitoringView.css';

/**
 * The AdminMonitor provides views into all of the rooms with activity in the past 48 hours.
 */

function AdminMonitor() {
  const config = {
    key: 'updatedAt',
    direction: 'descending',
    filter: { timeframe: timeFrames.LAST2DAYS, key: 'updatedAt' },
  };

  const [isLoading, setIsLoading] = React.useState(false);
  const [allRooms, setAllRooms] = React.useState([]);

  const { items: rooms } = useSortableData(allRooms, config);

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

  React.useEffect(async () => {
    setIsLoading(true);
    const allTheRooms = await fetchAllRooms();
    setAllRooms(allTheRooms);
    setIsLoading(false);
  }, []);

  const roomIds = rooms.map((room) => room._id);
  const populatedRooms = usePopulatedRooms(roomIds, false, {
    refetchInterval: 10000,
  });

  if (populatedRooms.isError) return <div>There was an error</div>;

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
      <div className={classes.Container}>
        {populatedRooms.isLoading || isLoading ? (
          <SimpleLoading />
        ) : (
          <RoomsMonitor
            context={`adminMonitor`}
            populatedRooms={populatedRooms.data || {}}
            isLoading={populatedRooms.isFetching ? roomIds : []}
          />
        )}
      </div>
    </div>
  );
}

export default AdminMonitor;
