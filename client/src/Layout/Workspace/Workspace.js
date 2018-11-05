import React from 'react';
import classes from './workspace.css';
import { withRouter } from 'react-router-dom';
// import Aux from '../../../Components/HOC/Auxil';
import CurrentMembers from '../../Components/CurrentMembers/CurrentMembers';
import Button from '../../Components/UI/Button/Button';
const workspaceLayout = ({
  graph, chat, replayer, 
  members, activeMember, temp, 
  save, loggedIn, description, history}) => {
  return (
    <div className={classes.PageContainer}>
      <div className={classes.Container} style={{maxHeight: window.innerHeight - (replayer ? 400 : 300)}}>
        <div className={classes.Graph}>{graph()}</div>
        <div className={classes.SidePanel}>
          <div className={classes.Chat}>{chat()}</div>
          <div className={classes.Members}>
            <CurrentMembers members={members.map(member => member.user)} activeMember={activeMember}/>
          </div>
          <Button click={() => history.goBack()} theme={'Small'} m={20} data-testid='exit-room'>Exit Room</Button>
        </div>
      </div>
      {temp && !loggedIn ? 
        <div>
          <Button theme={'Small'} data-testid='save-temp' m={20} click={save}>Save This Workspace</Button>
        </div> :
        <div className={classes.BottomBar}>
          <div className={classes.RoomDescription}>Assignment Description: {description}</div>
        </div>
      }
      {replayer ?
        <div className={classes.Replayer}>
          {replayer()}
        </div>
      : null}
    </div>
  )
}
export default withRouter(workspaceLayout);
