import React from 'react';
import PropTypes from 'prop-types';
import _pickBy from 'lodash/pickBy';
import { usePopulatedRooms, useSortableData, useUIState } from 'utils';
import { SimpleLoading, SelectionTable, ToggleGroup } from 'Components';
import RoomsMonitor from './RoomsMonitor';
import classes from './monitoringView.css';

/**
 * The RecentMonitor provides views into a set of rooms, keeping them updated and detecting new activity and new rooms.
 * context is a unique label used by the UIState
 * config provides the sorting and filtering configuration.
 * fetchRooms is a function that returns a set of rooms from the DB
 */

function RecentMonitor({
  context,
  config,
  fetchRooms,
  setRoomsShown,
  fetchInterval,
  selectionConfig,
}) {
  const roomsToSort = React.useRef([]);
  const initialLoad = React.useRef(true);
  const [isLoading, setIsLoading] = React.useState(false);

  const constants = {
    SELECT: 'Select',
    VIEW: 'View',
  };

  const [uiState, setUIState] = useUIState('monitoring-container', {});
  const [viewOrSelect, setViewOrSelect] = React.useState(constants.VIEW);
  const [selections, setSelections] = React.useState(
    uiState.storedSelections || {}
  );

  const { items: rooms } = useSortableData(roomsToSort.current, config);

  const roomIds = React.useMemo(() => rooms.map((room) => room._id), [rooms]);

  const populatedRooms = usePopulatedRooms(roomIds, false, {
    refetchInterval: 10000,
  });

  React.useEffect(() => {
    const fetchAndSetRooms = async () => {
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

    fetchAndSetRooms();

    if (fetchInterval) {
      const intervalId = setInterval(fetchAndSetRooms, fetchInterval);
      return () => clearInterval(intervalId);
    }
  }, []);

  React.useEffect(() => {
    if (setRoomsShown) setRoomsShown(roomIds.length);
  }, [roomIds]);

  React.useEffect(() => {
    setUIState({ storedSelections: selections });
  }, [selections]);

  const _updateSelections = (newSelections) =>
    setSelections((prev) => ({ ...prev, ...newSelections }));

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
          data={Object.values(populatedRooms.data || {})}
          config={selectionConfig}
          selections={selections}
          onChange={_updateSelections}
        />
      ) : (
        <RoomsMonitor
          context={context}
          populatedRooms={_pickBy(
            populatedRooms.data || {},
            (_, id) => selections[id]
          )} // provide only the selected rooms
          isLoading={populatedRooms.isFetching ? roomIds : []}
        />
      )}
    </div>
  );
}

RecentMonitor.propTypes = {
  context: PropTypes.string.isRequired,
  config: PropTypes.shape({}).isRequired,
  fetchRooms: PropTypes.func.isRequired,
  setRoomsShown: PropTypes.func,
  fetchInterval: PropTypes.number,
  selectionConfig: PropTypes.arrayOf(PropTypes.shape({})),
};

RecentMonitor.defaultValues = {
  setRoomsShown: null,
  fetchInterval: null,
  selectionConfig: null,
};

export default RecentMonitor;
