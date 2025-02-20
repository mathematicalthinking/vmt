import React from 'react';
import PropTypes from 'prop-types';
import _keyBy from 'lodash/keyBy';
import { SimpleLoading } from 'Components';
import { usePopulatedRooms, useSortableData } from 'utils';
import classes from './monitoringView.css';
import RoomsMonitor from './RoomsMonitor';

/**
 * The TemplatePreview provides an overview of the rooms that were created from a template.  This view is
 * similar to CourseMonitor except that there is an overall dropdown for selecting which tab and / or screen to show on ALL the room tiles. (@TODO How will
 * we determine which screen numbers to show? Somehow get maximum number of screens or just show only screens for
 * which at least one room has a template?)
 */

function TemplatePreview({ activity }) {
  const config = {
    key: 'updatedAt',
    direction: 'descending',
  };

  const roomIds = activity.rooms.map((room) => room._id);

  const populatedRooms = usePopulatedRooms(roomIds, false, {
    refetchInterval: 10000, // @TODO Should experiment with longer intervals to see what's acceptable to users (and the server)
  });

  const { items: rooms } = useSortableData(
    Object.values(populatedRooms.data || {}),
    config
  );

  if (populatedRooms.isError) return <div>There was an error</div>;

  return (
    <div className={classes.Container}>
      {populatedRooms.isLoading ? (
        <SimpleLoading />
      ) : (
        <RoomsMonitor
          context={`template-${activity._id}`}
          populatedRooms={_keyBy(rooms, '_id')}
          isLoading={populatedRooms.isFetching ? roomIds : []}
        />
      )}
    </div>
  );
}

TemplatePreview.propTypes = {
  activity: PropTypes.shape({
    rooms: PropTypes.arrayOf(PropTypes.shape({})),
    tabs: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
};

export default TemplatePreview;
