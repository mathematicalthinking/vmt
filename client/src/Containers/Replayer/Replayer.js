import React, { Component } from 'react';
import WorkspaceLayout from '../../Layout/Room/Workspace/Workspace';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/';
import DesmosReplayer from './DesmosReplayer';
// import GgbReplayer from './GgbReplayer';
// import ChatReplayer from './ChatReplayer;'
class Replayer extends Component {

  state = {
    playing: false,
    logIndex: 0,
  }

  log = this.props.room.events.concat(this.props.room.chat).sort((a, b) => {
    let timeA = new Date(a.timeStamp).getTime();
    let timeB = new Date(b.timeStamp).getTime();
    return timeA - timeB
  })

  playing = () => {

  }

  playPause = () => {
    this.setState(prevState => ({
      playing: !prevState.playing
    }))
  }

  render() {
    return (
      // <div>replayer</div>
      // @ TODO WE SHOULD PASS THE GRAPH CHAT AND REPLAY COMPONENTS TO WORKSPACE SO IT DOENST
      // HAVE THOSE NESTED IF STATEMENTS SAYING WHICH GRAPH TO DISPLAY
      <WorkspaceLayout
        graph={this.props.roomType === 'geogebra'
          ? null :
          <DesmosReplayer event={this.log[this.state.logIndex]}/>
        }
        {...this.props} replaying />
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
