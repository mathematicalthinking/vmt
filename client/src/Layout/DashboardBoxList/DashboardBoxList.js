import React from 'react';
import moment from 'moment';
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
  } = props;
  let listElems = 'No activity within specified time period';
  if (list.length > 0) {
    listElems = list.map((item) => {
      if (item) {
        const details = {
          eventsCount: item.eventsCount,
          messagesCount: item.messagesCount,
          updatedAt: moment(item.updatedAt).format('MM/DD/YYYY h:mm:ss A'),
        };

        if (resource === 'rooms') {
          details.activeMembers = item.activeMembers;
        }

        if (resource === 'users') {
          details.activeRooms = item.activeRooms;

          details.latestIpAddress = item.latestIpAddress || 'Unknown';
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
              details={details}
              listType={listType}
              resource={resource}
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
  resultsMessage: PropTypes.bool,
};

dashboardBoxList.defaultProps = {
  maxHeight: null,
  scrollable: false,
  linkSuffix: null,
  linkPath: null,
  resultsMessage: null,
};

export default dashboardBoxList;
