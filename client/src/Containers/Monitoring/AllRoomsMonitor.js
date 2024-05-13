import React from 'react';
import PropTypes from 'prop-types';
import _pick from 'lodash/pick';
import {
  timeFrames,
  useSortableData,
  usePopulatedRooms,
  amIAFacilitator,
} from 'utils';
import { SimpleLoading } from 'Components';
import RoomsMonitor from './RoomsMonitor';
import classes from './monitoringView.css';

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

  const allRooms = userResources.filter((room) =>
    amIAFacilitator(room, user._id)
  );

  const { items: rooms } = useSortableData(allRooms, config);

  const roomIds = rooms.map((room) => room._id);
  const populatedRooms = usePopulatedRooms(roomIds, false, {
    refetchInterval: 10000,
  });

  if (populatedRooms.isError) return <div>There was an error</div>;

  return (
    <div>
      <p style={{ fontSize: '1.5em' }}>
        Rooms with activity in the past 48 hours {'('}
        {rooms.length} active of {allRooms.length} total{')'}
      </p>
      <p>(Use brower refresh to find newly active rooms)</p>
      <br />
      <div className={classes.Container}>
        {populatedRooms.isLoading ? (
          <SimpleLoading />
        ) : (
          <RoomsMonitor
            context={`user-${user._id}`}
            populatedRooms={populatedRooms.data || {}}
            isLoading={populatedRooms.isFetching ? roomIds : []}
          />
        )}
      </div>
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
