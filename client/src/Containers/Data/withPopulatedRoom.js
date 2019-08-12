import React, { Component } from 'react';
import PropTypes from 'prop-types';
import API from '../../utils/apiRequests';
import buildLog from '../../utils/buildLog';

function withPopulatedRoom(WrappedComponent) {
  class PopulatedRoom extends Component {
    state = {
      loading: true,
    };

    componentDidMount() {
      const { match } = this.props;
      console.log(match.params.room_id);
      API.getPopulatedById('rooms', match.params.room_id, false, true)
        .then(res => {
          this.populatedRoom = res.data.result;
          this.populatedRoom.log = buildLog(
            this.populatedRoom.tabs,
            this.populatedRoom.chat
          );
          this.setState({ loading: false });
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
        return <div>loading</div>;
      }
      return (
        <WrappedComponent
          populatedRoom={this.populatedRoom}
          history={history}
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
