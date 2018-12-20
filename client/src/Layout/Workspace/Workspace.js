import React from 'react';
import classes from './workspace.css';
import { withRouter } from 'react-router-dom';
import { CurrentMembers, Button, ReplayerControls, EditableText }from '../../Components';
import {
  GgbGraph,
  GgbActivityGraph,
  GgbReplayer,
  DesmosGraph,
  DesmosActivityGraph,
  DesmosReplayer,
  Chat,
  ChatReplayer,
} from '../../Containers';

const workspaceLayout = React.memo(({
  room, user, socket, currentTab, role,
  resetControlTimer, inControl, toggleControl,
  replayer, activeMember, temp,
  save, someoneElseInControl, history,
  saved, updateRoom, updatedRoom,
  startNewReference, showReference,
  referencing, showingReference,setToElAndCoords,
  setFromElAndCoords, referToEl, referToCoords, referFromEl,
  referFromCoords, clearReference, createNewTab, changeTab,
  addNtfToTabs, ntfTabs, setStartingPoint, activityWorkspace,
  updatedActivity, copyActivity, updateActivityTab,
}) => {

  // Set text for taking control button based on current control
  let controlText = 'Take Control';
  if (inControl) controlText = 'Release Control';
  else if (someoneElseInControl) controlText = 'Request Control';


  // Setup tabs
  let tabs = []
  if (room.tabs[0].name) { // This checkes if tabs have been populated yet...if they haven't they won't have a name field
    tabs = room.tabs.map((tab, i) => {
      return (
      <div key={tab._id} onClick={() => changeTab(i)} className={[classes.Tab, currentTab === i ? classes.Active : ''].join(" ")} style={{zIndex: room.tabs.length - i}} >
        <div style={{zIndex: room.tabs.length - i}} className={classes.TabBox}><span className={classes.TabName}>{tab.name}</span></div>
        {ntfTabs && ntfTabs.includes(tab._id) ? <div className={classes.TabNotification}><i className="fas fa-exclamation"></i></div> : null}
      </div>
      )
    })
  }

  // Pick the proper graph based on replayer, tabType, activityWorkspace props
  //  COULD WE JUST SAVE THSE COMPONENTS ON ATTRS OF THE WORKSPACELAYOUT COMPONENT IN WORKSPACER AND ACTIVITYWORKSPACE AND REPLAYER WORKSPACE ETC
  // THEN WE COULD AVOID ALL OF THESE CONDITIONALS ???
  let graph;
  if (replayer) {
    if (room.tabs[currentTab].tabType === 'desmos') {
      graph = <DesmosReplayer />
    } else {
      graph = <GgbReplayer
      log={replayer.log}
      index={replayer.index}
      changingIndex={replayer.changingIndex}
      playing={replayer.playing}
      reset={replayer.reset}
      changeTab={changeTab}
      tabs={room.tabs}
      currentTab={currentTab}
    />
    }
  } else if (activityWorkspace) {
    if (room.tabs[currentTab].tabType === 'desmos') {
      graph = <DesmosActivityGraph />
    } else {
      graph = <GgbActivityGraph
        activity={room}
        tabs={room.tabs}
        currentTab={currentTab}
        role={role}
        updatedActivity={updatedActivity}
        updateActivityTab={updateActivityTab}

      />
    }
  } else if (room.tabs[currentTab].tabType === 'desmos') {
    graph = <DesmosGraph  room={room} socket={socket} user={user} inControl={inControl} resetControlTimer={resetControlTimer} currentTab={currentTab}/>
  } else {
    if (room.tabs[currentTab].tabType === 'desmos') {
      graph = <DesmosGraph  room={room} socket={socket} user={user} inControl={inControl} resetControlTimer={resetControlTimer} currentTab={currentTab}/>
    } else {
      graph = <GgbGraph
        room={room}
        socket={socket}
        user={user}
        updateRoom={updateRoom}
        updatedRoom={updatedRoom}
        inControl={inControl}
        resetControlTimer={resetControlTimer}
        referencing={referencing}
        referToEl={referToEl}
        referToCoords={referToCoords}
        setToElAndCoords={setToElAndCoords}
        showingReference={showingReference}
        currentTab={currentTab}
        addNtfToTabs={addNtfToTabs}
      />
    }
  }

  let chat;
  if (replayer) {
    chat = <ChatReplayer
      roomId={room._id}
      log={replayer.log}
      index={replayer.index}
      changingIndex={replayer.changingIndex}
      reset={replayer.reset}
      setCurrentMembers={replayer.setCurrentMembers}
    />
  } else if (!activityWorkspace) {
    chat = <Chat
      roomId={room._id}
      messages={room.chat || []}
      socket={socket}
      user={user}
      updatedRoom={updatedRoom}
      referencing={referencing}
      referToEl={referToEl}
      referToCoords={referToCoords}
      referFromEl={referFromEl}
      referFromCoords={referFromCoords}
      setToElAndCoords={setToElAndCoords}
      setFromElAndCoords={setFromElAndCoords}
      showingReference={showingReference}
      clearReference={clearReference}
      showReference={showReference}
      currentTab={currentTab}
    />
  }
  console.log(role)

  let bottomButton;
  if (role === 'facilitator' && !activityWorkspace) {
      bottomButton = <div><Button click={setStartingPoint}>Set starting point</Button></div>
  } else if (role === 'participant' && activityWorkspace) {
    bottomButton = <div><Button click={copyActivity}>Add To My Activities</Button></div>
  }

  return (
    <div className={classes.PageContainer}>
      <div className={classes.Container}>
        <div className={classes.WorkspaceTabs}>
          {tabs}
          {role === 'facilitator' ? <div className={[classes.Tab, classes.NewTab].join(' ')}><div onClick={createNewTab}  className={classes.TabBox}><i className="fas fa-plus"></i></div></div> : null}
        </div>
        <div className={classes.Top}>
          <div className={[classes.Graph, classes.Left, "graph"].join(" ")}>{graph}</div>
          <div className={classes.Right}>
            <div className={classes.Chat}>{chat}</div>
            <div className={classes.Members}>
             {room.members ? <CurrentMembers members={replayer ? replayer.currentMembers.map(member => member.user) : room.currentMembers.map(member => member.user)} activeMember={activeMember}/> : null}
            </div>
          </div>
        </div>
        <div className={classes.Bottom}>
          <div className={classes.Left}>
          {replayer
            ? <ReplayerControls {...replayer} />
            : <div className={classes.RoomDescription}>
                <h3 className={classes.InstructionsTitle}>
                  <EditableText owner={role === 'facilitator'} inputType={'INPUT'} resource='tab' parentResource={updatedActivity ? 'activity' : 'room'} id={room.tabs[currentTab]._id}  parentId={room._id} field='name'>
                    {room.tabs[currentTab].name}
                  </EditableText> Instructions
                </h3>
                <div>
                  <EditableText owner={role === 'facilitator'} inputType={'TEXT_AREA'} resource='tab' parentResource={updatedActivity ? 'activity' : 'room'} id={room.tabs[currentTab]._id} parentId={room._id} field='instructions'>
                    {room.tabs[currentTab].instructions || room.instructions}
                  </EditableText>
                </div>
                {bottomButton}
              </div>
          }
          {temp && !saved ?
            <div>
              <Button theme={'Small'} data-testid='save-temp' style={{zIndex: 1000}} m={20} click={save}>Save This Workspace</Button>
            </div> : null
          }
          </div>
          <div className={classes.Right}>
            <div className={classes.ReferenceWindow}>
              {!replayer ?
                <div className={classes.ReferenceControls} onClick={referencing ? clearReference : startNewReference}>
                  <i className={["fas", "fa-mouse-pointer", classes.MousePointer, referencing ? classes.ReferencingActive : ''].join(" ")}></i>
                  <div className={classes.ReferenceTool}>Reference</div>
                  {/* <div className={classes.RefrenceTool}>Perspective</div> */}
                </div> : null
              }
              <div className={classes.LiveLog}>

              </div>
            </div>
            <div className={classes.Controls}>
              {!replayer ?
                <div className={classes.SideButton} onClick={toggleControl}>{controlText}</div> :
                <div className={classes.SideButton}>Make A Comment</div>
              }
              <div className={[classes.SideButton, classes.Exit].join(" ")} onClick={() => {temp ? history.push('/') : history.goBack()}} theme={'Small'} data-testid='exit-room'>Exit Room</div>
            </div>
          </div>
        </div>
        {referToCoords && referFromCoords   ?
        <div className={classes.ReferenceLine}>
          <svg height='100%' width='100%' style={{zIndex: 1}}>
            <line style={{zIndex: 1500}} x1={referToCoords.left} y1={referToCoords.top} x2={referFromCoords.left} y2={referFromCoords.top} stroke="#2D91F2" strokeWidth="3"/>
          </svg>
        </div>: null}
      </div>
    </div>
  )
})
export default withRouter(workspaceLayout);
