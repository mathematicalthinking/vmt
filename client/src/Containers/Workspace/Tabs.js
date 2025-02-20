import React from 'react';
import PropTypes from 'prop-types';
import classes from './tabs.css';

const Tabs = ({
  tabs,
  currentTabId,
  ntfTabs,
  onChangeTab,
  onCreateNewTab,
  canCreate,
}) => {
  const tabEls = tabs.map((tab, i) => (
    <div
      key={tab._id || i}
      onClick={() => onChangeTab(tab._id)}
      onKeyPress={() => onChangeTab(tab._id)}
      role="button"
      tabIndex="-2"
      className={[
        classes.Tab,
        tab._id === currentTabId ? classes.Active : '',
      ].join(' ')}
      style={{ zIndex: tabs.length - i }}
    >
      <div style={{ zIndex: tabs.length - i }} className={classes.TabBox}>
        <span className={classes.TabName}>{tab.name}</span>
      </div>
      {tab._id !== currentTabId && ntfTabs.includes(tab._id) ? (
        <div className={classes.TabNotification}>
          <i className="fas fa-exclamation" />
        </div>
      ) : null}
    </div>
  ));
  return (
    <div className={classes.WorkspaceTabs} data-testid="tabs-container">
      {tabEls}
      {canCreate ? (
        <div className={[classes.Tab, classes.NewTab].join(' ')}>
          <div
            onClick={onCreateNewTab}
            onKeyPress={onCreateNewTab}
            role="button"
            tabIndex="-3"
            className={classes.TabBox}
          >
            <i data-testid="add-tab" className="fas fa-plus" />
          </div>
        </div>
      ) : null}
    </div>
  );
};

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  canCreate: PropTypes.bool,
  currentTabId: PropTypes.string.isRequired,
  ntfTabs: PropTypes.arrayOf(PropTypes.shape({})),
  onChangeTab: PropTypes.func,
  onCreateNewTab: (props, propName) => {
    if (props.canCreate && !props[propName]) {
      throw new Error(
        'if participants can create tabs, a create tab function must be provided'
      );
    }
  },
};

Tabs.defaultProps = {
  onChangeTab: () => {},
  onCreateNewTab: () => {},
  ntfTabs: [],
  canCreate: false,
};

export default Tabs;
