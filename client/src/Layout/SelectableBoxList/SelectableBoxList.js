import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Checkbox, ToolTip } from 'Components';
import SelectableContentBox from 'Components/UI/ContentBox/SelectableContentBox';
import { determineLinkPath } from 'utils';
import Expand from '../../Components/UI/ContentBox/expand';
import classes from './SelectableBoxList.css';

const SelectableBoxList = (props) => {
  const {
    list,
    listType,
    resource,
    notifications,
    linkPath,
    linkSuffix,
    selectActions, // array of actions (Buttons) i.e. Restore, Delete
    icons,
    customStyle,
  } = props;

  const [selectedIds, setSelectedIds] = useState([]);
  const [expandedById, setExpandedById] = useState({});
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // reduce list _ids into { _id: bool }
    const ids = list.reduce((acc, curr) => {
      return { ...acc, [curr._id]: expandedById[curr._id] || false };
    }, {});
    setExpandedById(ids);
  }, [list]);

  const handleSelectAll = (event) => {
    const { checked } = event.target;
    if (!checked) {
      setSelectedIds([]);
    } else {
      const ids = list.map((res) => res._id);
      setSelectedIds(ids);
    }
  };

  const handleSelectOne = (event, id) => {
    const { checked } = event.target;
    if (checked) {
      setSelectedIds((prevState) => [...prevState, id]);
    } else {
      setSelectedIds((prevState) => [...prevState.filter((el) => id !== el)]);
    }
  };

  const handleDeselectAll = () => {
    // this function is passed up to the parent component
    // and can be used to deselect all checkboxes once
    // certain selectAction onClicks are triggered
    setSelectedIds([]);
  };

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

  const listElems = "There doesn't appear to be anything here yet";
  if (list.length === 0) {
    return (
      <div className={classes.Container} data-testid="box-list">
        {listElems}
      </div>
    );
  }

  const allSelected = () => {
    return list.every((item) => selectedIds.includes(item._id));
  };

  const filterIds = () => {
    const listedIds = list.map((item) => item._id);
    return selectedIds.filter((id) => listedIds.includes(id));
  };

  const expandButton = (
    <ToolTip text="Expand/Collapse" delay={600}>
      <div
        className={classes.Expand}
        style={{
          transform: expanded ? `rotate(180deg)` : `rotate(0)`,
        }}
      >
        <Expand
          clickHandler={(e) => {
            e.preventDefault();
            // if selectedIds.length is 0, expand/contract all
            if (selectedIds.length === 0) {
              setExpandedById((prevState) => {
                const prevIds = Object.keys(prevState);
                prevIds.forEach((id) => (prevState[id] = !expanded));
                return prevState;
              });
              // otherwise expand/contract selectedIds
            } else {
              setExpandedById((prevState) => {
                selectedIds.forEach((id) => (prevState[id] = !expanded));
                return prevState;
              });
            }
            // change icon
            setExpanded((prevState) => !prevState);
          }}
        />
      </div>
    </ToolTip>
  );

  return (
    <div className={classes.Container} style={customStyle.container}>
      <div className={classes.Header} style={customStyle.header}>
        <Checkbox
          change={handleSelectAll}
          checked={allSelected()}
          dataId="select-all"
          style={customStyle.checkbox}
        >
          Select All
        </Checkbox>
        <div
          className={classes.SelectActions}
          style={customStyle.selectactions}
        >
          {selectActions.map((selectAction) => (
            <div
              onClick={(e) => {
                selectAction.onClick(e, filterIds(), handleDeselectAll);
              }}
              onKeyDown={(e) => {
                selectAction.onClick(e, filterIds(), handleDeselectAll);
              }}
              role="button"
              tabIndex={-1}
              // title={selectAction.title}
              key={`selectAction-${selectAction.title}`}
              style={customStyle.title}
              data-testid={`${selectAction.title}-icon`}
            >
              {selectAction.generateIcon
                ? selectAction.generateIcon(selectedIds)
                : selectAction.icon}
            </div>
          ))}
          {expandButton}
        </div>
      </div>

      <div className={classes.BoxList}>
        {list.map((item) => {
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
                        `${
                          member.user
                            ? member.user.username
                            : 'Username not found'
                        }${x < arr.length - 1 ? ', ' : ''}`
                    )
                : [],
              participants: item.members
                ? item.members
                    .filter((member) => member.role === 'participant')
                    .map(
                      (member, x, arr) =>
                        `${
                          member.user
                            ? member.user.username
                            : 'Username not found'
                        }${x < arr.length - 1 ? ', ' : ''}`
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
              <div
                className={classes.ContentBox}
                key={item._id}
                style={customStyle.contentbox}
              >
                <SelectableContentBox
                  title={item.name}
                  link={
                    // only allow default resources to be links
                    // disallow clicking on archived rooms
                    linkPath !== null && item.status === 'default'
                      ? `${determineLinkPath(item, resource)}${
                          item._id
                        }${linkSuffix}`
                      : null
                  }
                  key={item._id}
                  id={item._id}
                  isChecked={selectedIds.includes(item._id)}
                  onSelect={handleSelectOne}
                  notifications={notificationCount}
                  roomType={
                    item && item.tabs
                      ? item.tabs.map((tab) => tab.tabType)
                      : item.tabTypes
                  }
                  locked={item.privacySetting === 'private'}
                  details={details}
                  listType={listType}
                  customIcons={icons}
                  resource={resource}
                  customStyle={item.customStyle}
                  isExpanded={expandedById[item._id]}
                >
                  {item.description}
                </SelectableContentBox>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

SelectableBoxList.propTypes = {
  list: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  listType: PropTypes.string.isRequired,
  resource: PropTypes.string.isRequired,
  notifications: PropTypes.arrayOf(PropTypes.shape({})),
  linkPath: PropTypes.string,
  linkSuffix: PropTypes.string,
  selectActions: PropTypes.arrayOf(PropTypes.shape({})),
  icons: PropTypes.arrayOf(PropTypes.shape({})),
  customStyle: PropTypes.shape({
    container: PropTypes.shape({}),
    header: PropTypes.shape({}),
    selectactions: PropTypes.shape({}),
    contentbox: PropTypes.shape({}),
    title: PropTypes.shape({}),
    checkbox: PropTypes.shape({}),
  }),
};

SelectableBoxList.defaultProps = {
  selectActions: [],
  notifications: [],
  icons: null,
  linkPath: null,
  linkSuffix: null,
  customStyle: {},
};

export default SelectableBoxList;
