/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Loading, ToggleGroup } from 'Components';
import { updateMonitorSelections } from 'store/actions';
import { addUserRoleToResource } from 'store/utils';
import { usePopulatedRooms } from 'utils';
import ResourceTables from './ResourceTables';
import RoomsMonitor from './RoomsMonitor';
import classes from './monitoringView.css';

/**
 * The MonitoringView allows users to select which of their rooms (whether ones
 * they manage or are a member of) to monitor.
 *
 * The rooms are shown by default in reverse chronological order. However,
 * whatever sorting and selection is done by the selection table takes precedence.
 */

function MonitoringView({
  userResources,
  storedSelections,
  user,
  connectUpdateMonitorSelections,
  notifications,
}) {
  const constants = {
    SELECT: 'Select',
    VIEW: 'View',
  };

  const _wasRecentlyUpdated = (room) => {
    // integrated logic to determine default rooms to view
    // hours is time window to determine recent rooms
    const hours = 24;
    const recent = 3600000 * hours;
    const lastUpdated = new Date(room.updatedAt);
    const now = new Date();
    return now - lastUpdated < recent;
  };

  // we have to check whether the rooms in userResources are consistent
  // with the collection of rooms that were available for selection
  // and so stored in the Redux store.  For example, maybe a new room
  // was added since we last did our monitoring.
  const _initializeSelections = (rooms) => {
    const result = {};
    rooms.forEach((room) => {
      if (
        !storedSelections ||
        (storedSelections && storedSelections[room._id] === undefined)
      ) {
        result[room._id] = _wasRecentlyUpdated(room);
      } else {
        result[room._id] = storedSelections[room._id];
      }
    });

    // if there's nothing to display, show the (up to) 5 most recently updated rooms

    if (!Object.values(result).reduce((acc, val) => acc || val, false)) {
      // if all the values are false
      const roomsResult = [...rooms].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      if (roomsResult.length !== 0)
        roomsResult
          .slice(0, Math.min(5, roomsResult.length))
          // eslint-disable-next-line no-return-assign
          .forEach((room) => (result[room._id] = true));
    }
    return result;
  };

  const [viewOrSelect, setViewOrSelect] = React.useState(constants.VIEW);
  const [roomIds, setRoomIds] = React.useState(
    userResources.map((room) => room._id)
  );
  const [selections, setSelections] = React.useState(
    _initializeSelections(userResources)
  );
  const savedState = React.useRef(selections);

  const populatedRooms = usePopulatedRooms(roomIds, false, {
    refetchInterval: 10000, // @TODO Should experiment with longer intervals to see what's acceptable to users (and the server)
  });

  React.useEffect(() => {
    const allIds = userResources.map((room) => room._id);
    if (viewOrSelect === constants.SELECT) setRoomIds(allIds);
    else setRoomIds(allIds.filter((id) => selections[id]));
  }, [userResources.length, viewOrSelect]);

  /**
   * EFFECTS THAT ARE USED TO PERSIST STATE AFTER UNMOUNT
   *
   * Whenever the state we want to persist changes, update the savedState ref. When the component unmounts,
   * save the state in the Redux store. Much preferred to alerting the Redux store of every little local state change.
   *
   * Right now, we save only the current selections. In the future, we might save:
   *  - width and height of each tile
   *  - the scroll location for each tile
   *  - whether we are viewing chat, thumbnail, or graph
   *
   */

  React.useEffect(() => {
    savedState.current = selections;
  }, [selections]);

  React.useEffect(() => {
    return () => {
      connectUpdateMonitorSelections(savedState.current);
    };
  }, []);

  if (populatedRooms.isError) return <div>There was an error</div>;
  if (!populatedRooms.isSuccess) return <Loading message="Getting the rooms" />;

  return (
    <div className={classes.Container}>
      <div className={classes.TogglesContainer}>
        <ToggleGroup
          buttons={[constants.VIEW, constants.SELECT]}
          onChange={setViewOrSelect}
        />
      </div>

      {viewOrSelect === constants.SELECT ? (
        <ResourceTables
          // So that we quickly display the table: use the data in userResources until we have more recent live data
          data={Object.values(populatedRooms.data).map((room) =>
            addUserRoleToResource(room, user._id)
          )}
          resource="rooms"
          selections={selections}
          onChange={(newSelections) => {
            setSelections((prev) => {
              return { ...prev, ...newSelections };
            });
          }}
        />
      ) : (
        <RoomsMonitor populatedRooms={populatedRooms.data} />
      )}
    </div>
  );
}

MonitoringView.propTypes = {
  user: PropTypes.shape({ _id: PropTypes.string }).isRequired,
  userResources: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  notifications: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  storedSelections: PropTypes.shape({}),
  connectUpdateMonitorSelections: PropTypes.func.isRequired,
};

MonitoringView.defaultProps = {
  storedSelections: {},
};

const mapStateToProps = (state) => ({
  storedSelections: state.rooms.monitorSelections,
});

export default connect(mapStateToProps, {
  connectUpdateMonitorSelections: updateMonitorSelections,
})(MonitoringView);
