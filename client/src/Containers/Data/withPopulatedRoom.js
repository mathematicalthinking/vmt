import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { socket } from 'utils';
import { hri } from 'human-readable-ids';
import { connect } from 'react-redux';
import { updateRoom } from 'store/actions';
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

    syncRooms = async (user) => {
      this.cancelFetch = false;
      const { populatedRoom: oldRoom } = this.state;
      socket.emit('RESET_ROOM', oldRoom._id, user);
    };

    initializeListeners() {
      socket.removeAllListeners('RESET_COMPLETE');

      socket.on('RESET_COMPLETE', () => {
        const { populatedRoom } = this.state;
        this.fetchRoom(populatedRoom._id);
      });
    }

    fetchRoom(roomId) {
      API.getPopulatedById('rooms', roomId, false, true)
        .then((res) => {
          const populatedRoom = res.data.result;
          populatedRoom.log = buildLog(populatedRoom.tabs, populatedRoom.chat);
          if (!this.cancelFetch)
            this.setState((prevState) => ({
              loading: false,
              populatedRoom: { ...prevState.populatedRoom, ...populatedRoom },
            }));
        })
        .catch((err) => {
          console.error(err);
          console.log(
            'we should probably just go back to the previous page? maybe display the error'
          );
        });
    }

    adjustUser(user) {
      // replaces username with either the alias or stored username depending on the room settings.

      const { populatedRoom } = this.state;
      if (Object.keys(populatedRoom).length === 0) return user;
      const { connectUpdateRoom } = this.props;
      const { members } = populatedRoom;
      const shouldAliasUsername =
        populatedRoom.settings.displayAliasedUsernames;
      const memberIndex = members.findIndex((mem) => mem.user._id === user._id);
      const userToReturn = { ...user };
      let usernameToReturn = user.username;
      let hasChanges = false;

      if (memberIndex < 0) return user;

      if (shouldAliasUsername) {
        if (
          members[memberIndex].alias &&
          members[memberIndex].alias.length > 0
        ) {
          usernameToReturn = members[memberIndex].alias;
        } else {
          // @TODO get rid of number on the end
          let newAlias = hri.random();
          // check for duplicates
          // eslint-disable-next-line no-loop-func
          while (members.find((mem) => mem.alias === newAlias)) {
            newAlias = hri.random();
          }
          newAlias = newAlias
            .split('-')
            .splice(0, 2)
            .join('-');
          members[memberIndex].alias = newAlias;
          usernameToReturn = newAlias;
          hasChanges = true;
        }
      }

      if (hasChanges) {
        connectUpdateRoom(populatedRoom._id, { members });
      }

      userToReturn.username = usernameToReturn;
      console.log(userToReturn);
      return userToReturn;
    }

    // used to get aliased or un-aliased members
    // use getCurrentMembers in lieu of populatedRoom.currentMembers
    // every time we get currentMembers in Workspace's, use this function
    // if necessary, create aliases
    // also, update members list to keep the aliased names
    // members will store aliases & regular usernames
    // currentMembers is either/or
    // eslint-disable-next-line react/sort-comp
    getCurrentMembers(updatedCurrentMembers = []) {
      // iterate currentMembers & insert into the username field hri.random/
      // alias already assigned w/in members list or
      // actual username, depending on settings
      // if members change, update db & possibly currentMembers & Redux store
      // updateRoom action does this

      // USER_JOINED will give updatedCurrentMembers arg
      const { populatedRoom } = this.state;
      if (Object.keys(populatedRoom).length === 0) return updatedCurrentMembers;
      const { connectUpdateRoom } = this.props;
      const { members } = populatedRoom;
      const shouldAliasUsernames =
        populatedRoom.settings.displayAliasedUsernames;

      // if updatedCurrentMembers are passed in, give them the same alias as
      // that user in populatedRoom.members
      // alias populatedRoom.currentMembers & members
      // else us populatedRoom.currentMembers
      const currentMembers = updatedCurrentMembers.length
        ? updatedCurrentMembers
        : populatedRoom.currentMembers;

      // eslint-disable-next-line no-restricted-syntax
      for (const currentMember of currentMembers) {
        const memberIndex = members.findIndex(
          (el) => el.user._id === currentMember._id
        );

        if (memberIndex >= 0) {
          if (shouldAliasUsernames) {
            if (
              members[memberIndex].alias &&
              members[memberIndex].alias.length > 0
            ) {
              currentMember.username = members[memberIndex].alias;
            } else {
              let newAlias = hri.random();
              // check for duplicates
              // eslint-disable-next-line no-loop-func
              while (members.find((mem) => mem.alias === newAlias)) {
                newAlias = hri.random();
              }
              newAlias = newAlias
                .split('-')
                .splice(0, 2)
                .join('-');
              members[memberIndex].alias = newAlias;
              currentMember.username = newAlias;
            }
          } else {
            // aliased usernames are off
            // set the currentMember's usernames to the original usernames
            currentMember.username = members[memberIndex].user.username;
          }
        }
      }

      connectUpdateRoom(populatedRoom._id, { members, currentMembers });
      return currentMembers;
    }

    render() {
      const { history } = this.props;
      const { loading, populatedRoom } = this.state;
      if (loading) {
        return <Loading message="Fetching your room..." />;
      }

      return (
        <WrappedComponent
          populatedRoom={populatedRoom}
          history={history}
          resetRoom={this.syncRooms}
        />
      );
    }
  }

  PopulatedRoom.propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({ room_id: PropTypes.string }),
    }).isRequired,
    history: PropTypes.shape({}).isRequired,
    connectUpdateRoom: PropTypes.func.isRequired,
  };

  return connect(null, {
    connectUpdateRoom: updateRoom,
  })(PopulatedRoom);
}

export default withPopulatedRoom;
