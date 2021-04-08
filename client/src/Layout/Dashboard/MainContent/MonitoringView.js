/* eslint-disable prettier/prettier */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/label-has-associated-control */

import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { connect } from 'react-redux';
import API from '../../../utils/apiRequests';
import SimpleChat from '../../../Components/Chat/SimpleChat';
import ToggleGroup from './ToggleGroup';
import SelectionTable from './SelectionTable';
import { updateRoomMonitorSelections } from '../../../store/actions';
import { Chart, statsReducer, initialState } from '../../../Containers';
import { NavItem } from '../../../Components';
import buildLog from '../../../utils/buildLog';
import classes from './monitoringView.css';
import ChatClasses from '../../../Components/Chat/chat.css';
import DropdownMenuClasses from './dropdownmenu.css';

/**
 * The MonitoringView provides three views into a set of rooms: activity graph, thumbnail, and chat. Users can
 * select which of all the rooms they manage (from userResources).
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
 * Monitoring connects to the Redux store to maintain the user's selection of rooms.
 *
 * @TODO:
 *  - implement the thumbnail monitoring.
 *  - when you use the menu to jump somewhere else, the way to get back to Monitoring is the browser's Back button.
 *    Is this obvious enough for users?
 *  - Notification markers at top of each chat, graph, or thumbnail as needed
 *  - Perhaps adapt the InfoBox rather than having my custom "Title" div below.
 *  - Could clean up the CSS -- don't import from the Chat (keeping the
 *    dropdownMenu CSS separately in case we make that into a reusable component)
 */

function MonitoringView({
  userResources,
  storedSelections,
  user,
  connectUpdateRoomMonitorSelections,
  notifications,
}) {
  const constants = {
    SELECT: 'Select',
    VIEW: 'View',
    CHAT: 'Chat',
    THUMBNAIL: 'Thumbnail',
    GRAPH: 'Graph',
  };

  // we have to check whether the rooms in userResources are consistent
  // with the collection of rooms that were available for selection
  // and so stored in the Redux store.  For example, maybe a new room
  // was added since we last did our monitoring.
  const _initializeSelections = (rooms) => {
    const result = {};
    rooms.forEach((room) => {
      if (
        !storedSelections ||
        (storedSelections && storedSelections[room._id] === undefined)
      ) {
        result[room._id] = true;
      } else {
        result[room._id] = storedSelections[room._id];
      }
    });
    return result;
  };

  const [viewOrSelect, setViewOrSelect] = React.useState(constants.VIEW);
  const [selections, setSelections] = React.useState(
    _initializeSelections(userResources)
  );
  const [viewType, setViewType] = React.useState(constants.CHAT);

  // Because "useQuery" is the equivalent of useState, do this
  // initialization of queryStates (an object containing the states
  // for the API-retrieved data) at the top level rather than inside
  // of a useEffect.
  const queryStates = {};
  userResources.forEach((room) => {
    queryStates[room._id] = useQuery(room._id, () =>
      API.getPopulatedById('rooms', room._id, false, true).then(
        (res) => res.data.result
      )
    );
  });

  // When the selections change, notifiy the Redux store.
  React.useEffect(() => {
    connectUpdateRoomMonitorSelections(selections);
  }, [selections]);

  /**
   * FUNCTIONS USED TO SIMPLIFY THE RENDER LOGIC
   */
  const _adminWarning = () => {
    return (
      <div style={{ color: 'red' }}>
        {/* {!user.isAdmin ? (
          <span>
            Warning: You are not an Admin. If you enter a room, you will be
            seen. To become an admin, please contact your VMT administrator.
          </span>
        ) : ( */}
        {user.isAdmin && !user.inAdminMode && (
          <span>Warning: You are not currently in Admin mode.</span>
        )}
      </div>
    );
  };

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

  const _displayViewType = (id) => {
    switch (viewType) {
      case constants.GRAPH:
        return (
          <ChartUpdater
            log={
              queryStates[id].isSuccess
                ? buildLog(queryStates[id].data.tabs, queryStates[id].data.chat)
                : []
            }
          />
        );
      case constants.CHAT:
        return (
          <SimpleChat
            log={queryStates[id].isSuccess ? queryStates[id].data.chat : []}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={classes.Container}>
      {_adminWarning()}

      <div className={classes.TogglesContainer}>
        <ToggleGroup
          buttons={[constants.VIEW, constants.SELECT]}
          onChange={setViewOrSelect}
        />
        <ToggleGroup
          buttons={[constants.CHAT, constants.THUMBNAIL, constants.GRAPH]}
          onChange={setViewType}
        />
      </div>

      {viewOrSelect === constants.SELECT ? (
        <SelectionTable
          data={Object.keys(queryStates)
            .filter((id) => queryStates[id].isSuccess)
            .map((_id) => {
              return { _id, ...queryStates[_id].data };
            })}
          selections={selections}
          onChange={(newSelections) =>
            setSelections({ ...selections, ...newSelections })
          }
        />
      ) : (
        <div className={classes.TileGroup}>
          {userResources.map((room) => {
            // for each of the rooms managed by a user, if that
            // room is selected, display its title bar (title and menu) and
            // then the particular view type.
            return (
              selections[room._id] && (
                <div key={room._id} className={classes.Chat}>
                  <div className={ChatClasses.Container}>
                    <div
                      className={ChatClasses.Title}
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: '5px',
                      }}
                    >
                      {queryStates[room._id].isSuccess
                        ? queryStates[room._id].data.name
                        : 'Loading...'}
                      <DropdownMenu
                        list={_makeMenu(room._id)}
                        name={<i className="fas fa-ellipsis-v" />}
                      />
                    </div>

                    {_displayViewType(room._id)}
                  </div>
                </div>
              )
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * ChartUpdater is a simple wrapper that implements the reducer-based approach to displaying info
 * in the chart (taken from Stats.js). In Stats.js, the reducer is used to communicate changes
 * due to the log changing or the filters changing.
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

MonitoringView.propTypes = {
  // @TODO clean up so only specify what we need
  resource: PropTypes.string.isRequired,
  parentResource: PropTypes.string,
  parentResourceId: PropTypes.string,
  user: PropTypes.shape({}).isRequired,
  userResources: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  notifications: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  storedSelections: PropTypes.shape({}),
  connectUpdateRoomMonitorSelections: PropTypes.func.isRequired,
};

MonitoringView.defaultProps = {
  parentResource: null,
  parentResourceId: null,
  storedSelections: {},
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

const mapStateToProps = (state) => {
  return {
    storedSelections: state.rooms.roomMonitorSelections,
  };
};

export default connect(
  mapStateToProps,
  {
    connectUpdateRoomMonitorSelections: updateRoomMonitorSelections,
  }
)(MonitoringView);
