import React from 'react';
import classes from './workspace.css';
import Aux from '../../../Components/HOC/Auxil';
import CurrentMembers from '../../../Components/CurrentMembers/CurrentMembers';
const workspaceLayout = ({graph, chat, replayer, members}) => {
  console.log(members)
  return (
    <Aux>
      <div className={classes.Container} style={{maxHeight: window.innerHeight - 400}}>
        <div className={classes.Graph}>{graph()}</div>
        <div className={classes.SidePanel}>
          <div className={classes.Chat}>{chat()}</div>
          <div className={classes.Members}>
            <CurrentMembers members={members} />
          </div>
        </div>
      </div>
      <div>
        {replayer ? replayer() : null}
      </div>
    </Aux>
  )
}
export default workspaceLayout;
