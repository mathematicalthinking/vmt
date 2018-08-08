import React, { Component } from 'react';
import { connect } from 'react-redux';
class Rooms extends Component {
  componentDidMount() {
    console.log('Rooms Mounted')
    console.log('props: ', this.props)
  }
  render() {
    console.log('Rooms rendered')
    return (
      <div>rooms</div>
    )
  }
}

const mapStateToProps = store => ({
  // rooms: store.a
})

const mapDispatchToProps = dispatch => ({
  // getUserRooms:
})

export default connect(mapStateToProps, mapDispatchToProps)(Rooms);
