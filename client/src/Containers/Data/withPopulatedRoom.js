import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { socket } from 'utils';
import { connect } from 'react-redux';
import { Room } from 'Model';
import API from '../../utils/apiRequests';
import buildLog from '../../utils/buildLog';
import Loading from '../../Components/Loading/Loading';

function withPopulatedRoom(WrappedComponent) {
  class PopulatedRoom extends Component {
    state = {
      loading: true,
      populatedRoom: {},
    };

    componentDidMount() {
      this.syncSocket();
      this.cancelFetch = false;
      const { match } = this.props;
      this.fetchRoom(match.params.room_id);
      this.initializeListeners();
      this.setState((prevState) => ({
        populatedRoom: {
          ...prevState.populatedRoom,
          getCurrentMembers: this.getCurrentMembers.bind(this),
          adjustUser: this.adjustUser.bind(this),
        },
      }));
    }

    componentWillUnmount() {
      this.cancelFetch = true;
      socket.removeAllListeners('RESET_COMPLETE');
    }

    syncSocket = () => {
      const { user: currentUser } = this.props;
      socket.emit('SYNC_SOCKET', currentUser._id, (res, err) => {
        if (err) console.error(err);
        else console.log(res);
      });
    };

    syncRooms = async (user) => {
      this.cancelFetch = false;
      const { populatedRoom: oldRoom } = this.state;
      this.syncSocket();
      socket.emit('RESET_ROOM', oldRoom._id, user);
    };

    initializeListeners = () => {
      socket.on('RESET_COMPLETE', () => {
        const { populatedRoom } = this.state;
        this.fetchRoom(populatedRoom._id);
      });

      socket.on('SETTINGS_CHANGED', (data) => {
        const { roomId } = data;
        const { populatedRoom } = this.state;
        if (roomId === populatedRoom._id) this.fetchRoom(populatedRoom._id);
      });
    };

    fetchRoom = (roomId) => {
      API.getPopulatedById('rooms', roomId, false, true)
        .then((res) => {
          const populatedRoom = res.data.result;
          populatedRoom.log = buildLog(populatedRoom.tabs, populatedRoom.chat);

          // @TODO: do we need to make sure current User has an alias?
          const newLog = this.adjustLogUsers(populatedRoom);
          populatedRoom.log = newLog;

          if (!this.cancelFetch) {
            this.setState((prevState) => ({
              loading: false,
              populatedRoom: { ...prevState.populatedRoom, ...populatedRoom },
            }));
          }
        })
        .catch((err) => {
          console.error(err);
          console.log(
            'we should probably just go back to the previous page? maybe display the error'
          );
          const { history } = this.props;
          window.alert('There was an error loading the room');
          history.goBack();
        });
    };

    adjustUser = (user) => {
      // replaces username with either the alias or stored username depending on the room settings.

      const { populatedRoom } = this.state;
      if (Object.keys(populatedRoom).length === 0) return user;
      const { members } = populatedRoom;
      const shouldAliasUsername = Room.getRoomSetting(
        populatedRoom,
        Room.ALIASED_USERNAMES
      );
      const memberIndex = members.findIndex((mem) => mem.user._id === user._id);
      const userToReturn = { ...user };
      // let usernameToReturn = user.username;

      if (memberIndex < 0) return user;

      userToReturn.username = shouldAliasUsername
        ? members[memberIndex].alias || 'ALIAS_ERROR'
        : userToReturn.username;
      return userToReturn;
    };

    // used to get aliased or un-aliased members
    // use getCurrentMembers in lieu of populatedRoom.currentMembers
    // every time we get currentMembers in Workspace's, use this function
    getCurrentMembers = (updatedCurrentMembers = []) => {
      const { populatedRoom } = this.state;
      if (Object.keys(populatedRoom).length === 0) return updatedCurrentMembers;
      const { members } = populatedRoom;
      const shouldAliasUsernames = Room.getRoomSetting(
        populatedRoom,
        Room.ALIASED_USERNAMES
      );

      const currentMembers = updatedCurrentMembers.length
        ? updatedCurrentMembers
        : populatedRoom.currentMembers;

      // if there's an alias put it in, else use the username
      return currentMembers.map((currentMember) => {
        const memberIndex = members.findIndex(
          (el) => el.user._id === currentMember._id
        );

        if (memberIndex < 0) return currentMember;

        if (shouldAliasUsernames) {
          currentMember.username =
            members[memberIndex].alias || currentMember.username;
        } else {
          currentMember.username = members[memberIndex].user.username;
        }
        return currentMember;
      });
    };

    // allow for the case where member is not there
    //
    // eslint-disable-next-line class-methods-use-this
    adjustLogUsers(room) {
      const { log, members } = room;
      if (!log.length) return log;
      const shouldAliasUsername = Room.getRoomSetting(
        room,
        Room.ALIASED_USERNAMES
      );

      // if there's an alias put it in, else use the username
      if (shouldAliasUsername) {
        return log.map((currentLog) => {
          // previously, NEW_TAB messages neglected to include a user field.
          if (!currentLog.user) return currentLog;
          const member = members.find(
            (el) => el.user._id === currentLog.user._id
          );
          if (!member) return currentLog;
          if (member.alias && member.alias.length > 0)
            currentLog.user.username = member.alias;
          else currentLog.user.username = member.user.username;
          return currentLog;
        });
      }
      return log;
    }

    render() {
      const { history, user } = this.props;
      const { loading, populatedRoom } = this.state;
      if (loading) {
        return <Loading message="Fetching your room..." />;
      }

      return (
        <WrappedComponent
          populatedRoom={populatedRoom}
          history={history}
          resetRoom={this.syncRooms}
          user={this.adjustUser(user)}
        />
      );
    }
  }

  PopulatedRoom.propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({ room_id: PropTypes.string }),
    }).isRequired,
    history: PropTypes.shape({ goBack: PropTypes.func }).isRequired,
    user: PropTypes.shape({ _id: PropTypes.string }).isRequired,
  };

  const mapStateToProps = (state) => {
    return {
      user: state.user,
    };
  };
  return connect(mapStateToProps)(PopulatedRoom);
}

export default withPopulatedRoom;
