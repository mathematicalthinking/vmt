import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { SimpleChat, CurrentMembers, Slider } from 'Components';
import Thumbnails from './Thumbnails';
import classes from './roomViewer.css';

/**
 * The RoomPreview provides two views into a rooms: thumbnail and chat. Users can
 * select which tab (if more than one) and / or screen (if a DesmosActivity) they want to view in the thumbnail.  We don't need
 * chart because the Stats tab has this already. The Chat tile is always
 * the same, but the thumbnail changes depending on the tab/screen selection.
 *
 * Because this view appears in the lobby, we don't need the room title or actions menu on the thumbnail tile.
 *
 * We don't need to keep track of selections, as those might change as the room changes. However, we *DO* need to keep
 * the possible selections available in the drop-downs up to date. For example, if a new tab gets created, that should
 * be reflected in the dropdown.
 *
 *
 * NOTES:
 *  - The snapshot keys are of the form {currentTabId: string, currentScreen: number}. These keys are generated in the
 *    Workspace container, where the snapshots are taken.
 */

function RoomViewer({ populatedRoom }) {
  const [isSimplified, setIsSimplified] = React.useState(false);

  const toTimelineString = (timestamp) => {
    const oneWeekAgo = moment().subtract(7, 'days');
    const oneYearAgo = moment().subtract(1, 'year');
    const momentTimestamp = moment.unix(timestamp / 1000);
    let format = 'ddd h:mm:ss a';
    if (momentTimestamp.isBefore(oneYearAgo)) {
      format = 'MMMM Do YYYY, h:mm:ss a';
    } else if (momentTimestamp.isBefore(oneWeekAgo)) {
      format = 'MMMM Do, h:mm:ss a';
    }

    return momentTimestamp.format(format);
  };

  return (
    <div className={classes.Container}>
      <div className={classes.Thumbnails}>
        <Thumbnails
          populatedRoom={populatedRoom}
          defaultLabel={`Thumbnail last updated ${toTimelineString(
            new Date(populatedRoom.updatedAt)
          )}`}
          alwaysShowLabel
        />
      </div>
      <div className={classes.Aside}>
        <div className={classes.ChatSection}>
          <div
            className={classes.Title}
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              marginBottom: '5px',
            }}
          >
            Chat
          </div>
          <div className={classes.Chat}>
            <SimpleChat isSimplified={isSimplified} log={populatedRoom.chat} />
          </div>
          <div className={!isSimplified ? classes.SliderOn : classes.Slider}>
            Detailed Chat
            <Slider
              data-testid="simple-chat"
              action={() => setIsSimplified(!isSimplified)}
              isOn={!isSimplified}
              name="isSimplified"
            />
          </div>
        </div>
        <div className={classes.AttendanceSection}>
          <div
            className={classes.Title}
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              marginBottom: '5px',
            }}
          >
            {`Attendance (Members: ${populatedRoom.members.length}; Currently: ${populatedRoom.currentMembers.length})`}
          </div>
          <CurrentMembers
            members={populatedRoom.members}
            currentMembers={populatedRoom.members.map((m) => m.user)}
            activeMember={populatedRoom.currentMembers.map((m) => m._id)}
            expanded
            showTitle={false}
          />
        </div>
      </div>
    </div>
  );
}

RoomViewer.propTypes = {
  populatedRoom: PropTypes.shape({
    chat: PropTypes.arrayOf(PropTypes.shape({})),
    members: PropTypes.arrayOf(PropTypes.shape({})),
    currentMembers: PropTypes.arrayOf(PropTypes.shape({})),
  }),
};

RoomViewer.defaultProps = {
  populatedRoom: { chat: [], members: [], currentMembers: [] },
};

export default RoomViewer;
