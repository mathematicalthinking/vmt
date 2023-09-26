import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { TabTypes } from 'Model';

const SharedMiniReplayer = ({ populatedRoom }) => {
  const defaultOption = { label: 'Tab most recently changed', value: -1 };
  const [currentTabId, setCurrentTabId] = React.useState();
  const [tabSelection, setTabSelection] = React.useState(defaultOption);

  React.useEffect(() => {
    if (!populatedRoom || !populatedRoom.tabs) return;
    const latestTab = populatedRoom.tabs.reduce(
      (maxTab, tab) => (tab.updatedAt > maxTab.updatedAt ? tab : maxTab),
      populatedRoom.tabs[0]
    );
    setCurrentTabId(latestTab._id);
  }, [populatedRoom.tabs]);

  const _startingPoint = (tab) => tab.startingPoint || tab.startingPointBase64;

  const _currentState = (tab) => tab.currentState || tab.currentStateBase64;

  const _shouldDisplay = (tabId) => {
    const comparison =
      tabSelection.value === -1 ? currentTabId : tabSelection.value;
    return tabId === comparison;
  };

  const _tabOptions = () => {
    const tabOptions = populatedRoom.tabs.map((tab) => ({
      label: tab.name,
      value: tab._id,
    }));
    return [defaultOption, ...tabOptions];
  };

  return (
    <Fragment>
      {populatedRoom.tabs.length > 1 && (
        <Select
          // className={classes.Select}
          options={_tabOptions()}
          value={tabSelection}
          onChange={setTabSelection}
          placeholder="Select a Tab..."
          isSearchable={false}
        />
      )}
      {populatedRoom.tabs.map((tab) => (
        <div
          key={tab._id}
          style={{
            display: _shouldDisplay(tab._id) ? 'block' : 'none',
            height: '100%',
          }}
        >
          <TabTypes.MathspaceMiniReplayer
            type={tab.tabType}
            startingPoint={_startingPoint(tab)}
            currentState={_currentState(tab)}
            currentScreen={tab.currentScreen}
          />
        </div>
      ))}
    </Fragment>
  );
};

SharedMiniReplayer.propTypes = {
  // match: PropTypes.shape({}).isRequired,
  populatedRoom: PropTypes.shape({
    _id: PropTypes.string,
    tabs: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        timestamp: PropTypes.number,
        currentScreen: PropTypes.number,
      })
    ),
  }).isRequired,
};

export default SharedMiniReplayer;
