import React, { Component } from 'react';
import { connect } from 'react-redux';
import _difference from 'lodash/difference';
import { populateResource } from '../store/reducers';
import { 
  getActivities,
  getRooms, 
  updateCourseRooms, 
  updateCourseActivities, 
  clearNotification, 
  getCourse,
  getUser,
} from '../store/actions';
import DashboardLayout from '../Layout/Dashboard/Dashboard';
import Aux from '../Components/HOC/Auxil';
import Modal from '../Components/UI/Modal/Modal';
import Access from './Access';
// import PublicAccessModal from '../Components/UI/Modal/PublicAccess';
import Button from '../Components/UI/Button/Button';

class Course extends Component {
  state = {
    owner: false,
    member: false,
    guestMode: true,
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
    const { course, user, accessNotifications, clearNotification, match } = this.props;
    if (course) {
      this.props.getCourse(course._id); // What information are we getting here
      this.props.getUser(user._id); 
      let firstView = false;
      if (accessNotifications.length > 0) {
       accessNotifications.forEach(ntf => {
          if (ntf.notificationType === 'grantedAccess' && ntf._id === course._id) {
            // RESOLVE THIS NOTIFICATION
            firstView = true;
            clearNotification(course._id, user._id, null, 'courses', 'access', ntf.notificationType) //CONSIDER DOING THIS AND MATCHING ONE IN ROOM.js IN REDUX ACTION
          }
        })
      }
      // check if we need to fetch data
      this.checkForFetch();
      // Check user's permission level -- owner, member, or guest
      let updatedTabs = [...this.state.tabs];
      let owner = false;
      if (course.creator === user._id) {
        updatedTabs = updatedTabs.concat([{name: 'Grades'}, {name: 'Insights'}]);
        this.initialTabs.concat([{name: 'Grades'}, {name: 'Insights'}])
        owner = true;
      }
      updatedTabs = this.displayNotifications(updatedTabs);
      // Check for notifications that need resolution
      // Get Any other notifications
      this.setState({
        tabs: updatedTabs,
        owner,
        firstView,
      })
      if (course.members) {
        this.checkAccess();
      }
    } else {
      this.props.getCourse(match.params.course_id) 
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.course && this.props.course) {
      this.checkAccess();
    }

    if (prevProps.course && prevProps.course.members.length !== this.props.course.members.length) {
      this.checkAccess();
    }
    if (prevProps.accessNotifications.length !== this.props.accessNotifications.length) {
      this.props.getCourse(this.props.match.params.course_id) 
      let updatedTabs = this.displayNotifications([...this.state.tabs])
      this.setState({tabs: updatedTabs})
    }
    if ((this.state.member || this.state.owner) && !this.props.loading) {
      this.checkForFetch();
    }
    if (prevProps.match.params.resource !== this.props.match.params.resource) {
      this.props.getUser(this.props.user._id) 
    }
  }

  requestAccess = () => {
    const {course, user} = this.props;
    // HEY? WHY DO WE NEED COURSE.CREATOR RIGHT HERE
    this.props.requestAccess(course.creator, user._id, 'courses', course._id)
    this.props.history.push('/confirmation')
  }

  requestPublicAccess = () => {
    this.props.grantAccess(
      {_id: this.props.user._id, username: this.props.user.username}, 'courses', this.props.course._id
    )
  }

  displayNotifications = (tabs) => {

    const { user, course, accessNotifications } = this.props;
    // if (course.creator === user._id
      let memberNtfs = accessNotifications.filter(ntf => (ntf._id === course._id && ntf.notificationType === 'requestAccess' || ntf.notificationType === 'newMember'));
      tabs[2].notifications = memberNtfs.length > 0 ? memberNtfs.length : '';
      let newRoomNtfs = accessNotifications.filter(ntf => (ntf._id === course._id && ntf.notificationType === 'assignedRoom'))
      tabs[1].notifications = newRoomNtfs.length > 0 ? newRoomNtfs.length : '';
    // }
    // if (accessNotifications.llength > 0){
    //   tabs[1].notifications = accessNotifications.llength;
    // }
    return tabs;
  }

  checkForFetch = () => {
    const { course, user, match } = this.props;
    const resource = match.params.resource;
    const needToFetch = _difference(user[resource], this.props[resource]).length !== 0;
    if (needToFetch) {
      // @IDEA We could avoid this formatting if we dont use camel case like in the myVMT container
      let re = resource[0].toUpperCase() + resource.substr(1)
      this.props[`get${re}`](course[resource])
    }
  }

  checkAccess = () => {
    this.props.course.members.forEach(member => {
       if (member.user._id === this.props.user._id) {
         this.setState({member: true, guestMode: false})
       }
    })
  }

  render() {
    let { course, user, match, accessNotifications } = this.props;
    if (course && !this.state.guestMode) {
      let resource = match.params.resource;
      let contentData = {
        resource,
        parentResource: "courses",
        parentResourceId: course._id,
        userResources: course[resource] || [],
        notifications:  accessNotifications.filter(ntf => ntf._id === course._id) || [],
        userId: user._id, // @TODO <-- get rid of this user user object below
        user: user,
        owner: this.state.owner,
      }
      let sidePanelData = {
        image: course.image,
        details: {
          main: course.name,
          secondary: course.description,
          additional: {
            code: course.entryCode,
            facilitators: course.members.reduce((acc, member) =>{
              if (member.role === 'facilitator') {
                acc += member.user.username + " "
              }
              return acc;
            }, ''),
            acitivities: course.activities.length,
            rooms: course.rooms.length,
          },
        },
        edit: {}
      }
      // @TODO MAYBE MOVE THESE MODAL INSTANCES OUTTA HERE TO COMPONENTS/UI
      return (
        <Aux>
          <DashboardLayout
            routingInfo={this.props.match}
            crumbs={[{title: 'My VMT', link: '/myVMT/courses'}, {title: course.name, link: `/myVMT/courses/${course._id}/activities/`}]}
            contentData={contentData}
            tabs={this.state.tabs}
            sidePanelData={sidePanelData}
            // user={user}
            accountType={user.accountType}
            bothRoles={this.state.bothRoles}
            view={'facilitator'}
          />
          <Modal show={this.state.firstView} close={() => this.setState({firstView: false })}>
            <p>Welcome to {course.name}. If this is your first time joining a course,
            we recommend you take a tour. Otherwise you can start exploring this course's features.</p>
            <Button theme={'Small'} click={() => this.setState({firstView: false})}>Explore</Button>
          </Modal>
        </Aux> 
      )   
    } else return (
      <Access  
        resource='courses'
        resourceId={match.params.course_id}
        userId={user._id}
        username={user.username}
        owners={course ? course.members.filter(member => member.role === 'facilitator').map(member => member.user) : []}
      />
    ) 
  }
}

const mapStateToProps = (store, ownProps) => {
  let course_id = ownProps.match.params.course_id;
  return {
    course: store.courses.byId[course_id] ?
      populateResource(store, 'courses', course_id, ['activities', 'rooms']) : // THIS IS WHAT NEEDS TO CHANGE..RASTHER THAN POPULATING RESOURE WE JUST POINT TO THE STORE BECAUSE WE ALREADY HAVE THOSE RESOURCES AT OUR DISPOSAL
      null,
    activities: store.activities.allIds,
    rooms: store.rooms.allIds,
    user: store.user,
    accessNotifications: store.user.courseNotifications.access,
    loading: store.loading.loading,
  }
}


export default connect(mapStateToProps, {
  getActivities, 
  getRooms, 
  updateCourseRooms, 
  updateCourseActivities, 
  clearNotification,
  getCourse,
  getUser,
})(Course);
