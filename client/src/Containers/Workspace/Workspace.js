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
} from '../../store/actions';
import mongoIdGenerator from '../../utils/createMongoId';
import WorkspaceLayout from '../../Layout/Workspace/Workspace';
import {
  GgbGraph,
  DesmosGraph,
  DesmosActivity,
  CodePyretOrg,
  Chat,
  Tabs,
  Tools,
  RoomInfo,
} from '.';
import { Modal, CurrentMembers, Loading } from '../../Components';
import NewTabForm from '../Create/NewTabForm';
import CreationModal from './Tools/CreationModal';
import { socket, useSnapshots } from '../../utils';
import API from '../../utils/apiRequests';

class Workspace extends Component {
  constructor(props) {
    super(props);
    const { user, populatedRoom, tempCurrentMembers } = this.props;
    let myColor = null;
    if (populatedRoom.members) {
      try {
        myColor = populatedRoom.members.filter(
          (member) => member.user._id === user._id
        )[0].color;
      } catch (err) {
        if (user.isAdmin) {
          myColor = '#ffd549';
        }
      }
    }
    this.state = {
      takeSnapshot: () => {},
      cancelSnapshots: () => {},
      getSnapshot: () => {
        return undefined;
      },
      snapshotRef: React.createRef(),
      tabs: populatedRoom.tabs || [],
      log: populatedRoom.log || [],
      myColor,
      controlledBy: populatedRoom.controlledBy,
      activeMember: '',
      currentMembers: tempCurrentMembers || populatedRoom.currentMembers,
      referencing: false,
      showingReference: false,
      isSimplified: true,
      referToEl: null,
      referToCoords: null,
      referFromEl: null,
      referFromCoords: null,
      currentTabId: populatedRoom.tabs[0]._id,
      role: 'participant',
      creatingNewTab: false,
      activityOnOtherTabs: [],
      chatExpanded: true,
      membersExpanded: true,
      instructionsExpanded: true,
      toolsExpanded: true,
      isFirstTabLoaded: false,
      showAdminWarning: user ? user.inAdminMode : false,
      graphCoords: null,
      eventsWithRefs: [],
      showInstructionsModal: false,
      instructionsModalMsg: '',
      isCreatingActivity: false,
      isSlowConnection: true,
    };
  }

  componentDidMount() {
    const { populatedRoom, user, temp, tempMembers, lastMessage } = this.props;

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
    const roomId = populatedRoom._id;
    if (roomId && roomId !== '') {
      const {
        elementRef,
        takeSnapshot,
        cancelSnaphots,
        getSnapshot,
      } = useSnapshots((newSnapshot) => {
        const { connectUpdateRoom } = this.props;
        console.log('Creating snap for ', roomId);
        console.log(newSnapshot);
        connectUpdateRoom(roomId, {
          snapshot: newSnapshot,
        });
        populatedRoom.snapshot = newSnapshot; // not sure why connectUpdateRoom doesn't do this...
      }, populatedRoom.snapshot || {});
      this.setState({
        takeSnapshot,
        snapshotRef: elementRef,
        cancelSnaphots,
        getSnapshot,
      });

      this._takeSnapshotIfNeeded();
    }
  }

  componentDidUpdate(prevProps) {
    // @TODO populatedRoom.controlledBy is ALWAYS null! Should use
    // controlledBy in the state instead.
    const { populatedRoom, user, temp, lastMessage } = this.props;
    if (
      prevProps.populatedRoom.controlledBy === null &&
      populatedRoom.controlledBy !== null &&
      populatedRoom.controlledBy !== user._id
    ) {
      //   socket.emit('RELEASE_CONTROL', {user: {_id: this.props.user._id, username: this.props.user.username}, roomId: this.props.room._id}, (err, message) => {
      //     this.props.updatedRoom(this.props.room._id, {chat: [...this.props.room.chat, message]})
      //     // this.setState({activeMember: ''})
      //   })
    }

    if (!user.connected && populatedRoom.controlledBy === user._id) {
      const auto = true;
      this.toggleControl(null, auto);
    }

    if (temp) {
      if (prevProps.lastMessage !== lastMessage) {
        this.addToLog(lastMessage);
      }
    }

    if (prevProps.user.inAdminMode !== user.inAdminMode) {
      this.goBack();
    }

    // this._takeSnapshotIfNeeded(); // likely too CPU intensive and noticible by user.

    // const { takeSnapshot } = this.state;
    // if (prevProps.controlledBy === user._id) takeSnapshot();
  }

  componentWillUnmount() {
    const { populatedRoom } = this.props;
    const { myColor } = this.state;
    socket.emit('LEAVE_ROOM', populatedRoom._id, myColor);
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('keypress', this.keyListener);
    if (this.controlTimer) {
      clearTimeout(this.controlTimer);
    }

    socket.off('pong');
    const { cancelSnapshots } = this.state;
    cancelSnapshots(); // if Workspace were a functional component, we'd do this directly in the custom hook.
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
    const { currentScreen } = this.props;
    const { currentTabId } = this.state;
    return { currentTabId, currentScreen };
  };

  _takeSnapshotIfNeeded = () => {
    const { takeSnapshot, getSnapshot } = this.state;
    const key = this._snapshotKey();
    if (!getSnapshot(key)) takeSnapshot(key);
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
    const { temp, populatedRoom, user } = this.props;
    const { myColor } = this.state;
    socket.removeAllListeners('USER_JOINED');
    socket.removeAllListeners('CREATED_TAB');
    socket.removeAllListeners('USER_LEFT');
    socket.removeAllListeners('RELEASED_CONTROL');
    socket.removeAllListeners('TOOK_CONTROL');

    // const updatedUsers = [...room.currentMembers, {user: {_id: user._id, username: user.username}}]
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
        if (role === 'facilitator') {
          this.setState({ role: 'facilitator' });
        }
      } catch (err) {
        if (user.isAdmin) {
          this.setState({ role: 'admin' });
        }
      }
      if (!user.inAdminMode) {
        socket.emit('JOIN', sendData, ({ room, message }, err) => {
          if (err) {
            // eslint-disable-next-line no-console
            console.log(err); // HOW SHOULD WE HANDLE THIS
          }
          this.setState({
            currentMembers: room.currentMembers,
          });
          this.addToLog(message);
        });
      }
    }

    socket.on('USER_JOINED', (data) => {
      this.setState({
        currentMembers: data.currentMembers,
      });
      this.addToLog(data.message);
    });

    socket.on('USER_LEFT', (data) => {
      let { controlledBy } = this.state;
      if (data.releasedControl) {
        controlledBy = null;
      }
      this.setState({ controlledBy, currentMembers: data.currentMembers });
      this.addToLog(data.message);
    });

    socket.on('TOOK_CONTROL', (message) => {
      this.addToLog(message);
      this.setState({
        awarenessDesc: message.text,
        awarenessIcon: 'USER',
        controlledBy: message.user._id,
      });
    });

    socket.on('RELEASED_CONTROL', (message) => {
      this.addToLog(message);
      this.setState({
        awarenessDesc: message.text,
        awarenessIcon: 'USER',
        controlledBy: null,
      });
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

    // helper to determine latency
    // 0-3 local, <50 good, <100 ok, >100 potential issues
    // Set Threshold const to max acceptable latency in ms
    const THRESHOLD = 100;
    socket.on('pong', (latency) => {
      this.setState({ isSlowConnection: latency > THRESHOLD });
      console.log('Heartbeat<3 Socket latency: ', latency);
    });
  };

  createNewTab = () => {
    const { role } = this.state;
    const { populatedRoom } = this.props;
    if (
      role === 'facilitator' ||
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
      text: `${user.username} swtiched to ${
        tabs.filter((t) => t._id === id)[0].name
      }`,
      autogenerated: true,
      room: populatedRoom._id,
      messageType: 'SWITCH_TAB',
      color: myColor,
      timestamp: new Date().getTime(),
    };
    socket.emit('SWITCH_TAB', data, (res, err) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.log('something went wrong on the socket:', err);
      }
      // this.props.updatedRoom(this.props.room._id, {
      //   chat: [...this.props.room.chat, res.message]
      // });
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

  toggleControl = (event, auto) => {
    const { populatedRoom, user } = this.props;
    const { controlledBy } = this.state;
    const { myColor } = this.state;
    if (!user.connected && !auto) {
      // i.e. if the user clicked the button manually instead of controll being toggled programatically
      window.alert(
        'You have disconnected from the server. Check your internet connection and try refreshing the page'
      );
    }
    // console.log(
    //   'toggling control..., currently controlled by you-',
    //   controlledBy === user._id
    // );

    if (controlledBy === user._id) {
      const { takeSnapshot } = this.state;
      takeSnapshot(this._snapshotKey());

      // Releasing control
      const message = {
        _id: mongoIdGenerator(),
        user: { _id: user._id, username: 'VMTBot' },
        room: populatedRoom._id,
        text: `${user.username} released control`,
        autogenerated: true,
        messageType: 'RELEASED_CONTROL',
        color: myColor,
        timestamp: new Date().getTime(),
      };
      this.addToLog(message);
      this.setState({
        awarenessDesc: message.text,
        awarenessIcon: null,
        controlledBy: null,
      });
      socket.emit('RELEASE_CONTROL', message, (err) => {
        // eslint-disable-next-line no-console
        if (err) console.log(err);
      });
      clearTimeout(this.controlTimer);
    }

    // If room is controlled by someone else
    else if (controlledBy) {
      const message = {
        _id: mongoIdGenerator(),
        text: 'Can I take control?',
        messageType: 'TEXT',
        user: { _id: user._id, username: user.username },
        room: populatedRoom._id,
        color: myColor,
        timestamp: new Date().getTime(),
      };
      socket.emit('SEND_MESSAGE', message, () => {
        this.addToLog(message);
      });
    } else if (user.inAdminMode) {
      this.setState({
        showAdminWarning: true,
      });
    } else if (!user.connected) {
      // Let all of the state updates finish and then show an alert
      setTimeout(
        () =>
          window.alert(
            'You have disconnected from the server. Check your internet connection and try refreshing the page'
          ),
        0
      );
    } else {
      // We're taking control
      this.setState({ controlledBy: user._id, referencing: false });
      this.resetControlTimer();
      const message = {
        _id: mongoIdGenerator(),
        user: { _id: user._id, username: 'VMTBot' },
        room: populatedRoom._id,
        text: `${user.username} took control`,
        messageType: 'TOOK_CONTROL',
        autogenerated: true,
        color: myColor,
        timestamp: new Date().getTime(),
      };
      this.addToLog(message);
      socket.emit('TAKE_CONTROL', message, () => {});
    }
  };

  emitNewTab = (tabInfo) => {
    const { myColor } = this.state;
    tabInfo.message.color = myColor;
    socket.emit('NEW_TAB', tabInfo, () => {
      this.addToLog(tabInfo.message);
    });
  };

  resetControlTimer = () => {
    this.time = Date.now();
    clearTimeout(this.controlTimer);
    this.controlTimer = setTimeout(() => {
      this.toggleControl();
    }, 60 * 1000);
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
      const msg = `The referenced object (${referToEl.elementType} ${
        referToEl.element
      }) was deleted.`;
      window.alert(msg);
      return;
    }

    if (referToEl.wasObjectUpdated) {
      const msg = `Caution! The referenced object (${referToEl.elementType} ${
        referToEl.element
      }) has been modified since the time of reference.`;
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
    const { populatedRoom, history } = this.props;
    const { _id } = populatedRoom;
    history.push(`/myVMT/rooms/${_id}/details`);
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
    const { user, populatedRoom } = this.props;

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

    if (!instructions && (tabIndex === 0 && populatedRoom.instructions)) {
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

  render() {
    const {
      populatedRoom,
      user,
      connectUpdateRoom,
      connectUpdatedRoom,
      save,
      temp,
      tempMembers,
      connectUpdateRoomTab,
      tempCurrentMembers,
      connectUpdateUserSettings,
    } = this.props;
    const {
      tabs: currentTabs,
      currentMembers: activeMembers,
      log,
      controlledBy,
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
      isSlowConnection,
    } = this.state;
    let inControl = 'OTHER';
    if (controlledBy === user._id) inControl = 'ME';
    else if (!controlledBy) inControl = 'NONE';

    const currentMembers = (
      <CurrentMembers
        members={tempMembers || populatedRoom.members}
        currentMembers={tempCurrentMembers || activeMembers}
        activeMember={controlledBy}
        expanded={membersExpanded}
        toggleExpansion={this.toggleExpansion}
      />
    );
    const tabs = (
      <Tabs
        participantCanCreate={populatedRoom.settings.participantsCanCreateTabs}
        tabs={currentTabs}
        ntfTabs={activityOnOtherTabs}
        currentTabId={currentTabId}
        memberRole={role}
        changeTab={this.changeTab}
        createNewTab={this.createNewTab}
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
        isSlowConnection={isSlowConnection}
      />
    );
    const graphs = currentTabs.map((tab) => {
      if (tab.tabType === 'desmos') {
        return (
          <DesmosGraph
            key={tab._id}
            room={populatedRoom}
            user={user}
            resetControlTimer={this.resetControlTimer}
            currentTabId={currentTabId}
            updateRoomTab={connectUpdateRoomTab}
            tab={tab}
            inControl={inControl}
            myColor={myColor}
            toggleControl={this.toggleControl}
            updatedRoom={connectUpdatedRoom}
            addNtfToTabs={this.addNtfToTabs}
            isFirstTabLoaded={isFirstTabLoaded}
            setFirstTabLoaded={this.setFirstTabLoaded}
            referencing={referencing}
            updateUserSettings={connectUpdateUserSettings}
            addToLog={this.addToLog}
          />
        );
      }
      if (tab.tabType === 'desmosActivity') {
        return (
          <DesmosActivity
            key={tab._id}
            room={populatedRoom}
            user={user}
            resetControlTimer={this.resetControlTimer}
            currentTabId={currentTabId}
            updateRoomTab={connectUpdateRoomTab}
            tab={tab}
            inControl={inControl}
            myColor={myColor}
            toggleControl={this.toggleControl}
            updatedRoom={connectUpdatedRoom}
            addNtfToTabs={this.addNtfToTabs}
            isFirstTabLoaded={isFirstTabLoaded}
            setFirstTabLoaded={this.setFirstTabLoaded}
            referencing={referencing}
            updateUserSettings={connectUpdateUserSettings}
            addToLog={this.addToLog}
          />
        );
      }
      if (tab.tabType === 'pyret') {
        return (
          <CodePyretOrg
            key={tab._id}
            room={populatedRoom}
            user={user}
            resetControlTimer={this.resetControlTimer}
            currentTabId={currentTabId}
            updateRoomTab={connectUpdateRoomTab}
            tab={tab}
            inControl={inControl}
            myColor={myColor}
            toggleControl={this.toggleControl}
            updatedRoom={connectUpdatedRoom}
            addNtfToTabs={this.addNtfToTabs}
            isFirstTabLoaded={isFirstTabLoaded}
            setFirstTabLoaded={this.setFirstTabLoaded}
            referencing={referencing}
            updateUserSettings={connectUpdateUserSettings}
            addToLog={this.addToLog}
          />
        );
      }
      return (
        <GgbGraph
          key={tab._id}
          room={populatedRoom}
          tab={tab}
          user={user}
          myColor={myColor}
          role={role}
          addToLog={this.addToLog}
          updateRoom={connectUpdateRoom}
          updatedRoom={connectUpdatedRoom}
          resetControlTimer={this.resetControlTimer}
          inControl={inControl}
          currentTabId={currentTabId}
          addNtfToTabs={this.addNtfToTabs}
          toggleControl={this.toggleControl}
          isFirstTabLoaded={isFirstTabLoaded}
          referToEl={referToEl}
          showingReference={showingReference}
          referencing={referencing}
          clearReference={this.clearReference}
          setToElAndCoords={this.setToElAndCoords}
          setFirstTabLoaded={this.setFirstTabLoaded}
          setGraphCoords={this.setGraphCoords}
          log={log}
          eventsWithRefs={eventsWithRefs}
          updateEventsWithReferences={this.updateEventsWithReferences}
        />
      );
    });
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
              inControl={inControl}
              goBack={this.goBack}
              toggleControl={this.toggleControl}
              lastEvent={log[log.length - 1]}
              save={save}
              isSimplified={isSimplified}
              toggleSimpleChat={this.toggleSimpleChat}
              referencing={referencing}
              startNewReference={this.startNewReference}
              clearReference={this.clearReference}
              inAdminMode={user.inAdminMode}
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
  populatedRoom: PropTypes.shape({}).isRequired,
  tempCurrentMembers: PropTypes.arrayOf(PropTypes.shape({})),
  tempMembers: PropTypes.arrayOf(PropTypes.shape({})),
  lastMessage: PropTypes.shape({}),
  user: PropTypes.shape({}).isRequired,
  currentScreen: PropTypes.number,
  temp: PropTypes.bool,
  history: PropTypes.shape({}).isRequired,
  save: PropTypes.func,
  connectUpdateRoom: PropTypes.func.isRequired,
  connectUpdatedRoom: PropTypes.func.isRequired,
  connectUpdateRoomTab: PropTypes.func.isRequired,
  connectSetRoomStartingPoint: PropTypes.func.isRequired,
  connectUpdateUserSettings: PropTypes.func.isRequired,
};

Workspace.defaultProps = {
  tempCurrentMembers: null,
  tempMembers: null,
  lastMessage: null,
  save: null,
  temp: false,
  currentScreen: 0,
};
const mapStateToProps = (state, ownProps) => {
  const { tabs } = state.rooms.byId[ownProps.populatedRoom._id];
  const currentTabId = ownProps.populatedRoom.tabs[0]._id;
  const currentTabInfo = tabs.find((tab) => {
    return tab._id === currentTabId;
  });

  return {
    user: state.user._id ? state.user : ownProps.user, // with tempWorkspace we won't have a user in the store
    loading: state.loading.loading,
    // currentScreen, only important now for DesmosActivities, is used by the snapshot facililty.
    // Even on DesmosActivities, this won't be set if the person doesn't navigate before a snapshot is taken. THus, it's
    // important that the default is 0 (indicating the first screen)
    currentScreen: currentTabInfo.currentScreen || 0,
  };
};

export default connect(
  mapStateToProps,
  {
    connectUpdateUser: updateUser,
    connectUpdateRoom: updateRoom,
    connectUpdatedRoom: updatedRoom,
    connectUpdatedRoomTab: updatedRoomTab,
    connectUpdateRoomTab: updateRoomTab,
    connectSetRoomStartingPoint: setRoomStartingPoint,
    connectUpdateUserSettings: updateUserSettings,
  }
)(Workspace);
