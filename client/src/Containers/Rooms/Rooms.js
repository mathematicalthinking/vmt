import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/';
import { getUserResources } from '../../store/reducers/';
import NewResource from '../Create/NewResource/NewResource';
import BoxList from '../../Layout/BoxList/BoxList';
class Rooms extends Component {

  componentDidMount() {
    const { roomsArr, userRoomIds } = this.props
    if (roomsArr.length === 0 && userRoomIds.length > 0) {
      this.props.populateRooms(userRoomIds)
    }
  }
  render() {
    console.log('Rooms rendered')
    return (
      <div>
        <NewResource resource='room' />
        <BoxList list={this.props.userRooms} resource='room' linkPath='/profile/room/' linkSuffix='/summary'/>
      </div>
    )
  }
}

const mapStateToProps = store => ({
  userRoomIds: store.user.rooms,
  userRooms: getUserResources(store, 'rooms'),
  roomsArr: store.rooms.allIds,
})

const mapDispatchToProps = dispatch => ({
  populateRooms: ids => { dispatch(actions.getRooms(ids)) },
})

export default connect(mapStateToProps, mapDispatchToProps)(Rooms);
