import React, { Component } from "react";
import classes from "./tabs.css";
class Tabs extends Component {
  shouldComponentUpdate(nextProps) {
    if (nextProps.currentTab !== this.props.currentTab) {
      return true;
    } else if (nextProps.tabs.length !== this.props.tabs.length) {
      return true;
    } else return false;
  }

  render() {
    let {
      tabs,
      currentTab,
      ntfTabs,
      role,
      changeTab,
      createNewTab,
      participantCanCreate
    } = this.props;
    console.log(participantCanCreate);
    let tabEls = tabs.map((tab, i) => (
      <div
        key={tab._id}
        onClick={() => changeTab(i)}
        className={[classes.Tab, currentTab === i ? classes.Active : ""].join(
          " "
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
        {role === "facilitator" || participantCanCreate ? (
          <div className={[classes.Tab, classes.NewTab].join(" ")}>
            <div onClick={createNewTab} className={classes.TabBox}>
              <i className="fas fa-plus" />
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default Tabs;
