import React, { Component } from 'react';
import { connect } from 'react-redux';
import difference from 'lodash/difference';
import { populateResource } from '../store/reducers';
import { 
  getActivities,
  getRooms, 
  updateCourseRooms, 
  updateCourseActivities, 
  clearNotification, 
} from '../store/actions';
import DashboardLayout from '../Layout/Dashboard/Dashboard';
import Aux from '../Components/HOC/Auxil';
import Modal from '../Components/UI/Modal/Modal';
import Access from './Access';
import PublicAccessModal from '../Components/UI/Modal/PublicAccess';
import Button from '../Components/UI/Button/Button';

class Course extends Component {
  state = {
    owner: false,
    member: false,
    guestMode: false,
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
    const { course, user, accessNotifications, clearNotification } = this.props;
    let firstView = false;
    if (accessNotifications.length > 0) {
     accessNotifications.forEach(ntf => {
        if (ntf.notificationType === 'grantedAccess' && ntf._id === course._id) {
          // RESOLVE THIS NOTIFICATION
          firstView = true;
          clearNotification(course._id, user._id, 'course', 'access') //CONSIDER DOING THIS AND MATCHING ONE IN ROOM.js IN REDUX ACTION
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
      updatedTabs = this.displayNotifications(updatedTabs);
    }
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
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.course.members.length !== this.props.course.members.length) {
      this.checkAccess();
    }
    if (prevProps.accessNotifications.length !== this.props.accessNotifications.length) {
      let updatedTabs = this.displayNotifications([...this.state.tabs])
      this.setState({tabs: updatedTabs})
    }
    if ((this.state.member || this.state.owner) && !this.props.loading) {
      this.checkForFetch();
    }
  }

  requestAccess = () => {
    const {course, user} = this.props;
    // HEY? WHY DO WE NEED COURSE.CREATOR RIGHT HERE
    this.props.requestAccess(course.creator, user._id, 'course', course._id)
    this.props.history.push('/confirmation')
  }

  requestPublicAccess = () => {
    this.props.grantAccess(
      {_id: this.props.user._id, username: this.props.user.username}, 'course', this.props.course._id
    )
  }

  displayNotifications = (tabs) => {

    const { user, course, accessNotifications } = this.props;
    if (course.creator === user._id) {
      tabs[2].notifications = (accessNotifications.length > 0) ? accessNotifications.length : '';
    }
    // if (accessNotifications.llength > 0){
    //   tabs[1].notifications = accessNotifications.llength;
    // }
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

  checkAccess = () => {
    this.props.course.members.forEach(member => {
       if (member.user._id === this.props.user._id) {
         this.setState({member: true})
       }
    })
  }

  render() {
    let { course, user, match, accessNotifications } = this.props;
    let resource = match.params.resource;
    let contentData = {
      resource,
      parentResource: "course",
      parentResourceId: course._id,
      userResources: course[resource] || [],
      notifications:  accessNotifications || [],
      userId: user._id, // @TODO <-- get rid of this user user object below
      user: user,
      owner: this.state.owner,
    }
    console.log(course.members)
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
        }
      },
      title: course.name,
    }
    // @TODO MAYBE MOVE THESE MODAL INSTANCES OUTTA HERE TO COMPONENTS/UI
    return (
      <Aux>
        {( this.state.owner || this.state.member || (course.isPublic && this.state.guestMode)) ?
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
              <Button click={() => this.setState({firstView: false})}>Explore</Button>
            </Modal>
          </Aux> :
          course.isPublic ? 
            <PublicAccessModal requestAccess={this.grantPublicAccess}/> : 
            <Access  
              resource='course'
              resourceId={course._id}
              userId={user._id}
              username={user.username}
              owners={course.members.filter(member => member.role === 'facilitator').map(member => member.user)}
            />
          }
      </Aux>
    )
  }
}

const mapStateToProps = (store, ownProps) => {
  return {
    course: populateResource(store, 'courses', ownProps.match.params.course_id, ['activities', 'rooms']),
    activities: store.activities.allIds,
    rooms: store.rooms.allIds,
    user: store.user,
    accessNotifications: store.user.courseNotifications.access,
    loading: store.loading.loading,
  }
}


export default connect(mapStateToProps, {getActivities, getRooms, updateCourseRooms, updateCourseActivities, clearNotification,})(Course);
