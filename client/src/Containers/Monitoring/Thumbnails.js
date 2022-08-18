/* eslint-disable prettier/prettier */
import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { useSnapshots } from 'utils/utilityHooks';
import classes from './monitoringView.css';

export default function Thumbnails({
  populatedRoom,
  defaultLabel,
  alwaysShowLabel,
  initialTabIndex,
  initialScreen,
}) {
  const [tabSelection, setTabSelection] = React.useState();
  const [screenSelection, setScreenSelection] = React.useState();
  const [thumbnail, setThumbnail] = React.useState();

  // Functions for accessing information in the snapshot object.
  // getKeys() returns an array of all the keys being used for snapshots
  // getSnapshot(key) returns the snapshot (dataURL) at that key
  // getTimestamp(key) returns the timestamp (Unix epoch time) at that key
  const { getKeys, getSnapshot, getTimestamp } = useSnapshots(
    () => {},
    populatedRoom.tabs
      ? populatedRoom.tabs.reduce(
          (acc, tab) => ({ ...acc, ...tab.snapshot }),
          {}
        )
      : {}
  );

  // Allow for the parent to set the initial selection. Do nothing if we receive the default values
  React.useEffect(() => {
    if (
      initialTabIndex !== -1 &&
      populatedRoom.tabs &&
      populatedRoom.tabs.length > initialTabIndex
    ) {
      setTabSelection(_tabOptions(populatedRoom.tabs)[initialTabIndex]);
    }
    if (initialScreen !== -1) setScreenSelection(initialScreen);
  }, [initialTabIndex, initialScreen]);

  // Update the thumbnail either when the selection changes or when new data come in (potentially a new snapshot)
  React.useEffect(() => {
    let snapshot;
    if (!screenSelection) {
      snapshot = _getMostRecentSnapshot(tabSelection && tabSelection.value);
    } else {
      snapshot = getSnapshot({
        // if there's not a current tab selection, then just grab the first (and only) tab id.
        currentTabId: tabSelection
          ? tabSelection.value
          : getKeys()[0].currentTabId,
        currentScreen: screenSelection && screenSelection.value,
      });
    }

    setThumbnail(snapshot);
  }, [tabSelection, screenSelection, populatedRoom]);

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

  const _tabOptions = (tabs) => {
    return tabs.map((tab) => {
      return { value: tab._id, label: tab.name };
    });
  };
  const _tabsAndScreens = () => {
    const tabs = populatedRoom.tabs || [];
    const tabOptions = _tabOptions(tabs);

    let screens = [];
    if (tabOptions.length === 1) {
      screens = _getScreens(tabOptions[0].value);
    } else if (tabSelection) {
      screens = _getScreens(tabSelection.value);
    }

    const screenOptions = screens
      .sort((a, b) => a - b)
      .map((screen) => {
        return { value: screen, label: `Screen ${screen + 1}` };
      });

    // Display something only if there's a tab selection, screen selection, or default label
    return tabOptions.length > 1 || screenOptions.length > 1 || defaultLabel ? (
      <div
        className={classes.Title}
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '5px',
        }}
      >
        {(alwaysShowLabel ||
          (!(tabOptions.length > 1) && !(screenOptions.length > 1))) &&
          defaultLabel}
        {tabOptions.length > 1 && (
          <Select
            className={classes.Select}
            options={tabOptions}
            value={tabSelection}
            onChange={(selectedOption) => {
              setTabSelection(selectedOption);
              // reset the screen selection when a tab is selected
              setScreenSelection(0);
            }}
            placeholder="Select a Tab..."
          />
        )}
        {screenOptions.length > 1 && (
          <Select
            className={classes.Select}
            options={screenOptions}
            value={screenSelection}
            onChange={setScreenSelection}
            placeholder="Select a Screen..."
          />
        )}
      </div>
    ) : null;
  };

  return (
    <div className={classes.TileContainer}>
      {_tabsAndScreens()}
      {thumbnail ? (
        <img alt="Thumbnail of room" src={thumbnail} />
      ) : (
        <span className={classes.NoSnapshot}>No thumbnail currently</span>
      )}
    </div>
  );
}

Thumbnails.propTypes = {
  populatedRoom: PropTypes.shape({}).isRequired,
  defaultLabel: PropTypes.string,
  initialTabIndex: PropTypes.number,
  initialScreen: PropTypes.number,
  alwaysShowLabel: PropTypes.bool,
};

Thumbnails.defaultProps = {
  defaultLabel: '',
  initialTabIndex: -1,
  initialScreen: -1,
  alwaysShowLabel: false,
};
