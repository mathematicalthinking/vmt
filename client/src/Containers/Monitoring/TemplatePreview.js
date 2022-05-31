/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/label-has-associated-control */

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { NavItem, ToggleGroup, SimpleChat, CurrentMembers } from 'Components';
import { usePopulatedRoom } from 'utils';
import Chart from 'Containers/Stats/Chart';
import statsReducer, { initialState } from 'Containers/Stats/statsReducer';
import Thumbnails from './Thumbnails';
import classes from './monitoringView.css';
import DropdownMenuClasses from './dropdownmenu.css';

/**
 * The TemplatePreview provides three views into a set of rooms: activity graph, thumbnail, and chat. Users can
 * select which of all the rooms they manage (from rooms). The set of rooms are the rooms that were instantiated
 * from the current template (given by the activityId prop -- and maybe some other useful props TBD).
 *
 * The component is similar to MonitoringView in that the views of the rooms are laid out as tiles. Additionally,
 * hovering on the three dots next to a title brings up a menu: Enter Room, Manage Members, Open Replayer, and View Room Stats.
 * However, differences vs. MonitoringView are:
 * - The tiles have their room NUMBER at top
 * - there is an overall dropdown for selecting which tab and / or screen to show on ALL the room tiles. (@TODO How will
 *      we determine which screen numbers to show? Somehow get maximum number of screens or just show only screens for
 *      which at least one room has a template?)
 * - there is no sense of "selecting" which rooms to preview. ALL rooms for the current template are shown.
 * on the notification icon brings up the notifications in a modal window for that room (@TODO).
 *
 * @TODO Decide whether TemplatePreview should connect to the Redux store to maintain the state of the preview, such as the size
 * of room tiles, which type of preview is selected (thumbail, stat), which screen or tab of the template is being shown.
 *
 *
 */

function TemplatePreview({ activity }) {
  const constants = {
    CHAT: 'Chat',
    THUMBNAIL: 'Thumbnail',
    ATTENDANCE: 'Attendance',
    GRAPH: 'Graph',
    SIMPLE: 'Simple Chat',
    DETAILED: 'Detailed Chat',
  };

  const [viewType, setViewType] = React.useState(constants.ATTENDANCE);
  const [chatType, setChatType] = React.useState(constants.DETAILED);
  const [tabSelection, setTabSelection] = React.useState();

  // Because "useQuery" is the equivalent of useState, do this
  // initialization of queryStates (an object containing the states
  // for the API-retrieved data) at the top level rather than inside
  // of a useEffect.
  const queryStates = {};
  activity.rooms.forEach((roomId) => {
    queryStates[roomId] = usePopulatedRoom(
      roomId,
      true,
      // Check for updates every 10 sec. If we are viewing rooms (i.e., Chat, Thumbnail, or Graph), then we need
      // to update only the currently selected rooms. If we are selecting rooms via the selection table, then we
      // should try to update all rooms so that the "current in room" column remains correct.
      {
        refetchInterval: 10000, // @TODO Should experiment with longer intervals to see what's acceptable to users (and the server)
      }
    );
  });

  /**
   *
   * FUNCTIONS THAT ARE USED TO SIMPLIFY THE RENDER LOGIC
   *
   */

  const _makeMenu = (id) => {
    return [
      {
        name: 'Enter Room',
        link: `/myVMT/workspace/${id}`,
      },
      {
        name: 'Manage Members',
        link: `/myVMT/rooms/${id}/members`,
      },
      {
        name: 'Open Replayer',
        link: `/myVMT/workspace/${id}/replayer`,
      },
      {
        name: 'View/Export Room Stats',
        link: `/myVMT/rooms/${id}/stats`,
      },
    ];
  };

  // The isSuccess test is really not needed because we don't render unless it's true. However,
  // it just seems clearer to keep the test here as we are using queryStates[].data
  const _displayViewType = (id) => {
    switch (viewType) {
      case constants.GRAPH:
        return (
          <ChartUpdater
            log={queryStates[id].isSuccess ? queryStates[id].data.log : []}
          />
        );
      case constants.CHAT:
        return (
          <SimpleChat
            isSimplified={chatType === constants.SIMPLE}
            log={queryStates[id].isSuccess ? queryStates[id].data.chat : []}
          />
        );
      case constants.THUMBNAIL: {
        return (
          <Thumbnails
            populatedRoom={
              queryStates[id].isSuccess ? queryStates[id].data : {}
            }
            initialTabIndex={tabSelection ? tabSelection.value : undefined}
          />
        );
      }
      case constants.ATTENDANCE: {
        const data = queryStates[id].isSuccess ? queryStates[id].data : null;
        return (
          <CurrentMembers
            members={data ? data.members : []}
            currentMembers={data ? data.members.map((m) => m.user) : []}
            activeMember={data ? data.currentMembers.map((m) => m._id) : []}
            expanded
            showTitle={false}
          />
        );
      }
      default:
        return null;
    }
  };

  // @TODO VMT should have a standard way of displaying timestamps, perhaps in utilities. This function should be there.
  const _roomDateStamp = (lastUpdated) => {
    const d = new Date(lastUpdated);
    let month = d.getMonth() + 1;
    let day = d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = `0${month}`;
    if (day.length < 2) day = `0${day}`;

    return [month, day, year].join('-');
  };

  return (
    <div className={classes.Container}>
      {!activity.rooms || activity.rooms.length === 0 ? (
        'No rooms for this template.'
      ) : (
        <Fragment>
          <div className={classes.TogglesContainer}>
            <Fragment>
              <ToggleGroup
                buttons={[
                  constants.ATTENDANCE,
                  constants.CHAT,
                  constants.THUMBNAIL,
                  constants.GRAPH,
                ]}
                value={viewType}
                onChange={setViewType}
              />
              {viewType === constants.CHAT && (
                <ToggleGroup
                  buttons={[constants.DETAILED, constants.SIMPLE]}
                  value={chatType}
                  onChange={setChatType}
                />
              )}
            </Fragment>
          </div>
          {viewType === constants.THUMBNAIL &&
            activity.tabs &&
            activity.tabs.length > 1 && (
              <Select
                options={activity.tabs.map((tab, index) => {
                  return { value: index, label: tab.name };
                })}
                value={tabSelection}
                onChange={(selectedOption) => {
                  setTabSelection(selectedOption);
                }}
                placeholder="Select a Tab..."
              />
            )}
          <div className={classes.TileGroup}>
            {activity.rooms
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
              .map((roomId) => {
                // for each of the rooms
                // display its title bar (title and menu) and
                // then the particular view type.
                return (
                  <div key={roomId} className={classes.Tile}>
                    <div className={classes.TileContainer}>
                      <div
                        className={classes.Title}
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          marginBottom: '5px',
                        }}
                      >
                        <DropdownMenu
                          list={_makeMenu(roomId)}
                          name={<i className="fas fa-bars" />}
                        />
                        {queryStates[roomId].isSuccess ? (
                          <Fragment>
                            {queryStates[roomId].data.name}
                            <span className={classes.Timestamp}>
                              updated:{' '}
                              {_roomDateStamp(
                                queryStates[roomId].data.updatedAt
                              )}
                            </span>
                          </Fragment>
                        ) : (
                          'Loading...'
                        )}
                      </div>

                      {queryStates[roomId].isSuccess &&
                        _displayViewType(roomId)}
                    </div>
                  </div>
                );
              })}
          </div>
        </Fragment>
      )}
    </div>
  );
}

/**
 * ChartUpdater is a simple wrapper that implements the reducer-based approach to displaying info
 * in the chart (taken from Stats.js). In Stats.js, the reducer is used to communicate changes
 * due to the log or the filters changing.
 */
function ChartUpdater(props) {
  const { log } = props;
  const [state, dispatch] = React.useReducer(statsReducer, initialState);

  React.useEffect(() => {
    // @TODO this should be an action that hides the literal string.
    // Also, why not use the Redux store?
    if (log && log.length > 0) dispatch({ type: 'GENERATE_DATA', data: log });
  }, [log]);

  return <Chart state={state} />;
}

/**
 * DropdownMenu is an adaptation of DropdownNavItem used in the main VMT header. I adapted it
 * because it looks nice. If there's a desire to make this a generic, reusable
 * component, it should be moved to the ./Components portion of src.
 */

const DropdownMenu = (props) => {
  const { name, list } = props;
  return (
    <li
      className={DropdownMenuClasses.Container}
      // eslint-disable-next-line react/destructuring-assignment
      data-testid={props['data-testid']}
    >
      <NavItem link={list[0].link} name={name} />
      <div className={DropdownMenuClasses.DropdownContent}>
        {list.map((item) => {
          return (
            <div className={DropdownMenuClasses.DropdownItem} key={item.name}>
              <NavItem link={item.link} name={item.name} />
            </div>
          );
        })}
      </div>
    </li>
  );
};

TemplatePreview.propTypes = {
  activity: PropTypes.shape({}).isRequired,
};

ChartUpdater.propTypes = {
  log: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

DropdownMenu.propTypes = {
  name: PropTypes.element.isRequired,
  list: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  'data-testid': PropTypes.string,
};

DropdownMenu.defaultProps = {
  'data-testid': 'dropdownMenu',
};

export default TemplatePreview;
