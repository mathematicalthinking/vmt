import React, { Component } from 'react';
import WorkspaceLayout from '../../Layout/Room/Workspace/Workspace';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/';
import DesmosReplayer from './DesmosReplayer';
import GgbReplayer from './GgbReplayer';
import ChatReplayer from './ChatReplayer';
import ReplayControls from '../../Components/Replayer/ReplayerControls';
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
    console.log('playing')
  }
  pausePlay = () => {
    console.log('toggle play')
    this.setState(prevState => ({
      playing: !prevState.playing
    }))
  }

  render() {
    console.log('rendering replayer container')
    const { room } = this.props
    const event = this.log[this.state.logIndex];
    return (
      // <div>replayer</div>
      // @ TODO WE SHOULD PASS THE GRAPH CHAT AND REPLAY COMPONENTS TO WORKSPACE SO IT DOENST
      // HAVE THOSE NESTED IF STATEMENTS SAYING WHICH GRAPH TO DISPLAY
      <WorkspaceLayout
        graph = {room.roomType === 'geogebra' ?
          // I dont like that these need to be wrapped in functions 👇 could do
          // props.children but I like naming them.
          () => <GgbReplayer event={event} /> :
          () => <DesmosReplayer event={event} />}
        // chat = {() => <ChatReplayer event={event} />}
        chat={() => <div>chat</div>}
        replayer={() =>
          (<ReplayControls
            playing={this.state.playing}
            pausePlay={this.pausePlay}
            index={this.state.logIndex}
            durstion={this.log.length}
           />)
        }
      />
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
