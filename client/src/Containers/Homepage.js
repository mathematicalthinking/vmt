import { connect } from 'react-redux';
import { getActivities, createRoom, } from '../store/actions';
import { HomepageLayout } from '../Layout'
// import {  }

console.log(createRoom)

const mapStateToProps = store => ({
  activities: store.activities.byId,
})

export default connect(mapStateToProps, { getActivities, createRoom,})(HomepageLayout)
