import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  NavItem,
  ToggleGroup,
  SimpleChat,
  CurrentMembers,
  BigModal,
  Spinner,
} from 'Components';
import Chart from 'Containers/Stats/Chart';
import statsReducer, { initialState } from 'Containers/Stats/statsReducer';
import { dateAndTime, useUIState } from 'utils';
import debounce from 'lodash/debounce';
import _isEqual from 'lodash/isEqual';
import Thumbnails from './Thumbnails';
import QuickChat from './QuickChat';
import classes from './monitoringView.css';
import DropdownMenuClasses from './dropdownmenu.css';
import RoomViewer from './RoomViewer';

/**
 * The RoomsMonitor provides four views into a set of rooms: attendance, thumbnail, chat, and activity graph.
 *
 * When the Chat is selected, users can toggle between detailed and simple chat. Also, a "Quck Chat"
 * checkbox appears in the hamburger menus for each room. Checking the box makes the chat
 * interactive (the user actually 'enters' the room and can chat with others in the room). Only one
 * live chat can be active at a time.
 *
 * NOTE: An earlier implementation provided a "stats" view, identical to the activity graphs in the Stats tab of each room. However, this
 * view requires a LOT of information to be loaded for each room (all events). As a result, the amount of data flowing from the server to the client
 * on each refresh was deemed problematic.
 *
 *  @TODO:
 *  - Store entire state (room selections, toggle choices, scrollTop for each tile, etc.) in Redux store and restore MonitorView state accordingly
 *  - Show notifications for rooms
 */

function RoomsMonitor({
  populatedRooms,
  tabIndex,
  screenIndex,
  user,
  onThumbnailSelected,
  context, // used for saving and restoring UI state
  onVisible, // provides array of ids of rooms that are visible on the screen
  isLoading, // array of ids that are currently loading
  customComponent, // a component that gets inserted right next to the admin warning
}) {
  const constants = {
    CHAT: 'Chat',
    THUMBNAIL: 'Thumbnail',
    ATTENDANCE: 'Attendance',
    GRAPH: 'Graph',
    SIMPLE: 'Simple Chat',
    DETAILED: 'Detailed Chat',
  };
  const [uiState, setUIState] = useUIState(context, {});

  const [viewType, setViewType] = React.useState(
    uiState.viewType || constants.ATTENDANCE
  );
  const [chatType, setChatType] = React.useState(
    uiState.chatType || constants.DETAILED
  );
  const [quickChat, setQuickChat] = React.useState(uiState.quickChat || null);
  const [showModal, setShowModal] = React.useState(false);
  const [roomPreview, setRoomPreview] = React.useState(null);

  React.useEffect(() => {
    setUIState({ viewType, chatType, quickChat });
  }, [viewType, chatType, quickChat]);

  /**
   *
   * IMPLEMENT OBSERVER LOGIC
   *
   */

  const [divRefs, setDivRefs] = React.useState([]);

  const observerRef = React.useRef();
  const visibilityRef = React.useRef({});

  const onVisibleDebounce = debounce(onVisible, 500);

  React.useEffect(() => {
    // Create a new array of refs when component mounts
    const newDivs = Object.keys(populatedRooms).map(() => React.createRef());
    setDivRefs(newDivs);
  }, [Object.keys(populatedRooms).length]);

  // Whenever the visibility of divs change, the callback on InsersectionObserver gets called, but ONLY WITH
  // THE DIVS THAT CHANGED VISIBILITY. We use the visibilityRef to keep track of tje visibility of all the divs that can
  // be displayed.
  React.useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    // for some reason, vscode doesn't recognize InterserctionObserver
    // eslint-disable-next-line no-undef
    observerRef.current = new IntersectionObserver((entries) => {
      visibilityRef.current = entries.reduce(
        (acc, entry) => ({ ...acc, [entry.target.id]: entry.isIntersecting }),
        visibilityRef.current
      );
      const visibleDivIds = Object.keys(visibilityRef.current).filter(
        (key) => visibilityRef.current[key]
      );
      onVisibleDebounce(visibleDivIds);
    });
    divRefs.forEach((ref) => {
      if (ref.current) observerRef.current.observe(ref.current);
    });

    return () => {
      observerRef.current.disconnect();
    };
  }, [divRefs]);

  /**
   *
   * FUNCTIONS THAT ARE USED TO SIMPLIFY THE RENDER LOGIC
   *
   */

  const _adminWarning = () => {
    return (
      <div style={{ color: 'red' }}>
        {user.isAdmin && !user.inAdminMode && (
          <span>
            Warning: You are not currently in Admin mode. If you enter a room,
            you will be seen.
          </span>
        )}
      </div>
    );
  };

  const _makeMenu = (id) => {
    const quickChatItem = {
      name: 'Quick Chat',
      sliderDetails: {
        isOn: quickChat === id,
        onClick: () =>
          quickChat === id ? setQuickChat(null) : setQuickChat(id),
      },
    };
    return [
      {
        name: 'Enter Room',
        link: `/myVMT/workspace/${id}`,
      },
      viewType === constants.CHAT ? quickChatItem : null,
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
        return <ChartUpdater log={populatedRooms[id].log || []} />;
      case constants.CHAT:
        return quickChat === id ? (
          <QuickChat
            isSimplified={chatType === constants.SIMPLE}
            populatedRoom={populatedRooms[id]}
          />
        ) : (
          <SimpleChat
            isSimplified={chatType === constants.SIMPLE}
            log={populatedRooms[id].chat || []}
            context={`${context}-${id}`}
          />
        );
      case constants.THUMBNAIL: {
        return (
          <Thumbnails
            populatedRoom={populatedRooms[id] || {}}
            initialScreen={screenIndex}
            initialTabIndex={tabIndex}
          />
        );
      }
      case constants.ATTENDANCE: {
        const newMembers = populatedRooms[id].members
          ? populatedRooms[id].members.map((mem) => ({
              ...mem,
              user: {
                ...mem.user,
                username: `${mem.user.username} ${
                  mem.alias ? `(${mem.alias})` : ''
                }`,
              },
            }))
          : [];
        const currentMembers = populatedRooms[id].currentMembers.map(
          (usr) => usr._id
        );
        return (
          <CurrentMembers
            members={newMembers}
            currentMembers={newMembers
              .map((m) => m.user)
              .sort((a) => (currentMembers.includes(a._id) ? -1 : 1))}
            activeMember={(populatedRooms[id].currentMembers || []).map(
              (m) => m._id
            )}
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

  const _roomDateStamp = (lastUpdated) => {
    return dateAndTime.toDateTimeString(lastUpdated);
  };

  const _openModal = (roomId) => {
    setRoomPreview(roomId);
    setShowModal(true);
  };

  return (
    <Fragment>
      <div className={classes.Container}>
        <div className={classes.TogglesContainer}>
          <Fragment>
            <ToggleGroup
              buttons={[
                constants.ATTENDANCE,
                constants.CHAT,
                constants.THUMBNAIL,
                // constants.GRAPH,
              ]}
              value={viewType}
              onChange={(type) => {
                setViewType(type);
                onThumbnailSelected(type === constants.THUMBNAIL);
              }}
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
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {customComponent}
          {_adminWarning()}
        </div>
        {Object.keys(populatedRooms).length === 0 ? (
          <div className={classes.NoSnapshot}>No rooms to display</div>
        ) : (
          <div className={classes.TileGroup}>
            {Object.values(populatedRooms).map((room, index) => {
              // for each of the rooms managed by a user display its title bar (title and menu) and
              // then the particular view type.
              return (
                <div
                  key={room._id}
                  className={classes.Tile}
                  ref={divRefs[index]}
                  id={room._id}
                >
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
                      {populatedRooms[room._id] && (
                        <Fragment>
                          {populatedRooms[room._id].name}
                          <span className={classes.Timestamp}>
                            updated:{' '}
                            {_roomDateStamp(populatedRooms[room._id].updatedAt)}{' '}
                          </span>
                          <i
                            className="fas fa-external-link-alt"
                            title="Open a quick view of the room"
                            onClick={() => {
                              _openModal(room._id);
                            }}
                            onKeyDown={() => {
                              _openModal(room._id);
                            }}
                            tabIndex="-1"
                            role="button"
                          />
                        </Fragment>
                      )}
                    </div>
                    {isLoading.includes(room._id) && (
                      <span>
                        <Spinner />
                      </span>
                    )}
                    {_displayViewType(room._id)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BigModal show={showModal} closeModal={() => setShowModal(false)}>
        <RoomViewer
          populatedRoom={roomPreview ? populatedRooms[roomPreview] : undefined}
        />
      </BigModal>
    </Fragment>
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
  const firstDetails = list[0].sliderDetails;
  return (
    <li
      className={DropdownMenuClasses.Container}
      // eslint-disable-next-line react/destructuring-assignment
      data-testid={props['data-testid']}
    >
      <NavItem link={firstLink} name={name} sliderDetails={firstDetails} />
      <div className={DropdownMenuClasses.DropdownContent}>
        {list.map((item) => {
          return !item ? null : (
            <div className={DropdownMenuClasses.DropdownItem} key={item.name}>
              <NavItem
                link={item.link}
                name={item.name}
                sliderDetails={item.sliderDetails}
              />
            </div>
          );
        })}
      </div>
    </li>
  );
};

RoomsMonitor.propTypes = {
  populatedRooms: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.shape({}), PropTypes.string])
  ).isRequired,
  tabIndex: PropTypes.number,
  screenIndex: PropTypes.number,
  user: PropTypes.shape({
    isAdmin: PropTypes.bool,
    inAdminMode: PropTypes.bool,
  }).isRequired,
  onThumbnailSelected: PropTypes.func,
  context: PropTypes.string.isRequired,
  onVisible: PropTypes.func,
  isLoading: PropTypes.arrayOf(PropTypes.string),
  customComponent: PropTypes.node,
};

RoomsMonitor.defaultProps = {
  tabIndex: undefined,
  screenIndex: undefined,
  onThumbnailSelected: () => {},
  onVisible: () => {},
  isLoading: [],
};

ChartUpdater.propTypes = {
  log: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

DropdownMenu.propTypes = {
  name: PropTypes.element.isRequired,
  list: PropTypes.arrayOf(
    PropTypes.shape({
      sliderDetails: PropTypes.shape({}),
      link: PropTypes.string,
      name: PropTypes.string,
    })
  ).isRequired,
  'data-testid': PropTypes.string,
};

DropdownMenu.defaultProps = {
  'data-testid': 'dropdownMenu',
};

const mapStateToProps = (state) => ({ user: state.user });

export default connect(mapStateToProps)(
  React.memo(RoomsMonitor, (prev, next) => _isEqual(prev, next))
);
