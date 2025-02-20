import React from 'react';
import PropTypes from 'prop-types';
import _pickBy from 'lodash/pickBy';
import _keyBy from 'lodash/keyBy';
import { usePopulatedRooms, useSortableData, useUIState } from 'utils';
import { SimpleLoading, SelectionTable, ToggleGroup, SortUI } from 'Components';
import RoomsMonitor from './RoomsMonitor';
import classes from './monitoringView.css';

/**
 * The RecentMonitor provides views into a set of rooms, keeping them updated and detecting new activity and new rooms.
 * rooms are the array of rooms to be sorted, filtered, selected among, and displayed
 * context is a unique label used by the UIState
 * config provides the sorting and filtering configuration.
 * sortKeys provides the options for sorting
 * selectionConfig provides how the selection table (if desired) is set up
 * isLoading is a boolean, from the parent, letting the component know that new rooms are being fetched
 */

function RecentMonitor({
  rooms: roomsToSort,
  context,
  config,
  sortKeys, // array of {property, name}
  selectionConfig,
  isLoading,
}) {
  const constants = {
    SELECT: 'Select',
    VIEW: 'View',
  };

  const [uiState, setUIState] = useUIState(
    `monitoring-container-${context}`,
    {}
  );
  const [viewOrSelect, setViewOrSelect] = React.useState(
    uiState.mode || constants.VIEW
  );
  const [selections, setSelections] = React.useState(uiState.selections || {});

  const roomIds = React.useMemo(() => roomsToSort.map((room) => room._id), [
    roomsToSort,
  ]);

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
    const defaultSelections = roomsToSort.reduce(
      (acc, room) => ({ ...acc, [room._id]: true }),
      {}
    );
    setSelections((prev) => ({ ...defaultSelections, ...prev })); // show any new rooms
  }, [roomsToSort]);

  React.useEffect(() => {
    setUIState({ selections, sortConfig, mode: viewOrSelect });
  }, [selections, sortConfig, viewOrSelect]);

  const _updateSelections = (newSelections) =>
    setSelections((prev) => ({ ...prev, ...newSelections }));

  if (populatedRooms.isError) return <div>There was an error.</div>;
  if (populatedRooms.isLoading || isLoading) return <SimpleLoading />;

  return (
    <div>
      {selectionConfig && (
        <div className={classes.TogglesContainer}>
          <ToggleGroup
            value={viewOrSelect}
            buttons={[constants.VIEW, constants.SELECT]}
            onChange={setViewOrSelect}
          />
        </div>
      )}
      {selectionConfig && viewOrSelect === constants.SELECT ? (
        <SelectionTable
          data={roomsToSort}
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

RecentMonitor.propTypes = {
  context: PropTypes.string.isRequired,
  config: PropTypes.shape({}).isRequired,
  sortKeys: PropTypes.arrayOf(
    PropTypes.shape({ property: PropTypes.string, name: PropTypes.string })
  ),
  selectionConfig: PropTypes.arrayOf(PropTypes.shape({})),
  rooms: PropTypes.arrayOf(PropTypes.shape({})),
  isLoading: PropTypes.bool,
};

RecentMonitor.defaultValues = {
  selectionConfig: null,
  sortKeys: null,
  rooms: [],
  isLoading: false,
};

export default RecentMonitor;
