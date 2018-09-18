import React from 'react';
import classes from './workspace.css';
import ContentBox from '../../../Components/UI/ContentBox/ContentBox';
import Avatar from '../../../Components/UI/Avatar/Avatar';
import GgbGraph from '../../../Containers/Room/Graph/GgbGraph';
import DesmosGraph from '../../../Containers/Room/Graph/DesmosGraph';
import Chat from '../../../Containers/Room/Chat/Chat';
const workspaceLayout = ({room, user, loading, currentUsers, match, socket, replaying, updateRoom}) => {
  console.log('rendering workspace Layout')
  return (
    <div>
      <div className={classes.Container}>
        <div className={classes.Graph}>
          {room.roomType === 'geogebra' ?
            <GgbGraph room={room} socket={socket} replay={replaying} user={user} updateRoom={updateRoom}/> :
            <DesmosGraph room={room} socket={socket} replay={replaying} user={user} updateRoom={updateRoom}/>
          }
        </div>
        <div className={classes.Chat}>
          <Chat replaying={replaying} messages={room.chat || []} roomId={room._id} socket={socket} user={user} updateRoom={updateRoom}/>
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
export default workspaceLayout;
