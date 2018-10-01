import React from 'react';
import classes from './workspace.css';
import Aux from '../../../Components/HOC/Auxil';
import CurrentMembers from '../../../Components/CurrentMembers/CurrentMembers';
const workspaceLayout = ({graph, chat, replayer, members, activeMember}) => {
  return (
    <Aux>

      <div className={classes.Container} style={{maxHeight: window.innerHeight - (replayer ? 400 : 300)}}>
        <div className={classes.Graph}>{graph()}</div>
        <div className={classes.SidePanel}>
          <div className={classes.Chat}>{chat()}</div>
          <div className={classes.Members}>
            <CurrentMembers members={members} activeMember={activeMember}/>
          </div>
        </div>
      </div>
      {replayer ?
        <div className={classes.Replayer}>
          {replayer()}
        </div>
      : null}
    </Aux>
  )
}
export default workspaceLayout;
