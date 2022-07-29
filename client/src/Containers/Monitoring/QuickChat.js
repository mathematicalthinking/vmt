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
    console.log('leaving room', populatedRoom._id);
    socket.emit('LEAVE_ROOM_QUICKCHAT', populatedRoom._id, '#f26247');
  };

  React.useEffect(() => {
    const sendData = {
      _id: createMongoId(),
      userId: user._id,
      roomId: populatedRoom._id,
      username: user.username,
      roomName: populatedRoom.name,
      color: '#f26247',
    };
    socket.emit('JOIN_QUICKCHAT', sendData, (data, err) => {
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
    <div style={{ height: '80%' }}>
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
      />
    </div>
  );
};

QuickChat.propTypes = {
  populatedRoom: PropTypes.shape({
    _id: PropTypes.string,
    chat: PropTypes.arrayOf(PropTypes.shape({})),
    tabs: PropTypes.arrayOf(PropTypes.shape({ _id: PropTypes.string })),
    name: PropTypes.string,
  }).isRequired,
  isSimplified: PropTypes.bool.isRequired,
  user: PropTypes.shape({ _id: PropTypes.string, username: PropTypes.string })
    .isRequired,
};

const mapStateToProps = (state) => ({
  user: state.user,
});

export default connect(mapStateToProps)(QuickChat);
