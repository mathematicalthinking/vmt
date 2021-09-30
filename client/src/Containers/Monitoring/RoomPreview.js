/* eslint-disable prettier/prettier */
/* eslint-disable no-shadow */
/* eslint-disable no-undef */

import React from 'react';
import PropTypes from 'prop-types';
import { usePopulatedRoom } from 'utils/utilityHooks';
import { SimpleChat, ToggleGroup } from 'Components';
import classes from './monitoringView.css';
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

function RoomPreview({ roomId }) {
  const constants = {
    SIMPLE: 'Simple Chat',
    DETAILED: 'Detailed Chat',
  };

  const [chatType, setChatType] = React.useState(constants.DETAILED);
  const { isSuccess, data } = usePopulatedRoom(roomId, false, {
    refetchInterval: 10000, // check for new info every 10 seconds
  });

  return (
    <div className={classes.Container}>
      <div className={classes.TileGroup}>
        <div className={classes.Tile}>
          {
            <Thumbnails
              populatedRoom={isSuccess ? data : {}}
              defaultLabel="Thumbnail"
            />
          }
        </div>
        <div>
          <div className={classes.Tile}>
            <div className={classes.TileContainer}>
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
                {isSuccess ? 'Chat' : 'Loading...'}
              </div>
              <SimpleChat
                isSimplified={chatType === constants.SIMPLE}
                log={isSuccess ? data.chat : []}
              />
            </div>
          </div>
          <ToggleGroup
            buttons={[constants.DETAILED, constants.SIMPLE]}
            value={chatType}
            onChange={setChatType}
          />
        </div>
      </div>
    </div>
  );
}

RoomPreview.propTypes = {
  roomId: PropTypes.string.isRequired,
};

export default RoomPreview;
