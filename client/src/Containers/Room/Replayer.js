import React, { Component } from 'react';
import WorkspaceLayout from '../../Layout/Room/Workspace/Workspace';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/';
class Replayer extends Component {

  state = {
    playing: false,
    logIndex: 0,
  }
  componentDidMount(){
    const { events, chat } = this.props.room;
    this.log = events.concat(chat).sort((a, b) => {
      let timeA = new Date(a.timeStamp).getTime();
      let timeB = new Date(b.timeStamp).getTime();
      return timeA - timeB
    })
    console.log(this.log)

  }

  render() {
    return (
      <div>replayer</div>
      // <WorkspaceLayout {...this.props} replaying />
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    room: state.rooms.byId[ownProps.match.params.room_id],
    user: state.user,
    loading: state.loading.loading,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateRoom: (roomId, body) => dispatch(actions.updateRoom(roomId, body)),
  }
}



export default connect(mapStateToProps, mapDispatchToProps)(Replayer);
