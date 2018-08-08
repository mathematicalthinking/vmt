import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/';
import { getUserResources } from '../../store/reducers/';
import BoxList from '../../Layout/BoxList/BoxList';
class Rooms extends Component {

  componentDidMount() {
    console.log('Rooms Mounted')
    console.log('props: ', this.props)
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
  rooms: store.rooms.byId,
  roomsArr: store.rooms.allIds,
})

const mapDispatchToProps = dispatch => ({
  populateRooms: ids => { dispatch(actions.getRooms(ids)) },
})

export default connect(mapStateToProps, mapDispatchToProps)(Rooms);
