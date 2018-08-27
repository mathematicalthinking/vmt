import React, { Component } from 'react';
import { connect } from 'react-redux';
import { populateResource } from '../../store/reducers/';
import * as actions from '../../store/actions/';
import DashboardLayout from '../../Layout/Dashboard/Dashboard';
import BoxList from '../../Layout/BoxList/BoxList';
import NewResource from '../Create/NewResource/NewResource';
import Aux from '../../Components/HOC/Auxil';
import Modal from '../../Components/UI/Modal/Modal';
import Button from '../../Components/UI/Button/Button';
import Students from '../Students/Students';

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
  }

  componentDidMount() {
    const { currentCourse, user } = this.props;

    // Check user's permission level -- owner, member, or guest
    let updatedTabs = [...this.state.tabs];
    let owner = false;
    let member = false;
    if (currentCourse.creator === user.id) {
      updatedTabs = updatedTabs.concat([{name: 'Grades'}, {name: 'Insights'}, {name:'Settings'}]);
      owner = true;
    }
    if (currentCourse.members) {
      if (currentCourse.members.find(member => member.user._id === user.id)) member = true;
      // if (!user.seenTour) {
      //   this.setState({touring: true})
      // }
      updatedTabs = this.displayNotifications(updatedTabs);
    }
    // Get Any other notifications
    this.setState({
      tabs: updatedTabs,
      owner: owner,
      member: member,
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.currentCourse.members !== this.props.currentCourse.members) {
      const updatedTabs = this.displayNotifications([...this.state.tabs]);
      this.setState({tabs: updatedTabs})
    }
  }
  requestAccess = () => {
    const {currentCourse, user} = this.props;
    this.props.requestAccess(currentCourse.creator, user.id, 'course', currentCourse._id)
    this.props.history.push('/confirmation')
  }

  displayNotifications = (tabs) => {
    const { courseNotifications } = this.props.user;
    if (courseNotifications.access.length > 0) {
      tabs[2].notifications = courseNotifications.access.length;
    }
    if (courseNotifications.newRoom.length > 0){
      tabs[1].notifications = courseNotifications.newRoom.length;
    }
    return tabs;
  }

  render() {
    // check if the course has loaded
    // @TODO We should put this in MOunt or Update so that we can leverage some codesplitting?
    const course = this.props.currentCourse;
    const resource = this.props.match.params.resource;
    const user = this.props.user;
    let content;
    console.log("COURSE: ", course)
    // @TODO THIS VAN BE LESS VERBOSE USE PROGILE CONTAINER AS A TEMPLATE. WE'LL NEED TO USE RESOURCES LAYOUT
    // INSTEAD OF BOXLIST
    switch (resource) {
      case 'assignments' :
        content = <div>
          {this.state.owner ? <NewResource resource='assignment' course={{_id: course._id, members: course.members}}/> : null }
          <BoxList
            list={course.assignments || []}
            linkPath={`/profile/courses/${course._id}/assignments/`}
            linkSuffix={`/details`}
          />
        </div>
        break;
      case 'rooms' :
        content = <div>
          {this.state.owner ? <NewResource resource='room' course={{_id: course._id, members: course.members}}/> : null}
          <BoxList
            list={course.rooms || []}
            linkPath={`/profile/courses/${course._id}/rooms/`}
            linkSuffix='/summary'
          />
        </div>
        break;
      case 'members' :
      // @TODO make a folder of NOTFICATION_TYPES ...somewhere
        content = <Students classList={course.members} notifications={user.courseNotifications.access} resource='course'  resourceId={course._id} owner={this.state.owner} />
        break;
      default : content = null;
    }
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
          <DashboardLayout
            routingInfo={this.props.match}
            crumbs={[{title: 'Profile', link: '/profile/courses'}, {title: course.name, link: `/profile/courses/${course._id}/assignments/`}]}
            sidePanelTitle={course.name}
            content={content}
            tabs={this.state.tabs}
          /> :
          (course.isPublic ? publicAccessModal : privateAccessModal)}
      </Aux>
    )
  }
}

const mapStateToProps = (store, ownProps) => ({
  currentCourse: populateResource(store, 'courses', ownProps.match.params.course_id, ['assignments', 'rooms']),
  user: store.user,
})

const mapDispatchToProps = dispatch => {
  return {
    updateCourseRooms: room => dispatch(actions.updateCourseRooms(room)),
    clearCurrentCourse: () => dispatch(actions.clearCurrentCourse()),
    grantAccess: (user, resource, id) => dispatch(actions.grantAccess(user, resource, id)),
    requestAccess: (toUser, fromUser, resource, resourceId) => dispatch(actions.requestAccess(toUser, fromUser, resource, resourceId))
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Course);
