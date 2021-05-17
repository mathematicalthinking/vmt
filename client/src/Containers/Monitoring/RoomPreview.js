/* eslint-disable prettier/prettier */
/* eslint-disable no-shadow */
/* eslint-disable no-undef */

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { usePopulatedRoom, useSnapshots } from 'utils/utilityHooks';
import { SimpleChat } from 'Components';
import classes from './monitoringView.css';

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
  //   const [chatType, setChatType] = React.useState(constants.DETAILED);
  const [tabSelection, setTabSelection] = React.useState();
  const [screenSelection, setScreenSelection] = React.useState();
  const [thumbnail, setThumbnail] = React.useState();

  const { isSuccess, data } = usePopulatedRoom(roomId, false, {
    refetchInterval: 10000, // check for new info every 10 seconds
  });

  // Functions for accessing information in the snapshot object.
  // getKeys() returns an array of all the keys being used for snapshots
  // getSnapshot(key) returns the snapshot (dataURL) at that key
  // getTimestamp(key) returns the timestamp (Unix epoch time) at that key
  const { getKeys, getSnapshot, getTimestamp } = useSnapshots(
    () => {},
    isSuccess ? data.snapshot : {}
  );

  // Update the thumbnail either when the selection changes or when new data come in (potentially a new snapshot)
  React.useEffect(() => {
    let snapshot;
    if (!screenSelection) {
      snapshot = _getMostRecentSnapshot(tabSelection && tabSelection.value);
    } else {
      snapshot = getSnapshot({
        currentTabId: tabSelection && tabSelection.value,
        currentScreen: screenSelection && screenSelection.value,
      });
    }

    setThumbnail(snapshot);
  }, [tabSelection, screenSelection, data]);

  /**
   *
   * HELPER FUNCTIONS
   *
   */

  const _getMostRecentSnapshot = (tabId) => {
    let relevantKeys = getKeys(); // if no tabId, return the most recent of all the room's snapshots
    if (tabId) {
      relevantKeys = relevantKeys.filter((key) => key.currentTabId === tabId);
    }
    let maxSoFar = 0;
    let result = null;
    relevantKeys.forEach((key) => {
      if (getTimestamp(key) > maxSoFar) {
        maxSoFar = getTimestamp(key);
        result = getSnapshot(key);
      }
    });
    return result;
  };

  // returns an array of the screen numbers for which we have snapshots on this tab.
  const _getScreens = (tabId) => {
    const tabKeys = getKeys().filter((key) => key.currentTabId === tabId);
    return tabKeys.map((key) => key.currentScreen);
  };

  /**
   *
   * FUNCTION USED TO SIMPLIFY THE RENDER LOGIC. Creates the Select components, if needed, for tabs and screens.
   *
   */
  const _tabsAndScreens = () => {
    const tabOptions = data.tabs.map((tab) => {
      return { value: tab._id, label: tab.name };
    });

    let screens = [];
    if (tabOptions.length === 1) {
      screens = _getScreens(tabOptions[0].value);
    } else if (tabSelection) {
      screens = _getScreens(tabSelection.value);
    }

    const screenOptions = screens.sort().map((screen) => {
      return { value: screen, label: `Screen ${screen + 1}` };
    });

    return (
      <Fragment>
        {tabOptions.length > 1 && (
          <Select
            className={classes.Select}
            options={tabOptions}
            value={tabSelection}
            onChange={(selectedOption) => setTabSelection(selectedOption)}
            placeholder="Select a Tab..."
          />
        )}
        {screenOptions.length > 1 && (
          <Select
            className={classes.Select}
            options={screenOptions}
            value={screenSelection}
            onChange={(selectedOption) => setScreenSelection(selectedOption)}
            placeholder="Select a Screen..."
          />
        )}
        {!(tabOptions.length > 1) && !(screenOptions.length > 1) && 'Thumbnail'}
      </Fragment>
    );
  };

  return (
    <div className={classes.Container}>
      <div className={classes.TileGroup}>
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
              {isSuccess ? _tabsAndScreens() : 'Loading...'}
            </div>
            {thumbnail ? (
              <img alt="Snapshot of room" src={thumbnail} />
            ) : (
              <span className={classes.NoSnapshot}>No snapshot currently</span>
            )}
          </div>
        </div>
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
            <SimpleChat isSimplified={false} log={isSuccess ? data.chat : []} />
          </div>
        </div>
      </div>
    </div>
  );
}

RoomPreview.propTypes = {
  roomId: PropTypes.string.isRequired,
};

export default RoomPreview;
