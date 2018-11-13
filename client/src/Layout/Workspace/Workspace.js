import React from 'react';
import classes from './workspace.css';
import { withRouter } from 'react-router-dom';
// import Aux from '../../../Components/HOC/Auxil';
import CurrentMembers from '../../Components/CurrentMembers/CurrentMembers';
import Button from '../../Components/UI/Button/Button';
const workspaceLayout = ({
  graph, chat, replayer, 
  members, activeMember, temp, 
  save, loggedIn, description, instructions, history}) => {
  return (
    <div className={classes.PageContainer}>
      <div className={classes.Container}>
        <div className={classes.WorkspaceTabs}>
          <div className={[classes.Tab, classes.Active].join(" ")}><div className={classes.TabBox}>Tab 1</div></div>
          <div className={classes.Tab}><div className={classes.TabBox}><i className="fas fa-plus"></i></div></div>
        </div>
        <div className={classes.Top}>
          <div className={[classes.Graph, classes.Left, "graph"].join(" ")}>{graph()}</div>
          <div className={classes.Right}>
            <div className={classes.Chat}>{chat()}</div>
            <div className={classes.Members}>
              <CurrentMembers members={members.map(member => member.user)} activeMember={activeMember}/>
            </div>
          </div>
        </div>
        <div className={classes.Bottom}>
          <div className={classes.Left}>
          {replayer ? replayer() : 
            <div className={classes.RoomDescription}>
              <h3 className={classes.InstructionsTitle}>Instructions</h3>
              <div className={classes.Instructions}>{instructions}</div>
            </div>
          }
          {temp && !loggedIn ? 
            <div>
              <Button theme={'Small'} data-testid='save-temp' style={{zIndex: 1000}} m={20} click={save}>Save This Workspace</Button>
            </div> : null 
          }
          </div>
          <div className={classes.Right}>
            {!replayer ? <div className={classes.SideButton}>Take Control</div> : <div className={classes.SideButton}>Make A Comment</div>}
            <div className={[classes.SideButton, classes.Exit].join(" ")} onClick={() => history.goBack()} theme={'Small'} m={20} data-testid='exit-room'>Exit Room</div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default withRouter(workspaceLayout);
