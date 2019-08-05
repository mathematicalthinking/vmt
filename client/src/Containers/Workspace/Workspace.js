/* eslint-disable react/jsx-indent */
/* eslint-disable no-alert */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  updateRoom,
  updatedRoom,
  updatedRoomTab,
  setRoomStartingPoint,
  updateUser,
} from '../../store/actions';
import mongoIdGenerator from '../../utils/createMongoId';
import WorkspaceLayout from '../../Layout/Workspace/Workspace';
import { GgbGraph, DesmosGraph, Chat, Tabs, Tools, RoomInfo } from '.';
import { Modal, CurrentMembers, Loading } from '../../Components';
import NewTabForm from '../Create/NewTabForm';
import { socket, buildLog, COLOR_MAP, API } from '../../utils';

// import Replayer from ''
class Workspace extends Component {
  constructor(props) {
    super(props);
    const { user, room } = this.props;
    let myColor = null;
    if (room.members) {
      try {
        myColor = room.members.filter(member => member.user._id === user._id)[0]
          .color;
      } catch (err) {
        if (user.isAdmin) {
          myColor = '#ffd549';
        }
      }
    }
    this.state = {
      tabs: [],
      log: [],
      myColor,
      controlledBy: room.controlledBy,
      activeMember: '',
      referencing: false,
      showingReference: false,
      referToEl: null,
      referToCoords: null,
      referFromEl: null,
      referFromCoords: null,
      currentTabId: room.tabs[0]._id,
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
    };
  }

  componentDidMount() {
    const { room, user, temp } = this.props;
    // connectUpdateUser({ connected: socket.connected });
    if (!temp) {
      API.getPopulatedById('rooms', room._id, false, true)
        .then(res => {
          // creae a log combining events and chat messages
          const populatedRoom = res.data.result;
          const log = buildLog(populatedRoom.tabs, populatedRoom.chat);
          this.setState({ log, tabs: populatedRoom.tabs }, () => {
            this.initializeListeners();
          });
          // consider deleting tab.events and room.chat here since we have all of the information in the log now
          // dispatch(updatedRoom(id, room));
          // dispatch(loading.success());
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.log(err);
        });
      if (room.members) {
        let myColor;
        try {
          myColor = room.members.filter(
            member => member.user._id === user._id
          )[0].color;
        } catch (err) {
          if (user.isAdmin) {
            myColor = '#ffd549';
          }
        }
        this.setState({ myColor });
      }
    } else {
      this.setState({ myColor: COLOR_MAP[room.members.length - 1] });
      this.initializeListeners();
    }
    window.addEventListener('resize', this.clearReference);
    window.addEventListener('keydown', this.keyListener);
  }

  componentDidUpdate(prevProps) {
    const { room, user } = this.props;
    // let { user } = this.props;
    // When we first the load room
    // if (prevProps.room.controlledBy === null && this.props.room.controlledBy !==  null && this.) {
    //   console.log('someonelse in controll')
    //   this.setState({someoneElseInControl: true, inControl: false})
    // }

    if (
      prevProps.room.controlledBy === null &&
      room.controlledBy !== null &&
      room.controlledBy !== user._id
    ) {
      //   socket.emit('RELEASE_CONTROL', {user: {_id: this.props.user._id, username: this.props.user.username}, roomId: this.props.room._id}, (err, message) => {
      //     this.props.updatedRoom(this.props.room._id, {chat: [...this.props.room.chat, message]})
      //     // this.setState({activeMember: ''})
      //   })
    }

    if (!prevProps.room.log && room.log) {
      this.initializeListeners();
    }

    if (!user.connected && room.controlledBy === user._id) {
      const auto = true;
      this.toggleControl(null, auto);
    }
  }

  componentWillUnmount() {
    const { room } = this.props;
    const { myColor } = this.state;
    socket.emit('LEAVE_ROOM', room._id, myColor);
    window.removeEventListener('resize', this.clearReference);
    window.removeEventListener('keypress', this.keyListener);
  }

  addToLog = entry => {
    console.log(entry);
    const { log } = this.state;
    this.setState({ log: [...log, entry] });
  };

  keyListener = event => {
    const { referencing } = this.state;
    if (event.key === 'Escape' && referencing) {
      this.clearReference();
    }
  };

  initializeListeners = () => {
    console.log('initing listeners');
    const { temp, room, user, connectUpdatedRoom } = this.props;
    const { myColor } = this.state;
    socket.removeAllListeners('USER_JOINED');
    socket.removeAllListeners('CREATED_TAB');
    socket.removeAllListeners('USER_LEFT');
    socket.removeAllListeners('RELEASED_CONTROL');
    socket.removeAllListeners('TOOK_CONTROL');

    const sendData = {
      _id: mongoIdGenerator(),
      userId: user._id,
      roomId: room._id,
      username: user.username,
      roomName: room.name,
      color: myColor,
    };
    // const updatedUsers = [...room.currentMembers, {user: {_id: user._id, username: user.username}}]
    if (!temp) {
      // if the user joined this room with their admin privileges instead of being a bona fide member they won't be in the room list
      try {
        const { role } = room.members.filter(
          member => member.user._id === user._id
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
        socket.emit('JOIN', sendData, (res, err) => {
          if (err) {
            console.log('error');
            // eslint-disable-next-line no-console
            console.log(err); // HOW SHOULD WE HANDLE THIS
          }
          connectUpdatedRoom(room._id, {
            currentMembers: res.room.currentMembers,
          });
          this.addToLog(res.message);
        });
      }
    }

    socket.on('USER_JOINED', data => {
      connectUpdatedRoom(room._id, { currentMembers: data.currentMembers });
      this.addToLog(data.message);
    });

    socket.on('USER_LEFT', data => {
      if (data.releasedControl) {
        connectUpdatedRoom(room._id, { controlledBy: null });
      }
      const updatedChat = [...room.chat];
      updatedChat.push(data.message);
      connectUpdatedRoom(room._id, { currentMembers: data.currentMembers });
      this.addToLog(data.message);
    });

    socket.on('TOOK_CONTROL', message => {
      this.addToLog(message);
      // connectUpdatedRoom(room._id, { controlledBy: message.user._id });
      this.setState({
        awarenessDesc: message.text,
        awarenessIcon: 'USER',
        controlledBy: message.user._id,
      });
    });

    socket.on('RELEASED_CONTROL', message => {
      this.addToLog(message);
      connectUpdatedRoom(room._id, { controlledBy: null });
      this.setState({
        awarenessDesc: message.text,
        awarenessIcon: 'USER',
        controlledBy: message.user._id,
      });
    });

    socket.on('CREATED_TAB', data => {
      this.addToLog(data.message);
      delete data.message;
      delete data.creator;
      const tabs = [...room.tabs];
      tabs.push(data);
      connectUpdatedRoom(room._id, { tabs });
    });
  };

  createNewTab = () => {
    const { role } = this.state;
    const { room } = this.props;
    if (role === 'facilitator' || room.settings.participantsCanCreateTabs) {
      this.setState({ creatingNewTab: true });
    }
  };

  closeModal = () => {
    this.setState({ creatingNewTab: false });
  };

  changeTab = id => {
    const { room, user } = this.props;
    const { activityOnOtherTabs, myColor } = this.state;
    this.clearReference();
    const data = {
      _id: mongoIdGenerator(),
      user: { _id: user._id, username: 'VMTBot' },
      text: `${user.username} swtiched to ${
        room.tabs.filter(t => t._id === id)[0].name
      }`,
      autogenerated: true,
      room: room._id,
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
    const updatedTabs = activityOnOtherTabs.filter(tab => tab !== id);
    this.setState({ currentTabId: id, activityOnOtherTabs: updatedTabs });
  };

  toggleControl = (event, auto) => {
    const { room, user, connectUpdatedRoom } = this.props;
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
        room: room._id,
        text: `${user.username} released control`,
        autogenerated: true,
        messageType: 'RELEASED_CONTROL',
        color: myColor,
        timestamp: new Date().getTime(),
      };
      connectUpdatedRoom(room._id, { controlledBy: null });
      this.addToLog(message);
      this.setState({
        awarenessDesc: message.text,
        awarenessIcon: null,
        controlledBy: null,
      });
      socket.emit('RELEASE_CONTROL', message, err => {
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
        room: room._id,
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
      this.setState({ controlledBy: user._id });
      this.resetControlTimer();
      const message = {
        _id: mongoIdGenerator(),
        user: { _id: user._id, username: 'VMTBot' },
        room: room._id,
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

  emitNewTab = tabInfo => {
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
    tab
  ) => {
    const { currentTabId } = this.state;
    if (tab !== currentTabId && referToEl.elementType !== 'chat_message') {
      window.alert('This reference does not belong to this tab'); // @TODO HOW SHOULD WE HANDLE THIS?
    } else {
      this.setState({
        referToEl,
        referFromEl,
        referToCoords,
        referFromCoords,
        showingReference: true,
      });
    }
    // get coords of referenced element,
  };

  clearReference = () => {
    this.setState({
      referToEl: null,
      referFromEl: null,
      referToCoords: null,
      referFromCoords: null,
      referencing: false,
      showingReference: false,
    });
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

  addNtfToTabs = id => {
    this.setState(prevState => ({
      activityOnOtherTabs: [...prevState.activityOnOtherTabs, id],
    }));
  };

  clearTabNtf = id => {
    this.setState(prevState => ({
      activityOnOtherTabs: prevState.activityOnOtherTabs.filter(
        tab => tab !== id
      ),
    }));
  };

  setStartingPoint = () => {
    const { connectSetRoomStartingPoint, room } = this.props;
    connectSetRoomStartingPoint(room._id);
  };

  toggleExpansion = element => {
    this.setState(prevState => ({
      [`${element}Expanded`]: !prevState[`${element}Expanded`],
    }));
  };

  goBack = () => {
    const { history } = this.props;
    history.goBack();
  };

  setGraphCoords = graphCoords => {
    this.setState({ graphCoords });
  };

  setFirstTabLoaded = () => {
    // const { connectPopulateRoom, room } = this.props;
    this.setState({ isFirstTabLoaded: true });
    // refetech the room after its loaded to make sure we didnt miss any events that came over the wire while initializing ggb
    // connectPopulateRoom(room._id, { events: true });
  };

  render() {
    const {
      room,
      user,
      connectUpdateRoom,
      connectUpdatedRoom,
      save,
      temp,
    } = this.props;
    const {
      tabs: currentTabs,
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
    } = this.state;
    let inControl = 'OTHER';
    if (controlledBy === user._id) inControl = 'ME';
    else if (!controlledBy) inControl = 'NONE';
    const currentMembers = (
      <CurrentMembers
        members={room.members}
        currentMembers={room.currentMembers}
        activeMember={room.controlledBy}
        expanded={membersExpanded}
        toggleExpansion={this.toggleExpansion}
      />
    );
    let tabs;
    if (room.tabs[0].name) {
      // This che
      tabs = (
        <Tabs
          participantCanCreate={room.settings.participantsCanCreateTabs}
          tabs={currentTabs}
          ntfTabs={activityOnOtherTabs}
          currentTabId={currentTabId}
          memberRole={role}
          changeTab={this.changeTab}
          createNewTab={this.createNewTab}
        />
      );
    }
    // {role === 'facilitator' ? <div className={[classes.Tab, classes.NewTab].join(' ')}><div onClick={createNewTab}    className={classes.TabBox}><i className="fas fa-plus"></i></div></div> : null}
    const chat = (
      <Chat
        roomId={room._id}
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
      />
    );
    const graphs = currentTabs.map((tab, i) => {
      if (tab.tabType === 'desmos') {
        return (
          <DesmosGraph
            key={tab._id}
            room={room}
            user={user}
            resetControlTimer={this.resetControlTimer}
            currentTabId={currentTabId}
            tabId={i}
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
          room={room}
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
        />
      );
    });
    return (
      <Fragment>
        {!isFirstTabLoaded ? (
          <Loading message="Preparing your room..." />
        ) : null}
        {temp ||
        (currentTabs[0] &&
          // we check these fields to check if the room was populated.
          (currentTabs[0].currentState ||
            currentTabs[0].ggbFile ||
            currentTabs[0].startingPoint)) ? (
          <WorkspaceLayout
            graphs={graphs}
            roomName={room.name}
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
                room={room}
                currentTab={currentTabs.filter(t => t._id === currentTabId)[0]}
                currentTabId={currentTabId}
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
        ) : null}
        <Modal show={creatingNewTab} closeModal={this.closeModal}>
          <NewTabForm
            room={room}
            user={user}
            closeModal={this.closeModal}
            updatedRoom={connectUpdatedRoom}
            sendEvent={this.emitNewTab}
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
  room: PropTypes.shape({}).isRequired,
  user: PropTypes.shape({}).isRequired,
  temp: PropTypes.bool,
  history: PropTypes.shape({}).isRequired,
  save: PropTypes.func,
  connectUpdateRoom: PropTypes.func.isRequired,
  connectUpdatedRoom: PropTypes.func.isRequired,
  connectSetRoomStartingPoint: PropTypes.func.isRequired,
};

Workspace.defaultProps = {
  save: null,
  temp: false,
};
const mapStateToProps = (state, ownProps) => {
  return {
    room: state.rooms.byId[ownProps.match.params.room_id] || ownProps.room, // with temp workspace we already have the room
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
    connectSetRoomStartingPoint: setRoomStartingPoint,
  }
)(Workspace);
