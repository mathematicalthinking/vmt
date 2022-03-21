import React, { Component } from 'react';
import PropTypes from 'prop-types';
import API from '../../utils/apiRequests';
import buildLog from '../../utils/buildLog';
import Loading from '../../Components/Loading/Loading';

function withPopulatedRoom(WrappedComponent) {
  class PopulatedRoom extends Component {
    state = {
      loading: true,
    };

    componentDidMount() {
      this.cancelFetch = false;
      const { match } = this.props;
      // give a fn to workspace that does the fetch and resets w/populatedRoom on btn click
      API.getPopulatedById('rooms', match.params.room_id, false, true)
        .then((res) => {
          this.populatedRoom = res.data.result;
          this.populatedRoom.log = buildLog(
            this.populatedRoom.tabs,
            this.populatedRoom.chat
          );
          if (!this.cancelFetch) this.setState({ loading: false });
        })
        .catch(() => {
          console.log(
            'we should probably just go back to the previous page? maybe display the error'
          );
        });
    }

    componentWillUnmount() {
      this.cancelFetch = true;
    }

    // fn for a button in Workspace to sync room data
    syncRooms = () => {
      this.cancelFetch = false;
      const { match } = this.props;
      API.getPopulatedById('rooms', match.params.room_id, false, true)
      .then((res) => {
        this.populatedRoom = res.data.result;
        this.populatedRoom.log = buildLog(
          this.populatedRoom.tabs,
          this.populatedRoom.chat
        );
        if (!this.cancelFetch) this.setState({ loading: false });
      })
      .catch(() => {
        console.log(
          'we should probably just go back to the previous page? maybe display the error'
        );
      });
    }

    render() {
      const { history } = this.props;
      const { loading } = this.state;
      if (loading) {
        return <Loading message="Fetching your room..." />;
      }

      return (
        <WrappedComponent
          populatedRoom={this.populatedRoom}
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
