import React from 'react';
import PropTypes from 'prop-types';
import { SimpleChat, ToggleGroup, CurrentMembers } from 'Components';
import classes from './roomViewer.css';
import Thumbnails from './Thumbnails';

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
  const constants = {
    SIMPLE: 'Simple Chat',
    DETAILED: 'Detailed Chat',
  };

  const [chatType, setChatType] = React.useState(constants.DETAILED);

  return (
    <div className={classes.Container}>
      <div className={classes.Thumbnails}>
        <Thumbnails populatedRoom={populatedRoom} defaultLabel="Thumbnail" />
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
            <SimpleChat
              isSimplified={chatType === constants.SIMPLE}
              log={populatedRoom.chat}
            />
          </div>
          <ToggleGroup
            buttons={[constants.DETAILED, constants.SIMPLE]}
            value={chatType}
            onChange={setChatType}
          />
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
            {`Members: ${populatedRoom.members.length}; Currently: ${populatedRoom.currentMembers.length}`}
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
