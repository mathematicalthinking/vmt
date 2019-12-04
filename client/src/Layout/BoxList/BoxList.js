import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import ContentBox from '../../Components/UI/ContentBox/ContentBox';
import DragContentBox from '../../Components/UI/ContentBox/DragContentBox';
import classes from './boxList.css';

const boxList = (props) => {
  const {
    list,
    listType,
    resource,
    notifications,
    linkPath,
    linkSuffix,
    draggable,
    maxHeight,
    scrollable,
    isDashboard,
  } = props;
  let listElems = "There doesn't appear to be anything here yet";
  if (list.length > 0) {
    listElems = list.map((item) => {
      if (item) {
        let details = {
          description: item.description,
          facilitators: item.members
            ? item.members
                .filter((member) => member.role === 'facilitator')
                .map(
                  (member, x, arr) =>
                    `${member.user.username}${x < arr.length - 1 ? ', ' : ''}`
                )
            : [],
        };

        if (isDashboard) {
          details = {
            eventsCount: item.eventsCount,
            messagesCount: item.messagesCount,
            activeMembers: item.activeMembers
              ? item.activeMembers.map(
                  (member, x, arr) =>
                    `${member.username}${x < arr.length - 1 ? ', ' : ''}`
                )
              : [],
            updatedAt: moment(item.updatedAt).format('MM/DD/YYYY h:mm:ss A'),
          };
        }
        let notificationCount = 0;
        if (listType === 'private') {
          if (notifications.length > 0) {
            notifications.forEach((ntf) => {
              if (
                ntf.resourceId === item._id ||
                ntf.parentResource === item._id
              ) {
                notificationCount += 1;
              }
            });
          }
          details = {
            entryCode: item.entryCode,
          };
        } else if (item.creator) {
          details.creator = item.creator.username;
        }
        return (
          <div className={classes.ContentBox} key={item._id}>
            {!draggable ? (
              <ContentBox
                title={item.name}
                link={`${linkPath}${item._id}${linkSuffix}`}
                key={item._id}
                id={item._id}
                image={item.image}
                notifications={notificationCount}
                roomType={
                  item && item.tabs ? item.tabs.map((tab) => tab.tabType) : null
                }
                locked={item.privacySetting === 'private'} // @TODO Should it appear locked if the user has access ? I can see reasons for both
                details={details}
                listType={listType}
                isDashboard={isDashboard}
              >
                {item.description}
              </ContentBox>
            ) : (
              <DragContentBox
                title={item.name}
                link={`${linkPath}${item._id}${linkSuffix}`}
                key={item._id}
                id={item._id}
                notifications={notifications}
                roomType={item.roomType}
                resource={resource}
                listType={listType}
                locked={item.privacySetting === 'private'} // @TODO Should it appear locked if the user has access ? I can see reasons for both
                details={details}
                isDashboard={isDashboard}
              />
            )}
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
      {listElems}
    </div>
  );
};

boxList.propTypes = {
  list: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  listType: PropTypes.string.isRequired,
  resource: PropTypes.string.isRequired,
  notifications: PropTypes.arrayOf(PropTypes.shape({})),
  linkPath: PropTypes.string.isRequired,
  linkSuffix: PropTypes.string.isRequired,
  draggable: PropTypes.bool,
  maxHeight: PropTypes.number,
  scrollable: PropTypes.bool,
  isDashboard: PropTypes.bool,
};

boxList.defaultProps = {
  draggable: false,
  maxHeight: null,
  scrollable: false,
  notifications: [],
  isDashboard: false,
};

export default boxList;
