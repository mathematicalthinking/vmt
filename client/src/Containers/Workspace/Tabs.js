import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './tabs.css';

class Tabs extends Component {
  // shouldComponentUpdate(nextProps) {
  //   if (nextProps.currentTab !== this.props.currentTab) {
  //     return true;
  //   } else if (nextProps.tabs.length !== this.props.tabs.length) {
  //     return true;
  //   } else if (nextProps.ntfTabs.length !== this.props.ntfTabs.length) {
  //     return true;
  //   } else return false;
  // }

  render() {
    const {
      tabs,
      currentTab,
      ntfTabs,
      memberRole,
      changeTab,
      createNewTab,
      participantCanCreate,
      replayer,
    } = this.props;
    const tabEls = tabs.map((tab, i) => (
      <div
        key={tab._id || i}
        onClick={!replayer ? () => changeTab(i) : null}
        onKeyPress={!replayer ? () => changeTab(i) : null}
        role="button"
        tabIndex="-2"
        className={[classes.Tab, currentTab === i ? classes.Active : ''].join(
          ' '
        )}
        style={{ zIndex: tabs.length - i }}
      >
        <div style={{ zIndex: tabs.length - i }} className={classes.TabBox}>
          <span className={classes.TabName}>{tab.name}</span>
        </div>
        {ntfTabs && ntfTabs.includes(tab._id) ? (
          <div className={classes.TabNotification}>
            <i className="fas fa-exclamation" />
          </div>
        ) : null}
      </div>
    ));
    return (
      <div className={classes.WorkspaceTabs}>
        {tabEls}
        {memberRole === 'facilitator' || participantCanCreate ? (
          <div className={[classes.Tab, classes.NewTab].join(' ')}>
            <div
              onClick={createNewTab}
              onKeyPress={createNewTab}
              role="button"
              tabIndex="-3"
              className={classes.TabBox}
            >
              <i className="fas fa-plus" />
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  participantCanCreate: PropTypes.bool.isRequired,
  currentTab: PropTypes.number.isRequired,
  ntfTabs: PropTypes.arrayOf(PropTypes.shape({})),
  memberRole: PropTypes.string.isRequired,
  replayer: PropTypes.bool,
  changeTab: PropTypes.func,
  createNewTab: (props, propName) => {
    if (props.participantCanCreate && !props[propName]) {
      throw new Error(
        'if participants can create a create function needs to be provided'
      );
    }
  },
};

Tabs.defaultProps = {
  changeTab: null,
  replayer: false,
  createNewTab: null,
  ntfTabs: [],
};

export default Tabs;
