/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ToggleGroup } from 'Components';
import { updateMonitorSelections } from 'store/actions';
import { addUserRoleToResource } from 'store/utils';
import { usePopulatedRoom } from 'utils';
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
  const [selections, setSelections] = React.useState(
    _initializeSelections(userResources)
  );
  const savedState = React.useRef(selections);

  // Because "useQuery" is the equivalent of useState, do this
  // initialization of queryStates (an object containing the states
  // for the API-retrieved data) at the top level rather than inside
  // of a useEffect.
  const queryStates = {};
  userResources.forEach((room) => {
    queryStates[room._id] = usePopulatedRoom(
      room._id,
      viewOrSelect === constants.VIEW, // shouldbuildlog false on selection
      // Check for updates every 10 sec. If we are viewing rooms (i.e., Chat, Thumbnail, or Graph), then we need
      // to update only the currently selected rooms. If we are selecting rooms via the selection table, then we
      // should try to update all rooms so that the "current in room" column remains correct.
      {
        refetchInterval: 10000, // 10 sec, @TODO Should experiment with longer intervals to see what's acceptable to users (and the server)
        staleTime: 300000, // 5min, @TODO also experiment with adjusting stale time to use cached data upon revisiting monitoring
        enabled:
          (savedState.current && savedState.current[room._id]) ||
          viewOrSelect === constants.SELECT,
      }
    );
  });

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
          data={userResources.map((room) =>
            queryStates[room._id].isSuccess ? queryStates[room._id].data : room
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
        <RoomsMonitor
          populatedRooms={userResources
            .filter(
              (room) => selections[room._id] && queryStates[room._id].isSuccess
            )
            .reduce(
              (res, room) => ({
                ...res,
                // UserResources have the myRole property defined because that gets set when
                // the user's data is pulled into the redux store from the DB (see store/actionsuser.js).
                // However, we are polling the DB directly (via usePopulatedRoom), so have to assign the myRole property,
                // which is needed for ResourceTables
                [room._id]: addUserRoleToResource(
                  queryStates[room._id].data,
                  user._id
                ),
              }),
              {}
            )}
        />
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
