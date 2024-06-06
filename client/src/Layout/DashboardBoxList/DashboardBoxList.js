import React from 'react';
import PropTypes from 'prop-types';
import DashboardContentBox from '../../Components/UI/ContentBox/DashboardContentBox';
import classes from './dashboardBoxList.css';

const dashboardBoxList = (props) => {
  const {
    list,
    listType,
    resource,
    linkPath,
    linkSuffix,
    maxHeight,
    scrollable,
    resultsMessage,
    manageUser,
    ownUserId,
    getIconActions,
  } = props;
  let listElems = 'No activity within specified time period';
  if (list.length > 0) {
    listElems = list.map((item) => {
      if (item) {
        const details = {
          eventsCount: item.eventsCount,
          messagesCount: item.messagesCount,
          updatedAt: item.updatedAt,
        };

        if (resource === 'rooms') {
          details.activeMembers = item.activeMembers;
        }

        if (resource === 'users') {
          details.activeRooms = item.activeRooms;

          details.latestIpAddress = item.latestIpAddress || 'Unknown';
          details._id = item._id;
          details.socketId = item.socketId;
          details.isSuspended = item.isSuspended;
        }

        return (
          <div className={classes.ContentBox} key={item._id}>
            <DashboardContentBox
              title={item.name || item.username}
              link={linkPath ? `${linkPath}${item._id}${linkSuffix}` : null}
              key={item._id}
              id={item._id}
              image={item.image}
              roomType={
                item && item.tabs ? item.tabs.map((tab) => tab.tabType) : null
              }
              locked={item.privacySetting === 'private'} // @TODO Should it appear locked if the user has access ? I can see reasons for both
              details={item}
              listType={listType}
              resource={resource}
              manageUser={manageUser}
              isSelf={item._id === ownUserId}
              iconActions={getIconActions(
                item,
                resource,
                item._id === ownUserId
              )}
            />
          </div>
        );
      }
      return null;
    });
  }
  return (
    <div
      className={classes.Container}
      style={
        scrollable
          ? {
              maxHeight,
              overflowY: 'scroll',
              border: '1px solid #ddd',
              padding: 10,
            }
          : null
      }
      data-testid="box-list"
    >
      {list.length > 0 ? (
        <p className={classes.ResultsMessage}>{resultsMessage}</p>
      ) : null}
      {listElems}
    </div>
  );
};

dashboardBoxList.propTypes = {
  list: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  listType: PropTypes.string.isRequired,
  resource: PropTypes.string.isRequired,
  linkPath: PropTypes.string,
  linkSuffix: PropTypes.string,
  maxHeight: PropTypes.number,
  scrollable: PropTypes.bool,
  resultsMessage: PropTypes.string,
  manageUser: PropTypes.func.isRequired,
  ownUserId: PropTypes.string.isRequired,
  getIconActions: PropTypes.func.isRequired,
};

dashboardBoxList.defaultProps = {
  maxHeight: null,
  scrollable: false,
  linkSuffix: null,
  linkPath: null,
  resultsMessage: null,
};

export default dashboardBoxList;
