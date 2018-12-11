import React from 'react';
import classes from './workspace.css';
import { withRouter } from 'react-router-dom';
import { CurrentMembers, Button, ReplayerControls }from '../../Components';
import GgbGraph from '../../Containers/Workspace/GgbGraph';
import DesmosGraph from '../../Containers/Workspace/DesmosGraph';
import GgbReplayer from '../../Containers/Replayer/GgbReplayer';
import DesmosReplayer from '../../Containers/Replayer/DesmosReplayer';
import ChatReplayer from '../../Containers/Replayer/ChatReplayer';
import Chat from '../../Containers/Workspace/Chat';

const workspaceLayout = React.memo(({
  room, user, socket, currentTab, role,
  resetControlTimer, inControl, toggleControl, 
  replayer, activeMember, temp, 
  save, someoneElseInControl,
  instructions, history, saved, updateRoom, updatedRoom,
  startNewReference, showReference, 
  referencing, showingReference,setToElAndCoords,
  setFromElAndCoords, referToEl, referToCoords, referFromEl, 
  referFromCoords, clearReference, createNewTab, changeTab,
  addNtfToTabs, ntfTabs,
}) => {
  let controlText = 'Take Control';
  if (inControl) controlText = 'Release Control';
  else if (someoneElseInControl) controlText = 'Request Control';
  let tabs = []
  if (room.tabs[0].name) { // This checkes if tabs have been populated yet...if they haven't they won't have a name field
    tabs = room.tabs.map((tab, i) => {
      return (
      <div onClick={() => changeTab(i)} className={[classes.Tab, currentTab === i ? classes.Active : ''].join(" ")} style={{zIndex: room.tabs.length - i}} >
        <div style={{zIndex: room.tabs.length - i}} className={classes.TabBox}>{tab.name}</div>
       {ntfTabs && ntfTabs.includes(tab._id) ? <div className={classes.TabNotification}><i className="fas fa-exclamation"></i></div> : null}
      </div>
      )
    })
  }

  return (
    <div className={classes.PageContainer}>
      <div className={classes.Container}>
        <div className={classes.WorkspaceTabs}>
          {tabs}
          {role === 'facilitator' ? <div className={[classes.Tab, classes.NewTab].join(' ')}><div onClick={createNewTab}  className={classes.TabBox}><i className="fas fa-plus"></i></div></div> : null}
        </div>
        <div className={classes.Top}>
          <div className={[classes.Graph, classes.Left, "graph"].join(" ")}>
            {replayer ? 
              (room.tabs[currentTab].tabType === 'geogebra' ?
                <GgbReplayer 
                  log={replayer.log} 
                  index={replayer.index} 
                  changingIndex={replayer.changingIndex} 
                  reset={replayer.reset} 
                  changeTab={changeTab} 
                  currentTab={currentTab}
                /> :
                <DesmosReplayer />
              ):   
              (room.tabs[currentTab].tabType === 'geogebra' ? 
                <GgbGraph 
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
                /> :
                <DesmosGraph  room={room} socket={socket} user={user} inControl={inControl} resetControlTimer={resetControlTimer} currentTab={currentTab}/>
              )
            }
          </div>
          <div className={classes.Right}>
            <div className={classes.Chat}>
              {replayer ? 
                <ChatReplayer 
                  roomId={room._id} 
                  log={replayer.log} 
                  index={replayer.index} 
                  changingIndex={replayer.changingIndex} 
                  reset={replayer.reset} 
                  setCurrentMembers={replayer.setCurrentMembers} /> : 
                <Chat 
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
            </div>
            <div className={classes.Members}>
              <CurrentMembers members={replayer ? replayer.currentMembers.map(member => member.user) : room.currentMembers.map(member => member.user)} activeMember={activeMember}/>
            </div>
          </div>
        </div>
        <div className={classes.Bottom}>
          <div className={classes.Left}>
          {replayer ? 
            <ReplayerControls {...replayer} /> : 
            <div className={classes.RoomDescription}>
              <h3 className={classes.InstructionsTitle}>Instructions</h3>
              <div className={classes.Instructions}>{temp ? `Share this url to invite others: ${window.location}` : instructions}</div>
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
