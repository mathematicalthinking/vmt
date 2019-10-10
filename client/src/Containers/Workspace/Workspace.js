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
} from '../../store/actions';
import mongoIdGenerator from '../../utils/createMongoId';
import WorkspaceLayout from '../../Layout/Workspace/Workspace';
import { GgbGraph, DesmosGraph, Chat, Tabs, Tools, RoomInfo } from '.';
import { Modal, CurrentMembers, Loading } from '../../Components';
import NewTabForm from '../Create/NewTabForm';
import { socket, API } from '../../utils';

// import Replayer from ''
class Workspace extends Component {
  refBeingSaved = null;

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
      tabs: populatedRoom.tabs || [],
      log: populatedRoom.log || [],
      myColor,
      controlledBy: populatedRoom.controlledBy,
      activeMember: '',
      currentMembers: tempCurrentMembers || populatedRoom.currentMembers,
      referencing: false,
      showingReference: false,
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
      refPointToEmit: null,
      eventsWithRefs: [],
      refPointToClear: null,
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
  }

  componentDidUpdate(prevProps) {
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
  }

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
      this.clearReference();
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
    this.setState({ currentTabId: id, activityOnOtherTabs: updatedTabs });
  };

  toggleControl = (event, auto) => {
    const { populatedRoom, user } = this.props;
    const { controlledBy } = this.state;
    const { myColor } = this.state;
    if (!user.connected && !auto) {
      // i.e. if the user clicked the button manually instead of controll being toggled programatically
      // eslint-disable-next-line no-alert
      window.alert(
        'You have disconnected from the server. Check your internet connection and try refreshing the page'
      );
    }

    if (controlledBy === user._id) {
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
    const { doKeepReferencingOn = false, refBeingSaved = {} } = options;
    const { referToEl } = this.state;
    this.refBeingSaved = refBeingSaved;

    let refPointToClear;

    if (referToEl && referToEl.refPoint) {
      if (!this.hasRefPointBeenSaved(referToEl.refPoint)) {
        refPointToClear = referToEl.refPoint;
      }
    }

    if (doKeepReferencingOn) {
      this.setState({
        referToEl: null,
        referToCoords: null,
        showingReference: false,
        refPointToClear,
      });
    } else {
      this.setState({
        referToEl: null,
        referFromEl: null,
        referToCoords: null,
        referFromCoords: null,
        referencing: false,
        showingReference: false,
        refPointToClear,
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
    // const { connectPopulateRoom, room } = this.props;
    this.setState({ isFirstTabLoaded: true });
    // refetech the room after its loaded to make sure we didnt miss any events that came over the wire while initializing ggb
    // connectPopulateRoom(room._id, { events: true });
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

  triggerAddRefEvent = (refPointToEmit) => {
    this.setState({ refPointToEmit });
  };

  clearRefPointToEmit = () => {
    this.setState({ refPointToEmit: null });
  };

  computeReferences = () => {
    const { log } = this.state;
    const eventsWithRefs = log.filter(this.doesEventHaveReference);
    this.setState({ eventsWithRefs });
  };

  renameReferences = (oldLabel, newLabel) => {
    const { eventsWithRefs } = this.state;

    let doUpdateState = false;

    const updatedEvents = eventsWithRefs.map((ev) => {
      const { reference } = ev;
      let doUpdate = false;
      if (reference.element === oldLabel && !reference.refPoint) {
        ev.reference.element = newLabel;
        ev.reference.wasObjectUpdated = true;
        doUpdate = true;
      } else if (oldLabel === reference.refPoint) {
        // if for some reason the refPoint was renamed
        ev.reference.refPoint = newLabel;
        ev.reference.wasObjectUpdated = true;
        doUpdate = true;
      }
      if (doUpdate) {
        doUpdateState = true;
        API.put('messages', ev._id, ev);
      }
      return reference;
    });

    if (doUpdateState) {
      this.setState({ eventsWithRefs: updatedEvents });
    }
  };

  hasRefPointBeenSaved = (refPoint) => {
    if (this.refBeingSaved && this.refBeingSaved.refPoint === refPoint) {
      return true;
    }

    const { eventsWithRefs } = this.state;
    const event = find(eventsWithRefs, (ev) => {
      return ev.reference.refPoint === refPoint;
    });

    if (event) {
      return true;
    }
    return false;
  };

  clearRefPointToClear = () => {
    this.setState({ refPointToClear: null });
  };

  doesEventHaveReference = (event) => {
    if (!event || !event.reference) {
      return false;
    }
    return typeof event.reference.element === 'string';
  };

  updateRemovedReferences = (label) => {
    const { eventsWithRefs } = this.state;

    let doUpdate = false;
    const updatedEvents = eventsWithRefs.map((event) => {
      if (
        event.reference.element === label &&
        !event.reference.wasObjectDeleted
      ) {
        doUpdate = true;
        event.reference.wasObjectDeleted = true;
        API.put('messages', event._id, event);
      }
      return event;
    });

    if (doUpdate) {
      this.setState({ eventsWithRefs: updatedEvents });
    }
  };

  updateModifiedReferences = (label) => {
    const { eventsWithRefs } = this.state;

    let doUpdate = false;
    const updatedEvents = eventsWithRefs.map((event) => {
      if (
        event.reference.element === label &&
        !event.reference.wasObjectUpdated
      ) {
        doUpdate = true;
        event.reference.wasObjectUpdated = true;
        API.put('messages', event._id, event);
      }
      return event;
    });

    if (doUpdate) {
      this.setState({ eventsWithRefs: updatedEvents });
    }
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
      refPointToEmit,
      eventsWithRefs,
      refPointToClear,
    } = this.state;
    let inControl = 'OTHER';
    if (controlledBy === user._id) inControl = 'ME';
    else if (!controlledBy) inControl = 'NONE';
    const currentMembers = (
      <CurrentMembers
        members={tempMembers || populatedRoom.members}
        currentMembers={tempCurrentMembers || activeMembers}
        activeMember={populatedRoom.controlledBy}
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
    // {role === 'facilitator' ? <div className={[classes.Tab, classes.NewTab].join(' ')}><div onClick={createNewTab}    className={classes.TabBox}><i className="fas fa-plus"></i></div></div> : null}
    const chat = (
      <Chat
        roomId={populatedRoom._id}
        log={log || []}
        addToLog={this.addToLog}
        myColor={myColor}
        user={user}
        referencing={referencing}
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
        triggerAddRefEvent={this.triggerAddRefEvent}
        clearRefPointToEmit={this.clearRefPointToEmit}
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
            setFirstTabLoaded={() => this.setState({ isFirstTabLoaded: true })}
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
          refPointToEmit={refPointToEmit}
          clearRefPointToEmit={this.clearRefPointToEmit}
          eventsWithRefs={eventsWithRefs}
          renameReferences={this.renameReferences}
          refPointToClear={refPointToClear}
          clearRefPointToClear={this.clearRefPointToClear}
          hasRefPointBeenSaved={this.hasRefPointBeenSaved}
          updateRemovedReferences={this.updateRemovedReferences}
          updateModifiedReferences={this.updateModifiedReferences}
        />
      );
    });
    return (
      <Fragment>
        {!isFirstTabLoaded ? (
          <Loading message="Preparing your room..." />
        ) : null}
        <WorkspaceLayout
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
              referencing={referencing}
              startNewReference={this.startNewReference}
              clearReference={this.clearReference}
              // TEMP ROOM NEEDS TO KNOW IF ITS BEEN SAVED...pass that along as props
            />
          }
          bottomLeft={
            <RoomInfo
              temp={temp}
              role={role}
              updateRoom={connectUpdateRoom}
              room={populatedRoom}
              currentTab={currentTabs.filter((t) => t._id === currentTabId)[0]}
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
  temp: PropTypes.bool,
  history: PropTypes.shape({}).isRequired,
  save: PropTypes.func,
  connectUpdateRoom: PropTypes.func.isRequired,
  connectUpdatedRoom: PropTypes.func.isRequired,
  connectUpdateRoomTab: PropTypes.func.isRequired,
  connectSetRoomStartingPoint: PropTypes.func.isRequired,
};

Workspace.defaultProps = {
  tempCurrentMembers: null,
  tempMembers: null,
  lastMessage: null,
  save: null,
  temp: false,
};
const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user._id ? state.user : ownProps.user, // with tempWorkspace we won't have a user in the store
    loading: state.loading.loading,
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
  }
)(Workspace);
