import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/';
import BoxList from '../../Layout/BoxList/BoxList';
import NewResource from '../Create/NewResource/NewResource';
import { getUserResources } from '../../store/reducers/';

class Templates extends Component {

  componentDidMount() {
    console.log(this.props)
    const {userCourseTemplates, userCourseTemplateIds,
      userRoomTemplates, userRoomTemplateIds} = this.props;
    if (!userCourseTemplates && userCourseTemplateIds.length > 0) {
      this.props.populateCourseTemplates(userCourseTemplateIds);
    }
    if (!userRoomTemplates & userRoomTemplateIds.length > 0) {
      this.props.populateRoomTemplates(userRoomTemplateIds);
    }
  }
  render(){
    return (
      <div>
        <NewResource resource='course' template/>
        <NewResource resource='room' template/>
        {/* <NewCourse resource='course'/> */}
        <h2>Course Templates</h2>
        <BoxList list={this.props.userCourseTemplates || []}
          resource='courseTemplates'
          linkPath='/profile/courseTemplates/'
          linkSuffix='/rooms'
          template
        />
        <h2>Room Templates</h2>
        <BoxList list={this.props.userRoomTemplates || []}
          resource='roomTemplates'
          linkPath='/profile/courseTemplates/'
          linkSuffix='/summary'
          template
        />
      </div>
    )
  }
}

const mapStateToProps = store => ({
  userCourseTemplateIds: store.user.courseTemplates,
  userCourseTemplates: getUserResources(store, 'courseTemplates'),
  userRoomTemplateIds: store.user.roomTemplates,
  userRoomTemplates: getUserResources(store, 'roomTemplates'),
  userId: store.user.id,
})

const mapDispatchToProps = dispatch => ({
  populateCourseTemplates: ids => {dispatch(actions.getCourseTemplates(ids))},
  populateRoomTemplates: ids => {dispatch(actions.getRoomTemplates(ids))}
})
export default connect(mapStateToProps, mapDispatchToProps)(Templates);
