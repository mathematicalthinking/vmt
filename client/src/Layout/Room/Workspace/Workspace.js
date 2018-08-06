import React from 'react';
import classes from './workspace.css';
import ContentBox from '../../../Components/UI/ContentBox/ContentBox';
import Avatar from '../../../Components/UI/Avatar/Avatar';
const workspace = props => {
  const currentUsers = props.userList.map(user => (
    <div className={classes.Avatar}><Avatar username={user.username} /></div>)
  )
  return (
    <div>
      <div className={classes.Container}>
        <div className={classes.Graph}>{props.graph}</div>
        <div className={classes.Chat}>{props.chat}</div>
      </div>
      <div className={classes.CurrentUsers}>
        <ContentBox align='left'>
          <div className={classes.Container}>{currentUsers}</div>
        </ContentBox>
      </div>
    </div>
  )
}
export default workspace;
