import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { socket } from 'utils';
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
      // give a fn to workspace that does the fetch and resets w/populatedRoom on btn click
      API.getPopulatedById('rooms', match.params.room_id, false, true)
        .then((res) => {
          const populatedRoom = res.data.result;
          populatedRoom.log = buildLog(populatedRoom.tabs, populatedRoom.chat);
          if (!this.cancelFetch)
            this.setState({ loading: false, populatedRoom });
        })
        .catch((err) => {
          console.error(err);
          console.log(
            'we should probably just go back to the previous page? maybe display the error'
          );
        });
    }

    componentWillUnmount() {
      this.cancelFetch = true;
    }

    // fn for a button in Workspace to sync room data
    // create a new socket message to reset the room
    // make sure connections are happening
    // is populatedRoom updating?
    // is socket receiving the message? / is it getting called?
    // try making populatedRoom state and reset the state, right now now it's this

    syncRooms = async () => {
      this.cancelFetch = false;
      const { populatedRoom: oldRoom } = this.state;
      socket.emit('RESET_ROOM', oldRoom._id);
      return API.getPopulatedById('rooms', oldRoom._id, false, true)
        .then((res) => {
          const populatedRoom = res.data.result;
          populatedRoom.log = buildLog(populatedRoom.tabs, populatedRoom.chat);
          if (!this.cancelFetch)
            this.setState({ loading: false, populatedRoom });
        })
        .catch((err) => {
          console.error(err);
          console.log(
            'we should probably just go back to the previous page? maybe display the error'
          );
        });
    };

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
    match: PropTypes.shape({}).isRequired,
    history: PropTypes.shape({}).isRequired,
  };

  return PopulatedRoom;
}

export default withPopulatedRoom;
