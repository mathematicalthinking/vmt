/* eslint-disable react/jsx-indent */
/* eslint-disable no-alert */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import each from 'lodash/each';
import find from 'lodash/find';
import {
  updateRoom,
  updatedRoom,
  updatedRoomTab,
  updateRoomTab,
  setRoomStartingPoint,
  updateUser,
  updateUserSettings,
} from 'store/actions';
import { Modal, CurrentMembers, Loading, TabTypes } from 'Components';
import { ROLE } from 'constants.js';
import {
  socket,
  useSnapshots,
  API,
  controlStates,
  controlEvents,
  createMongoId as mongoIdGenerator,
} from 'utils';
import { WorkspaceLayout } from 'Layout';
import { Chat, Tabs, Tools, RoomInfo } from '.';
import NewTabForm from '../Create/NewTabForm';
import CreationModal from './Tools/CreationModal';

class Workspace extends Component {
  constructor(props) {
    super(props);
    const { user, populatedRoom, tempCurrentMembers, temp } = this.props;

    this.adminModeSwitched = false; // Needed if someone leaves a room by switching their admin mode

    this.state = {
      takeSnapshot: () => {},
      cancelSnapshots: () => {},
      getSnapshot: () => {
        return undefined;
      },
      snapshotRef: React.createRef(),
      tabs: populatedRoom.tabs || [],
      log: populatedRoom.log || [],
      myColor: '#f26247', // default; gets reset if needed in componentDidMount
      controlledBy: populatedRoom.controlledBy,
      currentMembers: temp
        ? tempCurrentMembers
        : populatedRoom.getCurrentMembers(),
      // : populatedRoom.currentMembers,
      referencing: false,
      showingReference: false,
      isSimplified: true,
      referToEl: null,
      referToCoords: null,
      referFromEl: null,
      referFromCoords: null,
      currentTabId: populatedRoom.tabs[0]._id,
      role: ROLE.PARTICIPANT,
      creatingNewTab: false,
      activityOnOtherTabs: [],
      chatExpanded: true,
      membersExpanded: true,
      instructionsExpanded: true,
      toolsExpanded: true,
      isFirstTabLoaded: false,
      showAdminWarning: user ? !!user.inAdminMode : false, // in a temp room, user.inAdminMode is undefined @TODO: fix on server side
      graphCoords: null,
      eventsWithRefs: [],
      showInstructionsModal: false,
      instructionsModalMsg: '',
      isCreatingActivity: false,
      connectionStatus: 'None',
      // currentScreen, only important now for DesmosActivities, is used by the snapshot facililty.
      // Even on DesmosActivities, this won't be set if the person doesn't navigate before a snapshot is taken. THus, it's
      // important that the default is 0 (indicating the first screen)
      currentScreen: 0,
    };
  }

  componentDidMount() {
    const { populatedRoom, temp, tempMembers, lastMessage, user } = this.props;
    // initialize a hash of events that have references that will be
    // updated every time a reference made
    // allows for quicker lookup when needing to check if objects
    // that have been referenced have been updated or deleted
    this.computeReferences();

    let membersToFilter = populatedRoom.members;
    if (temp) {
      membersToFilter = tempMembers;
    }
    let myColor;
    try {
      myColor = membersToFilter.filter(
        (member) => member.user._id === user._id
      )[0].color;
    } catch (err) {
      if (user.isAdmin) {
        myColor = '#ffd549';
      }
    }
    this.setState({
      myColor,
      tabs: populatedRoom.tabs,
      log: populatedRoom.log,
    });
    if (lastMessage) this.addToLog(lastMessage);
    this.initializeListeners();
    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('keydown', this.keyListener);

    // Set up snapshots

    if (!temp) {
      const {
        elementRef,
        takeSnapshot,
        cancelSnapshots,
        getSnapshot,
      } = useSnapshots((newSnapshot) => {
        const { currentTabId } = this.state;
        const updateBody = { snapshot: newSnapshot };
        API.put('tabs', currentTabId, updateBody).then(() => {
          this.updateTab(currentTabId, updateBody);
        });
      });

      this.setState(
        {
          takeSnapshot,
          snapshotRef: elementRef,
          cancelSnapshots,
          getSnapshot,
        },
        () => this._takeSnapshotIfNeeded()
      );
    }

    this.setHeartbeatTimer();
  }

  componentDidUpdate(prevProps) {
    const { populatedRoom: currentRoom, temp, lastMessage, user } = this.props;

    if (temp) {
      if (prevProps.lastMessage !== lastMessage) {
        this.addToLog(lastMessage);
      }
    }

    if (prevProps.user.inAdminMode !== user.inAdminMode) {
      this.adminModeSwitched = true; // used in componentWillUnmount
      this.goBack();
    }

    // test did populatedRoom change?
    // if so, do we need to update state?
    const oldRoom = prevProps.populatedRoom;
    const populatedRoom = {
      ...currentRoom,
      currentMembers: currentRoom.getCurrentMembers(),
    };
    const propsDifference = this.findRoomDifference(oldRoom, populatedRoom);
    if (propsDifference) {
      const stateDifference = this.findRoomDifference(
        this.state,
        populatedRoom
      );
      if (stateDifference) {
        // We are being very careful to update the state only if completely necessary, so this setState is warranted.
        // Note that the pieces of populatedRoom (log, currentMembers, etc) are separate state variables in Workspace
        // (it's almost as if Workspace's state object is an uber populatedRoom).
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState(stateDifference);
      }
    }
  }

  componentWillUnmount() {
    const { populatedRoom, connectUpdatedRoom, user } = this.props;
    const { myColor, cancelSnapshots, currentMembers, log, tabs } = this.state;
    // Only generate a LEAVE message (and remove the user from the currentMembers list) if:
    // - the user is in admin mode and is leaving via the exit button (i.e., not from switching mode)
    // - the user is leaving because they switched their admin mode on. They were in the room,
    //   so they need to be removed from the currentMembers list.
    if (
      (!this.adminModeSwitched && !user.inAdminMode) ||
      (this.adminModeSwitched && user.inAdminMode)
    ) {
      socket.emit('LEAVE_ROOM', populatedRoom._id, myColor);
      // Below updates the Redux store, removing the current user from the list of people in the room (currentMembers).
      // However, this might not be needed as the socket updates the DB with the current members. The next time this info is needed, in
      // some type of monitor or when this person reenters the room, that info will be pulled from the DB.
      connectUpdatedRoom(populatedRoom._id, {
        currentMembers: currentMembers.filter(
          (mem) => mem && user && mem._id !== user._id
        ),
        chat: log.filter((msg) => msg.messageType),
        tabs,
      });
    }
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('keypress', this.keyListener);
    socket.removeAllListeners('USER_JOINED');
    socket.removeAllListeners('CREATED_TAB');
    socket.removeAllListeners('USER_LEFT');
    socket.removeAllListeners('RELEASED_CONTROL');
    socket.removeAllListeners('TOOK_CONTROL');

    cancelSnapshots(); // if Workspace were a functional component, we'd do this directly in the custom hook.
    clearInterval(this.heartbeatInterval);
    this.clearHeartbeatTimer();
  }

  /** ********************
   *
   * FUNCTIONS NEEDED FOR SNAPSHOTS (spring/summer 2021)
   *
   * Snapshots are a recent addition to VMT. They are used in the MonitoringView and RoomPreview as thumbnail images, for
   * example. They are created and accessed via the useSnapshot utility hook. All the snapshots for a room are stored in
   * the 'snapshot' property of the room, keyed by the tab and screen the snapshot was taken of.  As of this writing,
   * taking a snapshot might be noticible on a slow machine, so care is taken not to take too many snapshots. A snapshot
   * is taken when the user takes and then releases control (if the computer slows then, the person might not notice) or
   * when the room first loads if there's not already a snapshot for this room's current tab and (if a DesmosActivity) screen.
   *
   * If snapshots have no chance of being too resource intensive, we could increase the frequency, which would give monitoring
   * and previews a more real-time sense.
   */
  _snapshotKey = () => {
    const { currentTabId, currentScreen } = this.state;
    return { currentTabId, currentScreen };
  };

  _currentSnapshot = () => {
    const { currentTabId, tabs } = this.state;
    const currentTab = tabs.find((tab) => tab._id === currentTabId);
    const result = currentTab ? currentTab.snapshot : null;
    return result;
  };

  _takeSnapshotIfNeeded = () => {
    const { takeSnapshot, getSnapshot, cancelSnapshots } = this.state;
    const key = this._snapshotKey();
    const currentSnapshot = this._currentSnapshot();
    if (!getSnapshot(key, currentSnapshot)) {
      cancelSnapshots(); // keeps prior snap from being sent via callback dur quick subsequent snaps
      takeSnapshot(key, currentSnapshot);
    }
  };

  handleScreenChange = (screenNum) => {
    // Only do something if the currentTab is a DesmosActivity
    const { currentTabId, tabs } = this.state;
    const currentTab = tabs.find((tab) => tab._id === currentTabId);

    if (currentTab && currentTab.tabType === TabTypes.DESMOS_ACTIVITY) {
      // set screen in state
      this.setState({ currentScreen: screenNum }, () => {
        // takeSnap if needed
        this._takeSnapshotIfNeeded();
      });
    }
  };

  /** ******************** */

  addToLog = (entry) => {
    const { log } = this.state;
    const isReference = this.doesEventHaveReference(entry);

    const updateHash = { log: [...log, entry] };
    if (isReference) {
      const { eventsWithRefs } = this.state;
      updateHash.eventsWithRefs = [...eventsWithRefs, entry];
    }
    this.setState(updateHash);
  };

  keyListener = (event) => {
    const { referencing } = this.state;
    if (event.key === 'Escape' && referencing) {
      this.clearReference({ doKeepReferencingOn: true });
    }
  };

  initializeListeners = () => {
    const {
      temp,
      populatedRoom,
      connectUpdatedRoom,
      user,
      sendControlEvent,
    } = this.props;
    const { myColor } = this.state;

    if (!temp) {
      const sendData = {
        _id: mongoIdGenerator(),
        userId: user._id,
        roomId: populatedRoom._id,
        username: user.username,
        roomName: populatedRoom.name,
        color: myColor,
      };
      // if the user joined this room with their admin privileges instead of being a bona fide member they won't be in the room list
      try {
        const { role } = populatedRoom.members.filter(
          (member) => member.user._id === user._id
        )[0];
        if (role === ROLE.FACILITATOR) {
          this.setState({ role });
        }
      } catch (err) {
        if (user.isAdmin) {
          this.setState({ role: 'admin' });
        }
      }
      if (!user.inAdminMode) {
        socket.emit('JOIN', sendData, (data, err) => {
          if (err) {
            console.log('Error joining room');
            console.log(err);
            this.goBack();
            return;
          }
          _handleJoinOrLeave(data);
        });
      }
    }

    const _handleJoinOrLeave = (data) => {
      const { controlState } = this.props;
      const { controlledBy: currentControl } = controlState;
      const { currentMembers, message, releasedControl } = data;
      const controlledBy = releasedControl ? null : currentControl;
      const currMems = populatedRoom.getCurrentMembers(currentMembers);
      const newState = {
        currentMembers: currMems,
        ...(releasedControl ? { controlledBy } : null),
      };
      this.setState(newState, () =>
        connectUpdatedRoom(populatedRoom._id, newState)
      );
      this.addToLog(message);
      if (releasedControl) sendControlEvent(controlEvents.MSG_RELEASED_CONTROL);
    };

    socket.on('USER_JOINED', _handleJoinOrLeave);

    socket.on('USER_LEFT', _handleJoinOrLeave);

    socket.on('TOOK_CONTROL', (message) => {
      this.addToLog(message);
      this.setState({
        awarenessDesc: message.text,
        awarenessIcon: 'USER',
      });
      sendControlEvent(controlEvents.MSG_TOOK_CONTROL, {
        id: message.user._id,
      });
    });

    socket.on('RELEASED_CONTROL', (message) => {
      this.addToLog(message);
      this.setState({
        awarenessDesc: message.text,
        awarenessIcon: 'USER',
      });
      sendControlEvent(controlEvents.MSG_RELEASED_CONTROL);
    });

    socket.on('CREATED_TAB', (data) => {
      const { tabs: stateTabs } = this.state;
      this.addToLog(data.message);
      delete data.message;
      delete data.creator;
      const tabs = [...stateTabs];
      tabs.push(data);
      this.setState({ tabs });
    });

    socket.on('RECEIVED_UPDATED_REFERENCES', (data) => {
      this.setState({ eventsWithRefs: data });
    });

    socket.on('RECEIVE_EVENT', (data, lastEventId) => {
      const { log } = this.state;
      const lastEvent = log.findLast((event) => !event.messageType);
      if (lastEvent && lastEvent._id && lastEvent._id !== lastEventId) {
        // log that the state is out of sync
        console.log(
          `State is out of sync. lastEventId: ${lastEventId}, last log id: ${
            log[log.length - 1]._id
          }`
        );
      }
    });

    // helper to determine latency
    // 0-3 local, <50 good, <100 ok, >100 potential issues
    // Set Threshold const to max acceptable latency in ms
    // bad connection latency threshold
    const THRESHOLD = 100;

    this.heartbeatInterval = setInterval(() => {
      const start = Date.now();
      this.setHeartbeatTimer();
      // volatile, so the packet will be discarded if the socket is not connected
      // PROBLEM: using volatile can hide the fact that the user is disconnected. (was "socket.volatile.emit...")
      if (socket.connected) {
        socket.emit('ping', () => {
          const latency = Date.now() - start;
          if (latency > THRESHOLD) this.setState({ connectionStatus: 'Bad' });
          else this.setState({ connectionStatus: 'Good' });
          // console.log('Heartbeat<3 latency: ', latency);
        });
      } else {
        // not connected
        this.setState({ connectionStatus: 'Error' });
      }
    }, 5000);

    // socket.on('pong', (latency) => {
    //   this.setHeartbeatTimer();
    //   if (latency > THRESHOLD) this.setState({ connectionStatus: 'Bad' });
    //   else this.setState({ connectionStatus: 'Good' });
    //   console.log('Heartbeat<3 latency: ', latency);
    // });
  };

  setHeartbeatTimer = () => {
    // threshold to determine whether no heartbeat
    const TIMEOUT = 150001;
    this.clearHeartbeatTimer();
    this.timer = setTimeout(() => {
      this.setState({ connectionStatus: 'Error' });
    }, TIMEOUT);
  };

  clearHeartbeatTimer = () => {
    if (this.timer) clearTimeout(this.timer);
  };

  createNewTab = () => {
    const { role } = this.state;
    const { populatedRoom } = this.props;
    if (
      role === ROLE.FACILITATOR ||
      populatedRoom.settings.participantsCanCreateTabs
    ) {
      this.setState({ creatingNewTab: true });
    }
  };

  closeModal = () => {
    this.setState({ creatingNewTab: false });
  };

  closeCreate = () => {
    this.setState({
      isCreatingActivity: false,
    });
  };

  changeTab = (id) => {
    const { populatedRoom, user } = this.props;
    const { activityOnOtherTabs, myColor, tabs } = this.state;
    this.clearReference();
    const data = {
      _id: mongoIdGenerator(),
      user: { _id: user._id, username: 'VMTBot' },
      text: `${user.username} switched to ${
        tabs.filter((t) => t._id === id)[0].name
      }`,
      autogenerated: true,
      room: populatedRoom._id,
      messageType: 'SWITCH_TAB',
      color: myColor,
      timestamp: Date.now(),
    };
    socket.emit('SWITCH_TAB', data, (res, err) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.log('something went wrong on the socket:', err);
      }
      this.addToLog(data);
    });
    const updatedTabs = activityOnOtherTabs.filter((tab) => tab !== id);
    this.setState(
      { currentTabId: id, activityOnOtherTabs: updatedTabs },
      () => {
        this.handleInstructionsModal();
      }
    );
  };

  toggleControl = () => {
    const { controlState, sendControlEvent } = this.props;
    const { myColor } = this.state;
    if (!socket.connected) {
      // i.e. if the user clicked the button manually instead of controll being toggled programatically
      window.alert(
        'You have disconnected from the server. Check your internet connection and try refreshing the page'
      );
    }

    if (controlState.matches(controlStates.ME)) {
      const { takeSnapshot } = this.state;
      takeSnapshot(this._snapshotKey(), this._currentSnapshot());
    }

    if (controlState.matches(controlStates.NONE)) {
      this.setState({ referencing: false });
    }
    sendControlEvent(controlEvents.CLICK, {
      myColor,
      callback: this.addToLog,
    });
  };

  emitNewTab = (tabInfo) => {
    const { myColor } = this.state;
    const { user } = this.props;
    tabInfo.message.color = myColor;
    tabInfo.message.user = user; // every event should have a 'user' property!
    socket.emit('NEW_TAB', tabInfo, () => {
      this.addToLog(tabInfo.message);
    });
  };

  startNewReference = () => {
    this.setState({
      referencing: true,
      showingReference: false,
      referToEl: null,
      referToCoords: null,
    });
  };

  toggleSimpleChat = () => {
    this.setState((prevState) => ({
      isSimplified: !prevState.isSimplified,
    }));
  };

  showReference = (
    referToEl,
    referToCoords,
    referFromEl,
    referFromCoords,
    tabId
  ) => {
    const { currentTabId } = this.state;
    if (tabId !== currentTabId && referToEl.elementType !== 'chat_message') {
      window.alert('This reference does not belong to this tab'); // @TODO HOW SHOULD WE HANDLE THIS?
      return;
    }

    if (referToEl.wasObjectDeleted) {
      // referenced object was removed
      const msg = `The referenced object (${referToEl.elementType} ${referToEl.element}) was deleted.`;
      window.alert(msg);
      return;
    }

    if (referToEl.wasObjectUpdated) {
      const msg = `Caution! The referenced object (${referToEl.elementType} ${referToEl.element}) has been modified since the time of reference.`;
      window.alert(msg);
    }

    this.setState({
      referToEl,
      referFromEl,
      referToCoords,
      referFromCoords,
      showingReference: true,
    });
    // get coords of referenced element,
  };

  clearReference = (options = {}) => {
    const { doKeepReferencingOn = false } = options;

    if (doKeepReferencingOn) {
      this.setState({
        referToEl: null,
        referToCoords: null,
        showingReference: false,
      });
    } else {
      this.setState({
        referToEl: null,
        referFromEl: null,
        referToCoords: null,
        referFromCoords: null,
        referencing: false,
        showingReference: false,
      });
    }
  };

  // this shouLD BE refereNT
  setToElAndCoords = (el, coords) => {
    if (el) {
      this.setState({
        referToEl: el,
      });
    }
    if (coords) {
      this.setState({
        referToCoords: coords,
      });
    }
  };

  // THIS SHOULD BE REFERENCE (NOT CHAT,,,CHAT CAN BE referENT TOO)
  // WE SHOULD ALSO SAVE ELEMENT ID SO WE CAN CALL ITS REF EASILY
  setFromElAndCoords = (el, coords) => {
    if (el) {
      this.setState({
        referFromEl: el,
      });
    }
    if (coords) {
      this.setState({
        referFromCoords: coords,
      });
    }
  };

  addNtfToTabs = (id) => {
    this.setState((prevState) => ({
      activityOnOtherTabs: [...prevState.activityOnOtherTabs, id],
    }));
  };

  clearTabNtf = (id) => {
    this.setState((prevState) => ({
      activityOnOtherTabs: prevState.activityOnOtherTabs.filter(
        (tab) => tab !== id
      ),
    }));
  };

  setStartingPoint = () => {
    const { connectSetRoomStartingPoint, populatedRoom } = this.props;
    connectSetRoomStartingPoint(populatedRoom._id);
  };

  toggleExpansion = (element) => {
    this.setState((prevState) => ({
      [`${element}Expanded`]: !prevState[`${element}Expanded`],
    }));
  };

  goBack = () => {
    const { history } = this.props;
    history.goBack();
  };

  setGraphCoords = (graphCoords) => {
    this.setState({ graphCoords });
  };

  setFirstTabLoaded = () => {
    this.setState({ isFirstTabLoaded: true }, () => {
      this.handleInstructionsModal();
    });
  };

  setTabs = (tabs) => {
    this.setState({ tabs });
  };

  updateTab = (updatedTabId, updateBody) => {
    const { tabs } = this.state;

    const copiedTabs = [...tabs];

    copiedTabs.forEach((tab) => {
      if (tab._id === updatedTabId) {
        each(updateBody, (value, field) => {
          tab[field] = value;
        });
      }
    });
    this.setTabs(copiedTabs);
  };

  resizeHandler = () => {
    const { referencing } = { ...this.state };

    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    if (typeof this.wasReferencingBeforeResize !== 'boolean') {
      this.wasReferencingBeforeResize = referencing;
    }
    this.clearReference();
    this.resizeTimeout = setTimeout(this.doneResizing, 500);
  };

  doneResizing = () => {
    if (this.wasReferencingBeforeResize) {
      this.setState({ referencing: true });
      this.wasReferencingBeforeResize = null;
    }
  };

  computeReferences = () => {
    const { log } = this.state;
    const eventsWithRefs = log.filter(this.doesEventHaveReference);
    this.setState({ eventsWithRefs });
  };

  doesEventHaveReference = (event) => {
    if (!event || !event.reference) {
      return false;
    }
    return typeof event.reference.element === 'string';
  };

  updateEventsWithReferences = (events) => {
    this.setState({ eventsWithRefs: events });
  };

  goToReplayer = () => {
    const { populatedRoom } = this.props;
    const { _id } = populatedRoom;
    const getUrl = window.location;
    const baseUrl = `${getUrl.protocol}//${getUrl.host}/${
      getUrl.pathname.split('/')[1]
    }`;

    const endUrl = `/workspace/${_id}/replayer`;

    window.open(`${baseUrl}${endUrl}`, 'newwindow', 'width=1200, height=700');
  };

  handleInstructionsModal = () => {
    const { currentTabId, tabs } = this.state;
    const { populatedRoom, user } = this.props;

    if (!user || !populatedRoom) {
      return;
    }
    let tabIndex;
    const tab = find(tabs, (t, ix) => {
      const isMatch = t._id === currentTabId;

      if (isMatch) {
        tabIndex = ix;
      }
      return isMatch;
    });

    if (!tab) {
      return;
    }
    let { instructions } = tab;

    if (!instructions && tabIndex === 0 && populatedRoom.instructions) {
      ({ instructions } = populatedRoom);
    }

    if (!instructions) {
      return;
    }

    const { visitors = [], visitorsSinceInstructionsUpdated = [] } = tab;

    let updateBody;

    if (visitors.indexOf(user._id) === -1) {
      updateBody = {
        visitors: [...visitors, user._id],
        visitorsSinceInstructionsUpdated: [
          ...visitorsSinceInstructionsUpdated,
          user._id,
        ],
      };
    } else if (visitorsSinceInstructionsUpdated.indexOf(user._id) === -1) {
      updateBody = {
        visitorsSinceInstructionsUpdated: [
          ...visitorsSinceInstructionsUpdated,
          user._id,
        ],
      };
    }

    if (!updateBody) {
      return;
    }

    const msg = `Instructions: ${instructions}`;
    this.setState({ showInstructionsModal: true, instructionsModalMsg: msg });
    // update tab

    API.put('tabs', tab._id, { newVisitor: user._id })
      .then(() => {
        this.updateTab(tab._id, updateBody);
      })
      .catch((err) => {
        console.log('error updating visitors: ', err);
      });
  };

  addTabIdToCopy = (event, id) => {
    const { selectedTabIdsToCopy } = this.state;
    if (selectedTabIdsToCopy.indexOf(id) === -1) {
      this.setState({ selectedTabIdsToCopy: [...selectedTabIdsToCopy, id] });
    } else {
      this.setState({
        selectedTabIdsToCopy: selectedTabIdsToCopy.filter(
          (tabId) => tabId !== id
        ),
      });
    }
  };

  beginCreatingActivity = () => {
    // create a new activity that belongs to the current user
    const { tabs } = this.state;
    this.setState({
      isCreatingActivity: true,
      selectedTabIdsToCopy: tabs.map((t) => t._id),
      settings: false,
    });
  };

  /**
   * @method findRoomDifference
   * @param oldRoom
   * @param newRoom
   * @returns false if no differences, else a new state object with the differences
   */
  findRoomDifference = (oldRoom, newRoom) => {
    const results = {};

    if (
      (oldRoom.tabs || newRoom.tabs) &&
      (oldRoom.tabs && oldRoom.tabs.length) !==
        (newRoom.tabs && newRoom.tabs.length)
    ) {
      results.tabs = newRoom.tabs;
    }

    if (
      (oldRoom.log || newRoom.log) &&
      (oldRoom.log && oldRoom.log.length) !==
        (newRoom.log && newRoom.log.length)
    ) {
      results.log = newRoom.log;
    }

    // if (oldRoom.controlledBy !== newRoom.controlledBy) {
    //   results.controlledBy = newRoom.controlledBy;
    // }

    if (
      JSON.stringify(oldRoom.currentMembers) !==
      JSON.stringify(newRoom.currentMembers)
    ) {
      results.currentMembers = newRoom.currentMembers;
    }

    return Object.keys(results).length !== 0 ? results : false;
  };

  emitEvent = (eventInfo) => {
    const { currentTabId, currentScreen, myColor, log } = this.state;
    const { populatedRoom, user, sendControlEvent } = this.props;
    const eventData = {
      ...eventInfo,
      _id: mongoIdGenerator(),
      room: populatedRoom._id,
      tab: currentTabId,
      color: myColor,
      user: { _id: user._id, username: user.username },
      timestamp: Date.now(),
    };

    if (currentScreen) eventData.currentScreen = currentScreen;
    const lastEventId = log[log.length - 1]._id;
    this.addToLog(eventData);
    sendControlEvent(controlEvents.RESET);
    socket.emit('SEND_EVENT', eventData, lastEventId, () => {});
  };

  render() {
    const {
      populatedRoom,
      connectUpdateRoom,
      connectUpdatedRoom,
      save,
      temp,
      tempMembers,
      connectUpdateRoomTab,
      tempCurrentMembers,
      connectUpdateUserSettings,
      resetRoom,
      user,
      controlState,
    } = this.props;
    const {
      tabs: currentTabs,
      currentMembers: activeMembers,
      log,
      membersExpanded,
      toolsExpanded,
      instructionsExpanded,
      activityOnOtherTabs,
      currentTabId,
      role,
      myColor,
      referencing,
      isSimplified,
      referToEl,
      referToCoords,
      referFromCoords,
      showingReference,
      chatExpanded,
      referFromEl,
      isFirstTabLoaded,
      creatingNewTab,
      showAdminWarning,
      graphCoords,
      eventsWithRefs,
      showInstructionsModal,
      instructionsModalMsg,
      snapshotRef,
      isCreatingActivity,
      connectionStatus,
    } = this.state;
    const inControl = controlState.inControl || controlStates.NONE;

    const currentMembers = (
      <CurrentMembers
        members={temp ? tempMembers : populatedRoom.members}
        // currentMembers={temp ? tempCurrentMembers : activeMembers}
        currentMembers={
          temp
            ? tempCurrentMembers
            : populatedRoom.getCurrentMembers(activeMembers)
        }
        activeMember={controlState.controlledBy}
        expanded={membersExpanded}
        toggleExpansion={this.toggleExpansion}
      />
    );
    const tabs = (
      <Tabs
        canCreate={
          populatedRoom.settings.participantsCanCreateTabs ||
          role === ROLE.FACILITATOR
        }
        tabs={currentTabs}
        ntfTabs={activityOnOtherTabs}
        currentTabId={currentTabId}
        onChangeTab={this.changeTab}
        onCreateNewTab={this.createNewTab}
      />
    );
    const chat = (
      <Chat
        roomId={populatedRoom._id}
        log={log || []}
        addToLog={this.addToLog}
        myColor={myColor}
        user={user}
        referencing={referencing}
        isSimplified={isSimplified}
        referToEl={referToEl}
        referToCoords={referToCoords}
        referFromEl={referFromEl}
        referFromCoords={referFromCoords}
        setToElAndCoords={this.setToElAndCoords}
        setFromElAndCoords={this.setFromElAndCoords}
        showingReference={showingReference}
        clearReference={this.clearReference}
        showReference={this.showReference}
        startNewReference={this.startNewReference}
        currentTabId={currentTabId}
        expanded={chatExpanded}
        membersExpanded={membersExpanded}
        toggleExpansion={this.toggleExpansion}
        eventsWithRefs={eventsWithRefs}
        goToReplayer={this.goToReplayer}
        createActivity={this.beginCreatingActivity}
        connectionStatus={connectionStatus}
        resetRoom={(...args) => {
          // don't allow admins to do a force reset
          if (!user.inAdminMode) resetRoom(...args);
        }}
      />
    );
    const graphs = currentTabs.map((tab) => (
      <TabTypes.Mathspace
        type={tab.tabType}
        temp={temp}
        key={tab._id}
        room={populatedRoom}
        user={user}
        currentTabId={currentTabId}
        updateRoomTab={connectUpdateRoomTab}
        tab={tab}
        inControl={inControl}
        toggleControl={this.toggleControl}
        updatedRoom={connectUpdatedRoom}
        addNtfToTabs={this.addNtfToTabs}
        isFirstTabLoaded={isFirstTabLoaded}
        setFirstTabLoaded={this.setFirstTabLoaded}
        referencing={referencing}
        updateUserSettings={connectUpdateUserSettings}
        addToLog={this.addToLog}
        emitEvent={this.emitEvent}
        onScreenChange={this.handleScreenChange}
        role={role}
        updateRoom={connectUpdateRoom}
        referToEl={referToEl}
        showingReference={showingReference}
        clearReference={this.clearReference}
        setToElAndCoords={this.setToElAndCoords}
        setGraphCoords={this.setGraphCoords}
        log={log}
        eventsWithRefs={eventsWithRefs}
        updateEventsWithReferences={this.updateEventsWithReferences}
      />
    ));
    let currentTabIx;
    const currentTab = find(currentTabs, (t, ix) => {
      if (t._id === currentTabId) {
        currentTabIx = ix;
        return true;
      }
      return false;
    });

    return (
      <Fragment>
        {!isFirstTabLoaded ? (
          <Loading message="Preparing your room..." />
        ) : null}
        <WorkspaceLayout
          snapshotRef={snapshotRef}
          graphs={graphs}
          roomName={populatedRoom.name}
          user={user}
          chat={chat}
          tabs={tabs}
          loaded={isFirstTabLoaded}
          bottomRight={
            <Tools
              controlState={controlState.buttonConfig}
              onClickExit={this.goBack}
              onClickControl={this.toggleControl}
              lastEvent={log[log.length - 1]}
              onClickSave={save}
              isSimplified={isSimplified}
              onToggleSimpleChat={this.toggleSimpleChat}
              referencing={referencing}
              onToggleReference={
                referencing ? this.clearReference : this.startNewReference
              }
              inAdminMode={user.inAdminMode}
              exitText="Exit Room"
              // Cannot use referencing or control when in admin mode
              {...(user.inAdminMode
                ? {
                    onToggleReference: undefined,
                    onClickControl: undefined,
                  }
                : null)}
              // TEMP ROOM NEEDS TO KNOW IF ITS BEEN SAVED...pass that along as props
            />
          }
          bottomLeft={
            <RoomInfo
              temp={temp}
              role={role}
              updateRoom={connectUpdateRoom}
              room={populatedRoom}
              currentTab={currentTab}
              currentTabIx={currentTabIx}
              updateRoomTab={this.updateTab}
            />
          }
          currentMembers={currentMembers}
          currentTabId={currentTabId}
          chatExpanded={chatExpanded}
          membersExpanded={membersExpanded}
          instructionsExpanded={instructionsExpanded}
          toolsExpanded={toolsExpanded}
          referToCoords={referToCoords}
          referToEl={referToEl}
          referFromCoords={referFromCoords}
          graphCoords={graphCoords}
        />
        <Modal show={creatingNewTab} closeModal={this.closeModal}>
          <NewTabForm
            room={populatedRoom}
            user={user}
            closeModal={this.closeModal}
            updatedRoom={connectUpdatedRoom}
            sendEvent={this.emitNewTab}
            setTabs={this.setTabs}
            currentTabs={currentTabs}
          />
        </Modal>
        <Modal
          show={showAdminWarning}
          closeModal={() => this.setState({ showAdminWarning: false })}
        >
          You are currently in &#34;Admin Mode&#34;. You are in this room
          anonymously. If you want to be seen in this room go to your profile
          and turn &#34;Admin Mode&#34; off.
        </Modal>
        <Modal
          show={showInstructionsModal}
          closeModal={() =>
            this.setState({
              showInstructionsModal: false,
              instructionsModalMsg: null,
            })
          }
          testId="instructions-modal"
        >
          {instructionsModalMsg}
        </Modal>
        {isCreatingActivity && (
          <CreationModal
            closeModal={this.closeCreate}
            isCreatingActivity
            populatedRoom={populatedRoom}
            currentTabs={currentTabs}
            user={user}
            currentTabId={currentTabId}
          />
        )}
      </Fragment>
    );
  }
}

Workspace.propTypes = {
  populatedRoom: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    instructions: PropTypes.string,
    members: PropTypes.arrayOf(PropTypes.shape({})),
    tabs: PropTypes.arrayOf(PropTypes.shape({ _id: PropTypes.string })),
    log: PropTypes.arrayOf(PropTypes.shape({})),
    controlledBy: PropTypes.string,
    currentMembers: PropTypes.arrayOf(PropTypes.shape({})),
    settings: PropTypes.shape({ participantsCanCreateTabs: PropTypes.bool }),
    getCurrentMembers: PropTypes.func.isRequired,
    adjustUser: PropTypes.func.isRequired,
  }).isRequired,
  tempCurrentMembers: PropTypes.arrayOf(PropTypes.shape({})),
  tempMembers: PropTypes.arrayOf(PropTypes.shape({})),
  lastMessage: PropTypes.shape({}),
  user: PropTypes.shape({
    _id: PropTypes.string,
    isAdmin: PropTypes.bool,
    inAdminMode: PropTypes.bool,
    username: PropTypes.string,
  }).isRequired,
  temp: PropTypes.bool,
  history: PropTypes.shape({ push: PropTypes.func, goBack: PropTypes.func })
    .isRequired,
  save: PropTypes.func,
  connectUpdateRoom: PropTypes.func.isRequired,
  connectUpdatedRoom: PropTypes.func.isRequired,
  connectUpdateRoomTab: PropTypes.func.isRequired,
  connectSetRoomStartingPoint: PropTypes.func.isRequired,
  connectUpdateUserSettings: PropTypes.func.isRequired,
  resetRoom: PropTypes.func,
  controlState: PropTypes.shape({
    buttonConfig: PropTypes.shape({}),
    inControl: PropTypes.string,
    controlledBy: PropTypes.string,
    matches: PropTypes.func,
  }),
  sendControlEvent: PropTypes.func,
};

Workspace.defaultProps = {
  tempCurrentMembers: null,
  tempMembers: null,
  lastMessage: null,
  save: null,
  temp: false,
  resetRoom: () => {},
  controlState: { buttonConfig: null, inControl: null, controlledBy: null },
  sendControlEvent: null,
};
const mapStateToProps = (state) => {
  return {
    loading: state.loading.loading,
  };
};

export default connect(mapStateToProps, {
  connectUpdateUser: updateUser,
  connectUpdateRoom: updateRoom,
  connectUpdatedRoom: updatedRoom,
  connectUpdatedRoomTab: updatedRoomTab,
  connectUpdateRoomTab: updateRoomTab,
  connectSetRoomStartingPoint: setRoomStartingPoint,
  connectUpdateUserSettings: updateUserSettings,
})(Workspace);
