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
    if (initialScreen !== -1) setScreenSelection(_screenOption(initialScreen));
  }, [initialTabIndex, initialScreen]);

  // Update the thumbnail either when the selection changes or when new data come in (potentially a new snapshot)
  React.useEffect(() => {
    // if there's no tabselection, get the most recent snapshot among any snapshot
    // if there is a tabselection but no screenselection, get the most recent from among the tab's screens (if any,
    //        if it has no screens, just leave things as they are)
    // if there's both a tab and screen selection, set the thumbnail appropriately

    let key;
    if (!tabSelection) {
      key = _getMostRecentSnapshotKey() || {
        currentTabId: 'dummy',
        currentScreen: 0,
      };
      setTabSelection(
        _tabOptions(populatedRoom.tabs).find(
          (option) => option.value === key.currentTabId
        )
      );
    } else if (!screenSelection) {
      key = _getMostRecentSnapshotKey(tabSelection && tabSelection.value);
      setScreenSelection(_screenOption(key.currentScreen));
    } else
      key = {
        currentTabId: tabSelection
          ? tabSelection.value
          : getKeys()[0].currentTabId,
        currentScreen: screenSelection.value,
      };
    setThumbnail(getSnapshot(key));
  }, [tabSelection, screenSelection, populatedRoom]);

  /**
   *
   * HELPER FUNCTIONS
   *
   */

  const _getMostRecentSnapshotKey = (tabId) => {
    let relevantKeys = getKeys(); // if no tabId, return the most recent of all the room's snapshots
    if (tabId) {
      relevantKeys = relevantKeys.filter((key) => key.currentTabId === tabId);
    }
    let maxSoFar = 0;
    let result = null;
    relevantKeys.forEach((key) => {
      if (getTimestamp(key) > maxSoFar) {
        maxSoFar = getTimestamp(key);
        result = key;
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

  const _tabOptions = (tabs = []) => {
    return tabs.map((tab) => {
      return { value: tab._id, label: tab.name };
    });
  };

  const _screenOption = (screen) => ({
    value: screen,
    label: `Screen ${screen + 1}`,
  });

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
      .map((screen) => _screenOption(screen));

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
              setScreenSelection(null);
            }}
            placeholder="Select a Tab..."
            isSearchable={false}
          />
        )}
        {screenOptions.length > 1 && (
          <Select
            className={classes.Select}
            options={screenOptions}
            value={screenSelection}
            onChange={setScreenSelection}
            placeholder="Select a Screen..."
            isSearchable={false}
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
  populatedRoom: PropTypes.shape({
    tabs: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
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
