import React, { Component } from 'react';
import { connect } from 'react-redux';
import difference from 'lodash/difference';
import { populateResource } from '../../store/reducers/';
import * as actions from '../../store/actions/';
import DashboardLayout from '../../Layout/Dashboard/Dashboard';
import Aux from '../../Components/HOC/Auxil';
import Modal from '../../Components/UI/Modal/Modal';
import Button from '../../Components/UI/Button/Button';

class Course extends Component {
  state = {
    owner: false,
    member: false,
    guestMode: false,
    currentCourse: {}, // Right now I'm just saving currentCourse is state to compare the incoming props currentCourse to look for changes
    tabs: [
      {name: 'Assignments'},
      {name: 'Rooms'},
      {name: 'Members'},
    ],
    firstView: false,
  }
  initialTabs = [
    {name: 'Assignments'},
    {name: 'Rooms'},
    {name: 'Members'},
  ]
  // SO we can reset the tabs easily

  componentDidMount() {
    const { course, user } = this.props;
    let firstView = false;
    if (user.courseNotifications.access.filter(ntf => (ntf.notificationType === 'grantedAccess' && ntf._id === course._id)).length > 0) {
      console.log("I was granted access")
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
      console.log(this.initialTabs)
      owner = true;
    }
    if (course.members) {
      if (course.members.find(member => member.user._id === user.id)) member = true;
      updatedTabs = this.displayNotifications(updatedTabs);
      console.log(this.initialTabs)
    }
    // Get Any other notifications
    console.log(updatedTabs)
    this.setState({
      tabs: updatedTabs,
      owner,
      member,
      firstView,
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.member || this.state.owner) {
      this.checkForFetch();
      if (prevProps.user.courseNotifications.access !== this.props.user.courseNotifications.access) {
        let tabs = this.initialTabs;
        if (this.state.owner) tabs = [...this.initialTabs, {name: 'Grades'}, {name: 'Insights'}, {name:'Settings'}]
        const updatedTabs = this.displayNotifications(tabs)
        console.log(updatedTabs)
        this.setState({tabs: updatedTabs})
      }
    }
  }

  requestAccess = () => {
    const {course, user} = this.props;
    this.props.requestAccess(course.creator, user.id, 'course', course._id)
    this.props.history.push('/confirmation')
  }

  displayNotifications = (tabs) => {

    const { user, course } = this.props;
    const { courseNotifications }= user
    console.log(courseNotifications.access.length > 0 && this.state.owner)
    if (courseNotifications.access.length > 0 && course.creator === user.id) {
      console.log('we in here alright')
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
    // check if the course has loaded
    // @TODO We should put this in MOunt or Update so that we can leverage some codesplitting?
    const { course, user, match } = this.props;
    const resource = match.params.resource;

    // @TODO THIS VAN BE LESS VERBOSE USE PROGILE CONTAINER AS A TEMPLATE. WE'LL NEED TO USE RESOURCES LAYOUT
    // INSTEAD OF BOXLIST
    console.log(resource)
    const contentData = {
      resource,
      parentResource: "course",
      resourceId: course._id,
      userResources: this.props.course[resource] || [],
      notifications:  user.courseNotifications || [],
      userId: user.id,
      owner: this.state.owner,
    }
    console.log(contentData.notifications)
    const publicAccessModal = <Modal show={true}>
      <p>If you would like to add this course (and all of this course's rooms) to your
        list of courses and rooms, click 'Join'. If you just want to poke around click 'Explore'
      </p>
      <Button click={() => this.props.grantAccess(
        {_id: this.props.user.id, username: this.props.user.username}, 'course', course._id)}>Join</Button>
      <Button click={() => {this.setState({guestMode: true})}}>Explore</Button>
    </Modal>
    const privateAccessModal = <Modal show={true}>
      <p>You currently don't have access to this course. If you would like to
        request access from the owner click "Join". When your request is accepted
        this course will appear in your list of courses on your profile.
      </p>
      <Button click={this.requestAccess}>Join</Button>
    </Modal>;
    return (
      <Aux>
        {( this.state.owner || this.state.member || (course.isPublic && this.state.guestMode)) ?
          <Aux>
            <DashboardLayout
              routingInfo={this.props.match}
              crumbs={[{title: 'Profile', link: '/profile/courses'}, {title: course.name, link: `/profile/courses/${course._id}/assignments/`}]}
              contentData={contentData}
              tabs={this.state.tabs}
            />
            <Modal show={this.state.firstView} close={() => this.setState({firstView: false })}>
              <p>Welcome to {course.name}. If this is your first time joining a course,
              we recommend you take a tour. Otherwise you can start exploring this course's features.</p>
              <Button click={() => this.setState({firstView: false})}>Explore</Button>
              </Modal>
          </Aux> :
          (course.isPublic ? publicAccessModal : privateAccessModal)}
      </Aux>
    )
  }
}

const mapStateToProps = (store, ownProps) => ({
  course: populateResource(store, 'courses', ownProps.match.params.course_id, ['assignments', 'rooms']),
  assignments: store.assignments.allIds,
  rooms: store.rooms.allIds,
  user: store.user,
})

const mapDispatchToProps = dispatch => {
  return {
    getAssignments: ids => dispatch(actions.getAssignments(ids)),
    getRooms: ids => dispatch(actions.getRooms(ids)),
    updateCourseRooms: room => dispatch(actions.updateCourseRooms(room)),
    updateCourseAssignments: assignment => dispatch(actions.updateCourseAssignments),
    clearCurrentCourse: () => dispatch(actions.clearCurrentCourse()),
    grantAccess: (user, resource, id) => dispatch(actions.grantAccess(user, resource, id)),
    requestAccess: (toUser, fromUser, resource, resourceId) => dispatch(actions.requestAccess(toUser, fromUser, resource, resourceId)),
    clearNotification: (ntfId, userId, resource, list) => dispatch(actions.clearNotification(ntfId, userId, resource, list)),
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Course);
