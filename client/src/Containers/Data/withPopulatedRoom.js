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
      this.fetchRoom(match.params.room_id)
      this.initializeListeners();
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
        const { populatedRoom } = this.state
        this.fetchRoom(populatedRoom._id);
      });
    }

    fetchRoom(roomId) {
      API.getPopulatedById('rooms', roomId, false, true)
        .then((res) => {
          const populatedRoom = res.data.result;
          populatedRoom.log = buildLog(
            populatedRoom.tabs,
            populatedRoom.chat
          );
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
