/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import _pick from 'lodash/pick';
import _pickBy from 'lodash/pickBy';
import _keyBy from 'lodash/keyBy';
import { ToggleGroup } from 'Components';
import { addUserRoleToResource } from 'store/utils';
import { usePopulatedRooms, useUIState } from 'utils';
import ResourceTables from './ResourceTables';
import RoomsMonitor from './RoomsMonitor';
import classes from './monitoringView.css';

const MINIMAL_ROOMS = 5;
/**
 * The MonitoringView allows users to select which of their rooms (whether ones
 * they manage or are a member of) to monitor.
 *
 * The rooms are shown by default in reverse chronological order. However,
 * whatever sorting and selection is done by the selection table takes precedence.
 */

function MonitoringView({ userResources, user, notifications }) {
  /* ------- INITIALIZATION FUNCTIONS ------------- */
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
  const _initializeSelections = (rooms, storedSelections) => {
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
          .slice(0, Math.min(MINIMAL_ROOMS, roomsResult.length))
          // eslint-disable-next-line no-return-assign
          .forEach((room) => (result[room._id] = true));
    }
    return result;
  };

  const _initialVisibleRooms = (selectedRooms) => {
    const selectedIds = Object.keys(_pickBy(selectedRooms));
    return selectedIds.slice(0, MINIMAL_ROOMS);
  };

  /* ------------------ */

  const constants = {
    SELECT: 'Select',
    VIEW: 'View',
  };

  const [uiState, setUIState] = useUIState('monitoring-container', {});
  const [viewOrSelect, setViewOrSelect] = React.useState(constants.VIEW);
  const [selections, setSelections] = React.useState(
    _initializeSelections(userResources, uiState.storedSelections)
  );
  const [visibleIds, setVisibleIds] = React.useState(
    _initialVisibleRooms(selections)
  );
  const populatedRooms = usePopulatedRooms(visibleIds, false, {
    initialCache: _keyBy(userResources, '_id'),
    refetchInterval: 10000,
  });

  const allIds = React.useMemo(() => userResources.map((room) => room._id), [
    userResources,
  ]);

  React.useEffect(() => {
    setUIState({ storedSelections: selections });
  }, [selections]);

  React.useEffect(() => {
    if (viewOrSelect === constants.SELECT) setVisibleIds(allIds);
  }, [viewOrSelect]);

  return !populatedRooms.isError ? (
    <div className={classes.Container}>
      <div className={classes.TogglesContainer}>
        <ToggleGroup
          buttons={[constants.VIEW, constants.SELECT]}
          onChange={setViewOrSelect}
        />
      </div>
      {populatedRooms.isLoading && <span>Loading...</span>}
      {viewOrSelect === constants.SELECT ? (
        <ResourceTables
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
        <RoomsMonitor
          context="monitoring-rooms"
          populatedRooms={_pick(
            populatedRooms.data,
            Object.keys(_pickBy(selections))
          )}
          onVisible={setVisibleIds}
          isLoading={populatedRooms.isFetching ? visibleIds : []}
        />
      )}
    </div>
  ) : (
    <div>There was an error</div>
  );
}

MonitoringView.propTypes = {
  user: PropTypes.shape({ _id: PropTypes.string }).isRequired,
  userResources: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  notifications: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default MonitoringView;
