import React from 'react';
import classes from './workspace.css';
import ContentBox from '../../../Components/UI/ContentBox/ContentBox';
import Avatar from '../../../Components/UI/Avatar/Avatar';
const workspace = props => {
  console.log('workspace layout props: ', props)
  const currentUsers = props.userList.map(user => (
    <div key={user.username} className={classes.Avatar}><Avatar username={user.username} /></div>)
  )
  return (
    <div>
      <Modal show={loading} message='loading...' />
      <div className={classes.Container}>
        <div className={classes.Graph}>
          {room.roomType === 'geogebra' ?
            <GgbGraph room={room} socket={this.socket} replay={false} userId={user.id} /> :
            <DesmosGraph room={room} socket={this.socket} replay={false} userId={user.id} />
          }
        </div>
        <div className={classes.Chat}>
          <Chat messages={room.chat || []} roomId={room._id} socket={this.socket} user={user} />
        </div>
      </div>
      <div className={classes.CurrentUsers}>
        <ContentBox align='left'>
          <div className={classes.Container}>{currentUsers ? currentUsers.map(user =>
            <div className={classes.Avatar} key={user.username}><Avatar username={user.username} />
            </div>) : null}
          </div>
        </ContentBox>
      </div>
    </div>
  )
}
export default workspace;
