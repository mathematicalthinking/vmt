import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { usePopulatedRooms } from 'utils';
import { Loading } from 'Components';
import classes from './monitoringView.css';
import RoomsMonitor from './RoomsMonitor';

/**
 * The TemplatePreview provides an overview of the rooms that were created from a template.  This view is
 * similar to CourseMonitor except that there is an overall dropdown for selecting which tab and / or screen to show on ALL the room tiles. (@TODO How will
 * we determine which screen numbers to show? Somehow get maximum number of screens or just show only screens for
 * which at least one room has a template?)
 */

function TemplatePreview({ activity }) {
  const [tabSelection, setTabSelection] = React.useState();
  const [isThumbnailSelected, setIsThumbnailSelected] = React.useState(false);

  // Because "useQuery" is the equivalent of useState, do this
  // initialization of queryStates (an object containing the states
  // for the API-retrieved data) at the top level rather than inside
  // of a useEffect.
  const roomIds = activity.rooms
    .sort(
      (a, b) =>
        // Sort the rooms into reverse chronological order (most recently changed first) as of when the course was loaded
        new Date(b.updatedAt) - new Date(a.updatedAt)
    )
    .map((room) => room._id);
  const populatedRooms = usePopulatedRooms(roomIds, false, {
    refetchInterval: 10000, // @TODO Should experiment with longer intervals to see what's acceptable to users (and the server)
  });

  if (populatedRooms.isError) return <div>There was an error</div>;
  if (!populatedRooms.isSuccess) return <Loading message="Getting the rooms" />;

  return (
    <div className={classes.Container}>
      {isThumbnailSelected && activity.tabs && activity.tabs.length > 1 && (
        <div className={classes.MainSelect}>
          <Select
            options={activity.tabs.map((tab, index) => {
              return { value: index, label: tab.name };
            })}
            value={tabSelection}
            onChange={(selectedOption) => {
              setTabSelection(selectedOption);
            }}
            placeholder="Select a Tab..."
          />
        </div>
      )}
      <RoomsMonitor
        populatedRooms={populatedRooms.data}
        tabIndex={tabSelection && tabSelection.value}
        onThumbnailSelected={setIsThumbnailSelected}
      />
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
