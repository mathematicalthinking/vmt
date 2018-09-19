import React from 'react';
import classes from './workspace.css';
import Aux from '../../../Components/HOC/Auxil';
const workspaceLayout = ({graph, chat, replayer}) => {
  console.log('re-rendering workspace layout')
  return (
    <Aux>
      <div className={classes.Container}>
        <div className={classes.Graph}>{graph()}</div>
        <div className={classes.Chat}>{chat()}</div>
      </div>
      <div>
        {/* <ContentBox align='left'>
          <div className={classes.Container}>{currentUsers ? currentUsers.map(user =>
            <div className={classes.Avatar} key={user.username}><Avatar username={user.username} />
            </div>) : null}
          </div>
        </ContentBox> */}
        {replayer ? replayer() : null}
      </div>
    </Aux>
  )
}
export default workspaceLayout;
