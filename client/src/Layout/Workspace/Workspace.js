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
  room, user, socket,
  resetControlTimer, inControl, toggleControl, 
  replayer, activeMember, temp, 
  save, someoneElseInControl,
  instructions, history, saved, updateRoom, updatedRoom,
  startNewReference, referencing, setReferenceElAndCoords,
  referenceElement, setChatCoords, referenceElementCoords, chatCoords,
  clearReference, showReference, showingReference
}) => {
  let controlText = 'Take Control';
  if (inControl) controlText = 'Release Control';
  else if (someoneElseInControl) controlText = 'Request Control';
  return (
    <div className={classes.PageContainer}>
      <div className={classes.Container}>
        <div className={classes.WorkspaceTabs}>
          <div className={[classes.Tab, classes.Active].join(" ")}><div className={classes.TabBox}>Tab 1</div></div>
          <div className={classes.Tab}><div className={classes.TabBox}><i className="fas fa-plus"></i></div></div>
        </div>
        <div className={classes.Top}>
          <div className={[classes.Graph, classes.Left, "graph"].join(" ")}>
            {replayer ? 
              (room.roomType === 'geogebra' ?
                <GgbReplayer log={replayer.log} index={replayer.index} skipping={replayer.skipping} reset={replayer.reset}/> :
                <DesmosReplayer />
              ):   
              (room.roomType === 'geogebra' ? 
                <GgbGraph 
                  room={room} 
                  socket={socket} 
                  user={user} 
                  updateRoom={updateRoom} 
                  inControl={inControl} 
                  resetControlTimer={resetControlTimer} 
                  referencing={referencing}
                  referenceElement={referenceElement}
                  referenceElementCoords={referenceElementCoords}
                  setReferenceElAndCoords={setReferenceElAndCoords}
                  showingReference={showingReference}
                /> :
                <DesmosGraph  room={room} socket={socket} user={user} inControl={inControl} resetControlTimer={resetControlTimer}/>
              )
            }
          </div>
          <div className={classes.Right}>
            <div className={classes.Chat}>
              {replayer ? 
                <ChatReplayer roomId={room._id} log={replayer.log} index={replayer.index} skipping={replayer.skipping} reset={replayer.reset} setCurrentMembers={replayer.setCurrentMembers} /> : 
                <Chat 
                  roomId={room._id} 
                  messages={room.chat || []} 
                  socket={socket} 
                  user={user} 
                  updatedRoom={updatedRoom} 
                  referencing={referencing}
                  referenceElement={referenceElement} 
                  setReferenceElAndCoords={setReferenceElAndCoords}
                  setChatCoords={setChatCoords} 
                  showingReference={showingReference}
                  // chatCoords={chatCoords}
                  clearReference={clearReference}
                  showReference={showReference}
                />
              }
            </div>
            <div className={classes.Members}>
              <CurrentMembers members={room.currentMembers.map(member => member.user)} activeMember={activeMember}/>
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
        {referenceElementCoords && chatCoords   ? 
        <div className={classes.ReferenceLine}>
          <svg width="auto" height="auto" style={{zIndex: 1}}>
            <line style={{zIndex: 1500}} x1={referenceElementCoords.left} y1={referenceElementCoords.top} x2={chatCoords.left} y2={chatCoords.top} stroke="#001144" strokeWidth="3"/>
          </svg> 
        </div>: null}
      </div>
    </div>
  )
})
export default withRouter(workspaceLayout);
