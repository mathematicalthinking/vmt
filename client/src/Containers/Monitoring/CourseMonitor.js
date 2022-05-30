/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/label-has-associated-control */

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { NavItem, ToggleGroup, SimpleChat, CurrentMembers } from 'Components';
import { usePopulatedRoom } from 'utils';
import Chart from 'Containers/Stats/Chart';
import statsReducer, { initialState } from 'Containers/Stats/statsReducer';
import Thumbnails from './Thumbnails';
import classes from './monitoringView.css';
import DropdownMenuClasses from './dropdownmenu.css';

/**
 * The CourseMonitor provides three views into a set of rooms: activity graph, thumbnail, and chat. Users can
 * select which of all the rooms in the course.
 *
 * The views of the rooms are laid out as tiles. The tiles have their room name at top and a space for notifications. Clicking
 * on the notification icon brings up the notifications in a modal window for that room (@TODO). Hovering on the three dots next to a title
 *  brings up a menu: Enter Room, Manage Members, Open Replayer, and View Room Stats. Each of these simply goes to the
 * appropriate Route (the room, the lobby with the members tab selected, the room with the replayer, or the room lobby
 * with the Stats tab selected).
 *
 * For the activity graph, I reuse what's shown in the stats area of the room.
 * For the chat, there's a simpler chat component (SimpleChat), which is a SIGNIFICANTLY scaled down version of /Layout/Chat (i.e.,
 * ChatLayout) -- no references or arrows are shown, the text messages aren't clickable, etc. However, this component
 * does show the room name at top (rather than just 'Chat') and implements a dropdown menu (a component embedded in
 * the SimplifiedChat file) that was mostly copied from DropdownNavItem.
 * Thumbnails (@TODO) might require server-side rendering (e.g., via
 * Puppeteer) and then pulling the base64 string to the client.
 *
 */

function CourseMonitor({ course }) {
  const constants = {
    SELECT: 'Select',
    VIEW: 'View',
    CHAT: 'Chat',
    THUMBNAIL: 'Thumbnail',
    ATTENDANCE: 'Attendance',
    GRAPH: 'Graph',
    SIMPLE: 'Simple Chat',
    DETAILED: 'Detailed Chat',
  };

  const [viewType, setViewType] = React.useState(constants.ATTENDANCE);
  const [chatType, setChatType] = React.useState(constants.DETAILED);

  // Because "useQuery" is the equivalent of useState, do this
  // initialization of queryStates (an object containing the states
  // for the API-retrieved data) at the top level rather than inside
  // of a useEffect.
  const queryStates = {};
  course.rooms.forEach((room) => {
    queryStates[room._id] = usePopulatedRoom(
      room._id,
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
          />
        );
      }
      case constants.ATTENDANCE: {
        const data = queryStates[id].isSuccess ? queryStates[id].data : null;
        return (
          <CurrentMembers
            members={data ? data.members : []}
            currentMembers={
              data
                ? _selectFirst([
                    ...data.currentMembers,
                    ...data.members.map((m) => m.user),
                  ])
                : []
            }
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

  const _selectFirst = (list) => {
    const values = list.reduce((acc, elt) => {
      if (!acc[elt._id]) acc[elt._id] = elt;
      return acc;
    }, {});
    return Object.values(values);
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
      <div className={classes.TileGroup}>
        {course.rooms
          .sort(
            (a, b) =>
              // Sort the rooms into reverse chronological order (most recently changed first)
              // if you have an updatedAt date pulled from the datbase, use that; if not, use the date
              // provided by the Redux store (i.e., the course prop).
              new Date(
                (queryStates[b._id].isSuccess &&
                  queryStates[b._id].data.updatedAt) ||
                  b.updatedAt
              ) -
              new Date(
                (queryStates[a._id].isSuccess &&
                  queryStates[a._id].data.updatedAt) ||
                  a.updatedAt
              )
          )
          .map((room) => {
            // for each of the rooms managed by a user, if that
            // room is selected, display its title bar (title and menu) and
            // then the particular view type.
            return (
              <div key={room._id} className={classes.Tile}>
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
                      list={_makeMenu(room._id)}
                      name={<i className="fas fa-bars" />}
                    />
                    {queryStates[room._id].isSuccess ? (
                      <Fragment>
                        {queryStates[room._id].data.name}
                        <span className={classes.Timestamp}>
                          updated:{' '}
                          {_roomDateStamp(queryStates[room._id].data.updatedAt)}
                        </span>
                      </Fragment>
                    ) : (
                      'Loading...'
                    )}
                  </div>

                  {queryStates[room._id].isSuccess &&
                    _displayViewType(room._id)}
                </div>
              </div>
            );
          })}
      </div>
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
  // eslint-disable-next-line react/prop-types
  const firstLink = list[0].link;
  return (
    <li
      className={DropdownMenuClasses.Container}
      // eslint-disable-next-line react/destructuring-assignment
      data-testid={props['data-testid']}
    >
      <NavItem link={firstLink} name={name} />
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

CourseMonitor.propTypes = {
  course: PropTypes.shape({ rooms: PropTypes.arrayOf(PropTypes.shape({})) })
    .isRequired,
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

export default CourseMonitor;
