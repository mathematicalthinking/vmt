import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { usePopulatedRoom } from 'utils';
import classes from './monitoringView.css';
import RoomsMonitor from './RoomsMonitor';

/**
 * The TemplatePreview provides three views into a set of rooms: activity graph, thumbnail, and chat. Users can
 * select which of all the rooms they manage (from rooms). The set of rooms are the rooms that were instantiated
 * from the current template (given by the activityId prop -- and maybe some other useful props TBD).
 *
 * The component is similar to MonitoringView in that the views of the rooms are laid out as tiles. Additionally,
 * hovering on the three dots next to a title brings up a menu: Enter Room, Manage Members, Open Replayer, and View Room Stats.
 * However, differences vs. MonitoringView are:
 * - The tiles have their room NUMBER at top
 * - there is an overall dropdown for selecting which tab and / or screen to show on ALL the room tiles. (@TODO How will
 *      we determine which screen numbers to show? Somehow get maximum number of screens or just show only screens for
 *      which at least one room has a template?)
 * - there is no sense of "selecting" which rooms to preview. ALL rooms for the current template are shown.
 * on the notification icon brings up the notifications in a modal window for that room (@TODO).
 *
 * @TODO Decide whether TemplatePreview should connect to the Redux store to maintain the state of the preview, such as the size
 * of room tiles, which type of preview is selected (thumbail, stat), which screen or tab of the template is being shown.
 *
 *
 */

function TemplatePreview({ activity }) {
  const [tabSelection, setTabSelection] = React.useState();
  const [isThumbnailSelected, setIsThumbnailSelected] = React.useState(false);

  // Because "useQuery" is the equivalent of useState, do this
  // initialization of queryStates (an object containing the states
  // for the API-retrieved data) at the top level rather than inside
  // of a useEffect.
  const queryStates = {};
  activity.rooms.forEach((roomId) => {
    queryStates[roomId] = usePopulatedRoom(
      roomId,
      true,
      // Check for updates every 10 sec. If we are viewing rooms (i.e., Chat, Thumbnail, or Graph), then we need
      // to update only the currently selected rooms. If we are selecting rooms via the selection table, then we
      // should try to update all rooms so that the "current in room" column remains correct.
      {
        refetchInterval: 10000, // @TODO Should experiment with longer intervals to see what's acceptable to users (and the server)
      }
    );
  });

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
        populatedRooms={activity.rooms
          .filter((roomId) => queryStates[roomId].isSuccess)
          .reduce(
            (res, roomId) => ({
              ...res,
              [roomId]: queryStates[roomId].data,
            }),
            {}
          )}
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
