import React, { Component } from 'react';
import { connect } from 'react-redux';
import difference from 'lodash/difference';
import { populateResource } from '../../store/reducers/';
import * as actions from '../../store/actions/';
import DashboardLayout from '../../Layout/Dashboard/Dashboard';
import Aux from '../../Components/HOC/Auxil';
import Modal from '../../Components/UI/Modal/Modal';
import PrivateAccessModal from '../../Components/UI/Modal/PrivateAccess';
import PublicAccessModal from '../../Components/UI/Modal/PublicAccess';
import Button from '../../Components/UI/Button/Button';

class Course extends Component {
  state = {
    owner: false,
    member: false,
    guestMode: false,
    currentCourse: {}, // Right now I'm just saving currentCourse is state to compare the incoming props currentCourse to look for changes
    tabs: [
      {name: 'Activities'},
      {name: 'Rooms'},
      {name: 'Members'},
    ],
    firstView: false,
  }
  initialTabs = [
    {name: 'Activities'},
    {name: 'Rooms'},
    {name: 'Members'},
  ]
  // SO we can reset the tabs easily

  componentDidMount() {
    const { course, user } = this.props;
    let firstView = false;
    if (user.courseNotifications.access.filter(ntf => (ntf.notificationType === 'grantedAccess' && ntf._id === course._id)).length > 0) {
      firstView = true;
      this.props.clearNotification(course._id, user.id, 'course', 'access')
    }
    // check if we need to fetch data
    this.checkForFetch();
    // Check user's permission level -- owner, member, or guest
    let updatedTabs = [...this.state.tabs];
    let owner = false;
    let member = false;
    if (course.creator === user.id) {
      updatedTabs = updatedTabs.concat([{name: 'Grades'}, {name: 'Insights'}, {name:'Settings'}]);
      this.initialTabs.concat([{name: 'Grades'}, {name: 'Insights'}, {name:'Settings'}])
      owner = true;
    }
    if (course.members) {
      if (course.members.find(member => member.user._id === user.id)) member = true;
      updatedTabs = this.displayNotifications(updatedTabs);
    }
    // Get Any other notifications
    this.setState({
      tabs: updatedTabs,
      owner,
      member,
      firstView,
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if ((this.state.member || this.state.owner) && !this.props.loading) {
      this.checkForFetch();
      if (prevProps.user.courseNotifications.access !== this.props.user.courseNotifications.access) {
        let tabs = this.initialTabs;
        if (this.state.owner) tabs = [...this.initialTabs, {name: 'Grades'}, {name: 'Insights'}, {name:'Settings'}]
        const updatedTabs = this.displayNotifications(tabs)
        this.setState({tabs: updatedTabs})
      }
    }
  }

  requestAccess = () => {
    const {course, user} = this.props;
    // HEY? WHY DO WE NEED COURSE.CREATOR RIGHT HERE
    this.props.requestAccess(course.creator, user.id, 'course', course._id)
    this.props.history.push('/confirmation')
  }

  requestPublicAccess = () => {
    this.props.grantAccess(
      {_id: this.props.user.id, username: this.props.user.username}, 'course', this.props.course._id
    )
  }

  displayNotifications = (tabs) => {

    const { user, course } = this.props;
    const { courseNotifications }= user
    if (courseNotifications.access.length > 0 && course.creator === user.id) {
      tabs[2].notifications = courseNotifications.access.length;
    }
    if (courseNotifications.newRoom.length > 0){
      tabs[1].notifications = courseNotifications.newRoom.length;
    }
    return tabs;
  }

  checkForFetch = () => {
    const { course, user, match } = this.props;
    const resource = match.params.resource;
    const needToFetch = difference(user[resource], this.props[resource]).length !== 0;
    if (needToFetch) {
      // @IDEA We could avoid this formatting if we dont use camel case like in the Profile container
      let re = resource[0].toUpperCase() + resource.substr(1)
      this.props[`get${re}`](course[resource])
    }

  }

  render() {
    const { course, user, match } = this.props;
    const resource = match.params.resource;
    const contentData = {
      resource,
      parentResource: "courses",
      parentResourceId: course._id,
      userResources: course[resource] || [],
      notifications:  user.courseNotifications || [],
      userId: user.id,
      owner: this.state.owner,
    }
    console.log(contentData)
    // @TODO MAYBE MOVE THESE MODAL INSTANCES OUTTA HERE TO COMPONENTS/UI
    return (
      <Aux>
        {( this.state.owner || this.state.member || (course.isPublic && this.state.guestMode)) ?
          <Aux>
            <DashboardLayout
              routingInfo={this.props.match}
              crumbs={[{title: 'Profile', link: '/profile/courses'}, {title: course.name, link: `/profile/courses/${course._id}/activities/`}]}
              contentData={contentData}
              tabs={this.state.tabs}
            />
            <Modal show={this.state.firstView} close={() => this.setState({firstView: false })}>
              <p>Welcome to {course.name}. If this is your first time joining a course,
              we recommend you take a tour. Otherwise you can start exploring this course's features.</p>
              <Button click={() => this.setState({firstView: false})}>Explore</Button>
            </Modal>
          </Aux> :
          (course.isPublic ? <PublicAccessModal requestAccess={this.grantPublicAccess}/> : <PrivateAccessModal requestAccess={this.requestAccess}/>)}
      </Aux>
    )
  }
}

const mapStateToProps = (store, ownProps) => ({
  course: populateResource(store, 'courses', ownProps.match.params.course_id, ['activities', 'rooms']),
  activities: store.activities.allIds,
  rooms: store.rooms.allIds,
  user: store.user,
  loading: store.loading.loading,
})

const mapDispatchToProps = dispatch => {
  return {
    getActivities: ids => dispatch(actions.getActivities(ids)),
    getRooms: ids => dispatch(actions.getRooms(ids)),
    updateCourseRooms: room => dispatch(actions.updateCourseRooms(room)),
    updateCourseActivities: activity => dispatch(actions.updateCourseActivities),
    grantAccess: (user, resource, id) => dispatch(actions.grantAccess(user, resource, id)),
    requestAccess: (toUser, fromUser, resource, resourceId) => dispatch(actions.requestAccess(toUser, fromUser, resource, resourceId)),
    clearNotification: (ntfId, userId, resource, list) => dispatch(actions.clearNotification(ntfId, userId, resource, list)),
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Course);
