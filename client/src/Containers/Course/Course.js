import React, { Component } from 'react';
import { connect } from 'react-redux';
import { populateCurrentCourse } from '../../store/reducers/';
import * as actions from '../../store/actions/';
import API from '../../utils/apiRequests';
import DashboardLayout from '../../Layout/Dashboard/Dashboard';
import BoxList from '../../Layout/BoxList/BoxList';
import NewResource from '../Create/NewResource/NewResource';
import PublicListLayout from '../../Layout/PublicResource/PublicResource';
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
    const { currentCourse, userId } = this.props;
    // The idea here is that a course will not have members unless it has already been populated
    // if (!currentCourse.members) { // I DONT THINK WE EVER GET A COURSE FROM THE DB W/O ITS MEMBERS
    //   this.props.populateCurrentCourse(this.props.match.params.course_id);
    // }

    // Check user's permission level -- owner, member, or guest
    let updatedTabs = [...this.state.tabs];
    let owner = false;
    let member = false;
    if (currentCourse.creator === userId) {
      let notifications = currentCourse.notifications.filter(ntf => (ntf.notificationType === 'requestAccess'))
      updatedTabs = updatedTabs.concat([{name: 'Grades'}, {name: 'Insights'}, {name:'Settings'}]);
      if (notifications.length > 0) {
        updatedTabs[1] = {name: 'Members', notifications: notifications.length}
      }
      owner = true;
    }
    else if (currentCourse.members) {
      if (currentCourse.members.find(member => member.user._id === userId)) {
        member = true;
      }
    }
    this.setState({
      tabs: updatedTabs,
      owner: owner,
      member: member,
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.currentCourse.notifications !== this.props.currentCourse.notifications) {
      let updatedTabs = [...this.state.tabs];
      let notifications = this.props.currentCourse.notifications.filter(ntf => (ntf.notificationType === 'requestAccess'))
      updatedTabs[1] = {name: 'Members', notifications: notifications.length}
      this.setState({tabs: updatedTabs})
    }

    if (prevProps.currentCourse.members !== this.props.currentCourse.members) { // @TODO THIS WILL LIKELY HAVE TO CHANGE WHEN WE HAVE REMOVE USER FUNCTIONALITY
      this.setState({member: true}) // CAN WE JUST ASSUME THIS? OR SHOULD WE FILTER THROUGH MEMBERS TO MAKE SURE CURRENT USER IS A MEMBER
    }
  }
  requestAccess = () => {
    // @TODO Use redux actions to make this request
    API.requestAccess('course', this.props.match.params.course_id, this.props.userId)
    .then(res => {
      // @TODO SEND/DISPLAY CONFIRMATION somehow
      this.props.history.push('/confirmation')
    })
  }

  render() {
    // check if the course has loaded
    // @TODO We should put this in MOunt or Update so that we can leverage some codesplitting?
    const course = this.props.currentCourse;
    const resource = this.props.match.params.resource;
    const notifications = course.notifications.filter(ntf => (ntf.notificationType === 'requestAccess'))
    let content;
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
        content = <Students classList={course.members} notifications={notifications} resource='course'  resourceId={course._id} owner={this.state.owner} />
        break;
      default : content = null;
    }
    const publicAccessModal = <Modal show={true}>
      <p>If you would like to add this course (and all of this course's rooms) to your
        list of courses and rooms, click 'Join'. If you just want to poke around click 'Explore'
      </p>
      <Button click={() => this.props.grantAccess(
        {_id: this.props.userId, username: this.props.username}, 'course', course._id)}>Join</Button>
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
            crumbs={[{title: 'Profile', link: '/profile/courses'}, {title: course.name, link: `/profile/course/${course._id}/assignments/`}]}
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
  currentCourse: populateCurrentCourse(store, ownProps.match.params.course_id, ['assignments']),
  userId: store.user.id,
  username: store.user.username,
})

const mapDispatchToProps = dispatch => {
  return {
    updateCourseRooms: room => dispatch(actions.updateCourseRooms(room)),
    // populateCurrentCourse: id => dispatch(actions.populateCurrentCourse(id)),
    clearCurrentCourse: () => dispatch(actions.clearCurrentCourse()),
    grantAccess: (user, resource, id) => dispatch(actions.grantAccess(user, resource, id))
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Course);
