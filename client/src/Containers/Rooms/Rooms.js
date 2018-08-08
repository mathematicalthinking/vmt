import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/';
import { getUserResources } from '../../store/reducers/';
import BoxList from '../../Layout/BoxList/BoxList';
class Rooms extends Component {

  componentDidMount() {
    console.log('Rooms Mounted')
    console.log('props: ', this.props)
    const { roomsArr, userRoomIds } = this.props
    // if the user has rooms but they haven't been added to the store yet
    if (roomsArr.length === 0 && userRoomIds.length > 0) {
      this.props.populateRooms(userRoomIds)
    }
  }
  render() {
    console.log('Rooms rendered')
    return (
      <div>
        <BoxList list={this.props.userRooms} resource='room'/>
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
