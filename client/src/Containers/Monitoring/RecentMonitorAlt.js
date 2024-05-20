import React from 'react';
import PropTypes from 'prop-types';
import _pickBy from 'lodash/pickBy';
import _keyBy from 'lodash/keyBy';
import { usePopulatedRooms, useSortableData, useUIState } from 'utils';
import { SimpleLoading, SelectionTable, ToggleGroup, SortUI } from 'Components';
import RoomsMonitor from './RoomsMonitor';
import classes from './monitoringView.css';

/**
 * The RecentMonitorAlt provides views into a set of rooms, keeping them updated and detecting new activity and new rooms.
 * context is a unique label used by the UIState
 * config provides the sorting and filtering configuration.
 * fetchRooms is a function that returns a set of rooms from the DB
 */

function RecentMonitorAlt({
  context,
  config,
  sortKeys, // array of {property, name}
  fetchRooms,
  selectionConfig,
}) {
  const roomsToSort = React.useRef([]);
  const initialLoad = React.useRef(true);
  const [isLoading, setIsLoading] = React.useState(false);

  const constants = {
    SELECT: 'Select',
    VIEW: 'View',
  };

  const [uiState, setUIState] = useUIState(
    `monitoring-container-alt-${context}`,
    {}
  );
  const [viewOrSelect, setViewOrSelect] = React.useState(constants.VIEW);
  const [selections, setSelections] = React.useState(uiState.selections || {});

  const roomIds = React.useMemo(
    () => roomsToSort.current.map((room) => room._id),
    [roomsToSort.current]
  );

  const populatedRooms = usePopulatedRooms(roomIds, false, {
    refetchInterval: 10000,
  });

  const { items: rooms, resetSort, sortConfig } = useSortableData(
    populatedRooms.isSuccess && populatedRooms.data
      ? Object.values(populatedRooms.data)
      : [],
    uiState.sortConfig || config
  );

  React.useEffect(() => {
    _fetchAndSetRooms();
  }, []);

  React.useEffect(() => {
    setUIState({ selections, sortConfig });
  }, [selections, sortConfig]);

  const _updateSelections = (newSelections) =>
    setSelections((prev) => ({ ...prev, ...newSelections }));

  const _fetchAndSetRooms = async () => {
    if (initialLoad.current) setIsLoading(true);
    roomsToSort.current = await fetchRooms();
    const defaultSelections = roomsToSort.current.reduce(
      (acc, room) => ({ ...acc, [room._id]: true }),
      {}
    );
    setSelections((prev) => ({ ...defaultSelections, ...prev })); // show any new rooms
    if (initialLoad.current) {
      setIsLoading(false);
      initialLoad.current = false;
    }
  };

  if (populatedRooms.isError) return <div>There was an error.</div>;
  if (populatedRooms.isLoading || isLoading) return <SimpleLoading />;

  return (
    <div>
      {selectionConfig && (
        <div className={classes.TogglesContainer}>
          <ToggleGroup
            buttons={[constants.VIEW, constants.SELECT]}
            onChange={setViewOrSelect}
          />
        </div>
      )}
      {viewOrSelect === constants.SELECT ? (
        <SelectionTable
          data={roomsToSort.current}
          config={selectionConfig}
          selections={selections}
          onChange={_updateSelections}
        />
      ) : (
        <div>
          <RoomsMonitor
            context={context}
            // provide only the selected rooms
            populatedRooms={_pickBy(
              _keyBy(rooms, '_id'),
              (_, id) => selections[id]
            )}
            isLoading={populatedRooms.isFetching ? roomIds : []}
            customComponent={
              sortKeys && (
                <SortUI
                  keys={sortKeys}
                  sortFn={resetSort}
                  sortConfig={sortConfig}
                  disableFilter
                  disableLabels
                  disableSearch
                />
              )
            }
          />
        </div>
      )}
    </div>
  );
}

RecentMonitorAlt.propTypes = {
  context: PropTypes.string.isRequired,
  config: PropTypes.shape({}).isRequired,
  fetchRooms: PropTypes.func.isRequired,
  sortKeys: PropTypes.arrayOf(
    PropTypes.shape({ property: PropTypes.string, name: PropTypes.string })
  ),
  setRoomsShown: PropTypes.func,
  fetchInterval: PropTypes.number,
  selectionConfig: PropTypes.arrayOf(PropTypes.shape({})),
};

RecentMonitorAlt.defaultValues = {
  selectionConfig: null,
  sortKeys: null,
};

export default RecentMonitorAlt;
