import { connect } from 'react-redux';
import { getActivities, createRoom } from '../store/actions';
import { HomepageLayout } from '../Layout';
// import {  }

const mapStateToProps = (store) => ({
  activities: store.activities.byId,
  rooms: store.rooms.byId,
  user: store.user,
});

export default connect(
  mapStateToProps,
  { getActivities, createRoom }
)(HomepageLayout);
//
