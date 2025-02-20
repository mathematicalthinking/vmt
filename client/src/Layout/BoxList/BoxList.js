import React from 'react';
import PropTypes from 'prop-types';
import { Room } from 'Model';
import { determineLinkPath } from 'utils';
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
    selectable,
    selectedIds,
    onSelect,
    icons,
  } = props;

  const timeDiff = (ts) => {
    if (!ts) return 'Never';
    const diff = new Date() - new Date(ts);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (seconds < 60) {
      return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    }
    if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    if (hours < 60) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // hide Preview icon if room is aliased & user is a participant
  const iconsToDiplay = (listItem) => {
    if (resource === 'rooms') {
      if (
        Room.getRoomSetting(listItem, Room.ALIASED_USERNAMES) &&
        listItem.myRole === 'participant'
      ) {
        return icons.filter((icon) => icon.title.toLowerCase() !== 'preview');
      }
    }
    return icons;
  };

  let listElems = "There doesn't appear to be anything here yet";
  if (list.length > 0) {
    listElems = list.map((item) => {
      if (item) {
        const details = {
          description: item.description,
          createdAt: item.createdAt
            ? item.createdAt.split('T')[0].toLocaleString()
            : '',
          dueDate: item.dueDate,
          facilitators: item.members
            ? item.members
                .filter((member) => member.role === 'facilitator')
                .map(
                  (member, x, arr) =>
                    `${member.user.username}${x < arr.length - 1 ? ', ' : ''}`
                )
            : [],
          sinceUpdated: timeDiff(item.updatedAt),
        };

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
          details.entryCode = item.entryCode;
        } else if (item.creator) {
          details.creator = item.creator.username;
        }
        return (
          <div className={classes.ContentBox} key={item._id}>
            {!draggable ? (
              <ContentBox
                title={item.name}
                link={
                  linkPath !== null
                    ? `${determineLinkPath(item, resource)}${
                        item._id
                      }${linkSuffix}`
                    : null
                }
                key={item._id}
                id={item._id}
                // image={item.image}
                selectable={selectable}
                isChecked={selectedIds.includes(item._id)}
                onSelect={onSelect}
                notifications={notificationCount}
                roomType={
                  item && item.tabs ? item.tabs.map((tab) => tab.tabType) : null
                }
                locked={item.privacySetting === 'private'} // @TODO Should it appear locked if the user has access ? I can see reasons for both
                details={details}
                listType={listType}
                customIcons={iconsToDiplay(item)}
                resource={resource}
              >
                {item.description}
              </ContentBox>
            ) : (
              <DragContentBox
                title={item.name}
                link={
                  linkPath !== null
                    ? `${linkPath}${item._id}${linkSuffix}`
                    : null
                }
                key={item._id}
                id={item._id}
                notifications={notifications}
                roomType={item.roomType}
                resource={resource}
                listType={listType}
                locked={item.privacySetting === 'private'} // @TODO Should it appear locked if the user has access ? I can see reasons for both
                details={details}
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
  linkPath: PropTypes.string,
  linkSuffix: PropTypes.string,
  draggable: PropTypes.bool,
  maxHeight: PropTypes.number,
  scrollable: PropTypes.bool,
  selectable: PropTypes.bool,
  selectedIds: PropTypes.arrayOf(PropTypes.string),
  onSelect: PropTypes.func,
  icons: PropTypes.arrayOf(PropTypes.shape({})),
};

boxList.defaultProps = {
  draggable: false,
  maxHeight: null,
  scrollable: false,
  selectable: false,
  selectedIds: [],
  onSelect: null,
  notifications: [],
  icons: null,
  linkPath: null,
  linkSuffix: null,
};

export default boxList;
