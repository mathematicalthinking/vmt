import React from 'react';
import PropTypes from 'prop-types';
import { usePopulatedRooms, useSortableData } from 'utils';
import RoomsMonitor from './RoomsMonitor';
import { SimpleLoading } from 'Components';

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
}) {
  const roomsToSort = React.useRef([]);
  const initialLoad = React.useRef(true);
  const [isLoading, setIsLoading] = React.useState(false);

  const { items: rooms } = useSortableData(roomsToSort.current, config);

  const roomIds = React.useMemo(() => rooms.map((room) => room._id), [rooms]);

  const populatedRooms = usePopulatedRooms(roomIds, false, {
    refetchInterval: 10000,
  });

  React.useEffect(() => {
    const fetchAndSetRooms = async () => {
      if (initialLoad.current) setIsLoading(true);
      roomsToSort.current = await fetchRooms();
      if (initialLoad.current) {
        setIsLoading(false);
        initialLoad.current = false;
      }
    };

    fetchAndSetRooms();

    const intervalId = setInterval(fetchAndSetRooms, fetchInterval);

    return () => clearInterval(intervalId);
  }, []);

  React.useEffect(() => {
    if (setRoomsShown) setRoomsShown(roomIds.length);
  }, [roomIds]);

  if (populatedRooms.isError) return <div>There was an error.</div>;

  return (
    <div>
      {populatedRooms.isLoading || isLoading ? (
        <SimpleLoading />
      ) : (
        <RoomsMonitor
          context={context}
          populatedRooms={populatedRooms.data || {}}
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
};

RecentMonitor.defaultValues = {
  setRoomsShown: null,
  fetchInterval: 10000, // 10 second default
};

export default RecentMonitor;
