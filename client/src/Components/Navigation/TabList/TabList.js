import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classes from './tabList.css';
import Notification from '../../Notification/Notification';

const TabList = (props) => {
  const { routingInfo, tabs } = props;
  const { params, url } = routingInfo;
  const tabElems = tabs.map((tab) => {
    let style = classes.Tab;
    if (tab.name.toLowerCase() === params.resource) {
      style = [classes.Tab, classes.ActiveTab].join(' ');
    }
    const updatedUrl =
      url.replace(params.resource, '') + tab.name.toLowerCase();
    return (
      <Link
        to={updatedUrl}
        key={tab.name}
        id={tab.name}
        className={style}
        data-testid="tab"
      >
        {tab.name === 'Activities' ? 'Templates' : tab.name}
        {tab.notifications ? (
          <div className={classes.Notifications} data-testid="tab-ntf">
            {/* <span className={classes.NotificationCount}>
              {tab.notifications}
            </span> */}
            <Notification count={tab.notifications} />
          </div>
        ) : null}
      </Link>
    );
  });
  return <div className={classes.Tabs}>{tabElems}</div>;
};

TabList.propTypes = {
  routingInfo: PropTypes.shape({}).isRequired,
  tabs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default TabList;
