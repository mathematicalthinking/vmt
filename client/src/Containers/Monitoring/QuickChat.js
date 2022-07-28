import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { socket, createMongoId } from 'utils';
import { Chat } from 'Containers/Workspace';

const QuickChat = ({ populatedRoom, isSimplified, user }) => {
  const [log, setLog] = React.useState(populatedRoom.chat || []);
  const addToLog = (entry) => {
    setLog([...log, entry]);
  };

  const leaveRoom = () => {
    socket.emit('LEAVE_ROOM-QUICK_CHAT', populatedRoom._id, '#f26247');
  };

  React.useEffect(() => {
    leaveRoom();
    const sendData = {
      _id: createMongoId(),
      userId: user._id,
      roomId: populatedRoom._id,
      username: user.username,
      roomName: populatedRoom.name,
      color: '#f26247',
      message: `QUICK CHAT: ${user.username} joined ${populatedRoom.name}`,
    };
    socket.emit('JOIN', sendData, (data, err) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.log('Error joining room');
        console.log(err); // HOW SHOULD WE HANDLE THIS
        //   this.goBack();
        return;
      }
      const { message } = data;
      addToLog(message);
    });

    return () => leaveRoom();
  }, [populatedRoom._id]);

  return (
    <Chat
      roomId={populatedRoom._id}
      log={log}
      addToLog={addToLog}
      user={user}
      referencing={false}
      isSimplified={isSimplified}
      currentTabId={populatedRoom.tabs[0]._id}
      expanded
      showTitle={false}
      isQuickChat
    />
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
});

export default connect(mapStateToProps)(QuickChat);
