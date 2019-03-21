import React, { Component } from "react";
import { connect } from "react-redux";
import {
  updateRoom,
  updatedRoom,
  updateRoomTab,
  populateRoom,
  setRoomStartingPoint,
  updateUser,
  addToLog
} from "../../store/actions";
import WorkspaceLayout from "../../Layout/Workspace/Workspace";
import { GgbGraph, DesmosGraph, Chat, Tabs, Tools, RoomInfo } from "./";
import { Modal, Aux, CurrentMembers } from "../../Components";
import NewTabForm from "../Create/NewTabForm";
import socket from "../../utils/sockets";
// import Replayer from ''
class Workspace extends Component {
  state = {
    activeMember: "",
    referencing: false,
    showingReference: false,
    referToEl: null,
    referToCoords: null,
    referFromEl: null,
    referFromCoords: null,
    currentTab: 0,
    role: "participant",
    creatingNewTab: false,
    activityOnOtherTabs: [],
    chatExpanded: true,
    membersExpanded: true,
    instructionsExpanded: true,
    toolsExpanded: true,
    myColor: null
  };

  componentDidMount() {
    let { room, user } = this.props;
    this.props.updateUser({ connected: socket.connected });
    if (!this.props.temp) {
      this.props.populateRoom(room._id, { events: true });
      if (room.members) {
        let myColor = room.members.filter(
          member => member.user._id === user._id
        )[0].color;
        this.setState({ myColor }, () => this.initializeListeners());
      }
    } else {
      this.initializeListeners();
    }
    window.addEventListener("beforeunload", this.componentCleanup);
  }

  componentDidUpdate(prevProps, prevState) {
    // let { user } = this.props;
    // When we first the load room
    // if (prevProps.room.controlledBy === null && this.props.room.controlledBy !==  null && this.) {
    //   console.log('someonelse in controll')
    //   this.setState({someoneElseInControl: true, inControl: false})
    // }

    // if (prevProps.room.controlledBy === this.props.user._id && this.props.room.controlledBy === null) {
    //   console.log('releasing control')
    //   socket.emit('RELEASE_CONTROL', {user: {_id: this.props.user._id, username: this.props.user.username}, roomId: this.props.room._id}, (err, message) => {
    //     this.props.updatedRoom(this.props.room._id, {chat: [...this.props.room.chat, message]})
    //     // this.setState({activeMember: ''})
    //   })
    // }

    if (
      !this.props.user.connected &&
      this.props.room.controlledBy === this.props.user._id
    ) {
      let auto = true;
      this.toggleControl(null, auto);
    }
  }

  componentWillUnmount() {
    this.componentCleanup();
    window.removeEventListener("beforeunload", this.componentCleanup);
    window.removeEventListener("resize", this.updateReference);
  }

  componentCleanup = () => {
    const { updatedRoom, room, user } = this.props;
    if (socket) {
      // @TODO RELEASE CONTROL
      let color = this.state.myColor;
      socket.emit("LEAVE_ROOM", color, (res, err) => {
        if (err) {
          console.log("error leaving room", err);
        }
        updatedRoom(room._id, {
          currentMembers: room.currentMembers.filter(
            member => member._id !== user._id
          )
        });
      });
    }
  };

  initializeListeners() {
    socket.removeAllListeners("USER_JOINED");
    socket.removeAllListeners("CREATED_TAB");
    socket.removeAllListeners("USER_LEFT");
    socket.removeAllListeners("RELEASED_CONTROL");
    socket.removeAllListeners("TOOK_CONTROL");
    // window.addEventListener("resize", this.updateReference);
    const { room, user } = this.props;

    if (room.controlledBy) {
      this.setState({ someoneElseInControl: true, inControl: false });
    }

    const sendData = {
      userId: user._id,
      roomId: room._id,
      username: user.username,
      roomName: room.name,
      color: this.state.myColor
    };
    // const updatedUsers = [...room.currentMembers, {user: {_id: user._id, username: user.username}}]
    if (!this.props.temp) {
      let { role } = room.members.filter(
        member => member.user._id === user._id
      )[0];
      if (role === "facilitator") {
        this.setState({ role: "facilitator" });
      }
      socket.emit("JOIN", sendData, (res, err) => {
        if (err) {
          console.log(err); // HOW SHOULD WE HANDLE THIS
        }
        this.props.updatedRoom(room._id, {
          currentMembers: res.room.currentMembers
        });
        this.props.addToLog(room._id, res.message);
      });
    }

    socket.on("USER_JOINED", data => {
      this.props.updatedRoom(room._id, { currentMembers: data.currentMembers });
      this.props.addToLog(room._id, data.message);
    });

    socket.on("USER_LEFT", data => {
      if (data.releasedControl) {
        this.props.updatedRoom(room._id, { controlledBy: null });
      }
      let updatedChat = [...this.props.room.chat];
      updatedChat.push(data.message);
      this.props.updatedRoom(room._id, { currentMembers: data.currentMembers });
      this.props.addToLog(room._id, data.message);
    });

    socket.on("TOOK_CONTROL", message => {
      this.props.addToLog(this.props.room._id, message);
      this.props.updatedRoom(room._id, { controlledBy: message.user._id });
      this.setState({ awarenessDesc: message.text, awarenessIcon: "USER" });
    });

    socket.on("RELEASED_CONTROL", message => {
      this.props.addToLog(this.props.room._id, message);
      this.props.updatedRoom(room._id, { controlledBy: null });
      this.setState({
        activeMember: "",
        someoneElseInControl: false,
        awarenessDesc: message.text,
        awarenessIcon: "USER"
      });
    });

    socket.on("CREATED_TAB", data => {
      this.props.addToLog(this.props.room._id, data.message);
      delete data.message;
      delete data.creator;
      let tabs = [...this.props.room.tabs];
      tabs.push(data);
      this.props.updatedRoom(this.props.room._id, { tabs });
    });
  }

  createNewTab = () => {
    if (
      this.state.role === "facilitator" ||
      this.props.room.settings.participantsCanCreateTabs
    ) {
      this.setState({ creatingNewTab: true });
    }
  };

  closeModal = () => {
    this.setState({ creatingNewTab: false });
  };

  changeTab = index => {
    let { room, user } = this.props;
    this.clearReference();
    let data = {
      user: { _id: user._id, username: "VMTBot" },
      text: `${user.username} swtiched to ${room.tabs[index].name}`,
      autogenerated: true,
      room: room._id,
      messageType: "SWITCH_TAB",
      color: this.state.myColor,
      timestamp: new Date().getTime()
    };
    socket.emit("SWITCH_TAB", data, (res, err) => {
      if (err) {
        return console.log("something went wrong on the socket:", err);
      }
      // this.props.updatedRoom(this.props.room._id, {
      //   chat: [...this.props.room.chat, res.message]
      // });
      this.props.addToLog(room._id, data);
    });
    let updatedTabs = this.state.activityOnOtherTabs.filter(
      tab => tab !== room.tabs[index]._id
    );
    this.setState({ currentTab: index, activityOnOtherTabs: updatedTabs });
  };

  toggleControl = (event, auto) => {
    let { room, user } = this.props;

    if (!user.connected && !auto) {
      // i.e. if the user clicked the button manually instead of controll being toggled programatically
      return alert(
        "You have disconnected from the server. Check your internet connection and try refreshing the page"
      );
    }

    if (room.controlledBy === user._id) {
      // Releasing control
      let message = {
        user: { _id: user._id, username: "VMTBot" },
        room: room._id,
        text: `${user.username} released control`,
        autogenerated: true,
        messageType: "RELEASED_CONTROL",
        color: this.state.myColor,
        timestamp: new Date().getTime()
      };
      this.props.updatedRoom(room._id, { controlledBy: null });
      this.props.addToLog(room._id, message);
      this.setState({ awarenessDesc: message.text, awarenessIcon: null });
      socket.emit("RELEASE_CONTROL", message, (err, res) => {
        if (err) console.log(err);
      });
      clearTimeout(this.controlTimer);
    }

    // If room is controlled by someone else
    else if (room.controlledBy) {
      let message = {
        text: "Can I take control?",
        user: { _id: user._id, username: user.username },
        room: room._id,
        color: this.state.myColor,
        timestamp: new Date().getTime()
      };
      socket.emit("SEND_MESSAGE", message, (err, res) => {
        this.props.addToLog(room._id, message);
      });
    } else {
      // We're taking control
      this.props.updatedRoom(room._id, { controlledBy: user._id });
      this.resetControlTimer();
      let message = {
        user: { _id: user._id, username: "VMTBot" },
        room: room._id,
        text: `${user.username} took control`,
        messageType: "TOOK_CONTROL",
        autogenerated: true,
        color: this.state.myColor,
        timestamp: new Date().getTime()
      };
      this.props.addToLog(room._id, message);
      socket.emit("TAKE_CONTROL", message, (err, message) => {
        // this.scrollToBottom(); @TODO
        // this.setState(
        //   { awarenessDesc: message.text, awarenessIcon: null },
        //   () => {
        //     console.log(this.state.awarenessDesc);
        //   }
        // );
        // IF ERROR WE NEED TO UNDO CONTROL
      });
    }
    if (!user.connected) {
      // Let all of the state updates finish and then show an alert
      setTimeout(
        () =>
          alert(
            "You have disconnected from the server. Check your internet connection and try refreshing the page"
          ),
        0
      );
    }
  };

  emitNewTab = tabInfo => {
    console.log("emitting new trab");
    socket.emit("NEW_TAB", tabInfo, (err, res) => {
      this.props.addToLog(this.props.room._id, tabInfo.message);
    });
  };

  resetControlTimer = () => {
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
      referToCoords: null
    });
  };

  showReference = (
    referToEl,
    referToCoords,
    referFromEl,
    referFromCoords,
    tab
  ) => {
    if (tab !== this.state.currentTab) {
      alert("This reference does not belong to this tab"); //@TODO HOW SHOULD WE HANDLE THIS?
    } else {
      this.setState({
        referToEl,
        referFromEl,
        referToCoords,
        referFromCoords,
        showingReference: true
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
      showingReference: false
    });
  };

  // this shouLD BE refereNT
  setToElAndCoords = (el, coords) => {
    if (el) {
      this.setState({
        referToEl: el
      });
    }
    if (coords) {
      this.setState({
        referToCoords: coords
      });
    }
  };

  // THIS SHOULD BE REFERENCE (NOT CHAT,,,CHAT CAN BE referENT TOO)
  //WE SHOULD ALSO SAVE ELEMENT ID SO WE CAN CALL ITS REF EASILY
  setFromElAndCoords = (el, coords) => {
    if (el) {
      this.setState({
        referFromEl: el
      });
    }
    if (coords) {
      this.setState({
        referFromCoords: coords
      });
    }
  };

  addNtfToTabs = id => {
    console.log("adding ntf");
    this.setState({
      activityOnOtherTabs: [...this.state.activityOnOtherTabs, id]
    });
  };

  clearTabNtf = id => {
    this.setState({
      activityOnOtherTabs: this.state.activityOnOtherTabs.filter(
        tab => tab !== id
      )
    });
  };

  setStartingPoint = () => {
    this.props.setRoomStartingPoint(this.props.room._id);
  };

  toggleExpansion = element => {
    this.setState(prevState => ({
      [`${element}Expanded`]: !prevState[`${element}Expanded`]
    }));
  };

  goBack = () => {
    this.props.history.goBack();
  };

  render() {
    const { room, user } = this.props;
    let control = "OTHER";
    if (room.controlledBy === user._id) control = "ME";
    else if (!room.controlledBy) control = "NONE";
    let Graph;
    let currentMembers = (
      <CurrentMembers
        members={room.members}
        currentMembers={room.currentMembers}
        activeMember={room.controlledBy}
        expanded={this.state.membersExpanded}
        toggleExpansion={this.toggleExpansion}
      />
    );
    let tabs;
    if (room.tabs[0].name) {
      // This che
      tabs = (
        <Tabs
          participantCanCreate={room.settings.participantsCanCreateTabs}
          tabs={room.tabs}
          ntfTabs={this.state.activityOnOtherTabs}
          currentTab={this.state.currentTab}
          role={this.state.role}
          changeTab={this.changeTab}
          createNewTab={this.createNewTab}
        />
      );
    }
    // {role === 'facilitator' ? <div className={[classes.Tab, classes.NewTab].join(' ')}><div onClick={createNewTab}    className={classes.TabBox}><i className="fas fa-plus"></i></div></div> : null}
    let chat = (
      <Chat
        roomId={room._id}
        messages={room.chat || []}
        log={room.log}
        addToLog={this.props.addToLog}
        // socket={socket}
        myColor={this.state.myColor}
        user={user}
        // updatedRoom={this.props.updatedRoom}
        referencing={this.state.referencing}
        referToEl={this.state.referToEl}
        referToCoords={this.state.referToCoords}
        referFromEl={this.state.referFromEl}
        referFromCoords={this.state.referFromCoords}
        setToElAndCoords={this.setToElAndCoords}
        setFromElAndCoords={this.setFromElAndCoords}
        showingReference={this.state.showingReference}
        clearReference={this.clearReference}
        showReference={this.showReference}
        currentTab={this.state.currentTab}
        expanded={this.state.chatExpanded}
        toggleExpansion={this.toggleExpansion}
      />
    );

    if (room.tabs[this.state.currentTab].tabType === "desmos") {
      Graph = (
        <DesmosGraph
          room={room}
          user={user}
          resetControlTimer={this.resetControlTimer}
          currentTab={this.state.currentTab}
          updatedRoom={this.props.updatedRoom}
          updateRoomTab={this.props.updateRoomTab}
          addNtfToTabs={this.addNtfToTabs}
        />
      );
    } else {
      Graph = (
        <GgbGraph
          room={room}
          user={user}
          myColor={this.state.myColor}
          role={this.state.role}
          addToLog={this.props.addToLog}
          updateRoom={this.props.updateRoom}
          updateRoomTab={this.props.updateRoomTab}
          updatedRoom={this.props.updatedRoom}
          resetControlTimer={this.resetControlTimer}
          currentTab={this.state.currentTab}
          addNtfToTabs={this.addNtfToTabs}
          updateAwarenessDesc={(awarenessDesc, awarenessIcon) => {
            this.setState({ awarenessDesc, awarenessIcon });
          }}
        />
      );
    }

    return (
      <Aux>
        {room.tabs[0].name ? (
          <WorkspaceLayout
            graph={Graph}
            roomName={room.name}
            user={user}
            chat={chat}
            tabs={tabs}
            bottomRight={
              <Tools
                inControl={control}
                goBack={this.goBack}
                toggleControl={this.toggleControl}
                lastEvent={room.log[room.log.length - 1]}
                save={this.props.save ? this.props.save : null}
              />
            }
            bottomLeft={
              <RoomInfo
                temp={this.props.temp}
                role={this.state.role}
                updateRoom={this.props.updateRoom}
                room={room}
                currentTab={this.state.currentTab}
              />
            }
            currentMembers={currentMembers}
            chatExpanded={this.state.chatExpanded}
            membersExpanded={this.state.membersExpanded}
            instructionsExpanded={this.state.instructionsExpanded}
            toolsExpanded={this.state.toolsExpanded}
            referToCoords={this.state.referToCoords}
            referFromCoords={this.state.referFromCoords}
          />
        ) : null}
        <Modal show={this.state.creatingNewTab} closeModal={this.closeModal}>
          <NewTabForm
            room={room}
            user={user}
            closeModal={this.closeModal}
            updatedRoom={this.props.updatedRoom}
            sendEvent={this.emitNewTab}
          />
        </Modal>
      </Aux>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    room: state.rooms.byId[ownProps.match.params.room_id] || ownProps.room, // with temp workspace we already have the room
    user: state.user._id ? state.user : ownProps.user, // with tempWorkspace we won't have a user in the store
    loading: state.loading.loading
  };
};

export default connect(
  mapStateToProps,
  {
    updateUser,
    updateRoom,
    updatedRoom,
    updateRoomTab,
    populateRoom,
    setRoomStartingPoint,
    addToLog
  }
)(Workspace);
