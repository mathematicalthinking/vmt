import { connect } from 'react-redux';
import { getActivities } from '../store/actions';
import { HomepageLayout } from '../Layout'
// import {  }

const mapStateToProps = store => ({
  activities: store.activities.byId,
})

export default connect(mapStateToProps, { getActivities, })(HomepageLayout)
