import React, { Component } from 'react';
import { connect } from 'react-redux';
import _difference from 'lodash/difference';
import { populateResource } from '../store/reducers';
import Members from './Members/Members';
import { 
  getActivities,
  getRooms, 
  updateCourseRooms, 
  updateCourseActivities, 
  updateCourse,
  clearNotification, 
  getCourse,
  getUser,
} from '../store/actions';
import { DashboardLayout, SidePanel, ResourceList, } from '../Layout/Dashboard/';
import { 
  Aux, 
  Modal, 
  Button, 
  BreadCrumbs, 
  TabList, 
  EditText,
} from '../Components';
import Access from './Access';

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
    editing: false,
    name: this.props.course ? this.props.course.name: null,
    description: this.props.course ? this.props.course.description: null,
    entryCode: this.props.course ? this.props.course.entryCode: null,
    privacySettings: this.props.course ? this.props.course.privacySetting: null,
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
            clearNotification(course._id, user._id, null, 'course', 'access', ntf.notificationType) //CONSIDER DOING THIS AND MATCHING ONE IN ROOM.js IN REDUX ACTION
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

    const { course, accessNotifications } = this.props;
    // if (course.creator === user._id
      let memberNtfs = accessNotifications.filter(ntf => (ntf._id === course._id && (ntf.notificationType === 'requestAccess' || ntf.notificationType === 'newMember')));
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

  toggleEdit = () => {
    this.setState(prevState => ({
      editing: !prevState.editing,
      name: this.props.course.name,
      privacySetting: this.props.course.privacySetting,
      entryCode: this.props.course.entryCode,
      instrucitons: this.props.instructions,
    }))
  }

  updateCourseInfo = (event, option) => {
    let { value, name } = event.target;
    this.setState({[name]: option || value})
  }

  updateCourse = () => {
    let { updateCourse, course, } = this.props;
    let { entryCode, name, details } = this.state
    let body = { entryCode, name, details, }
    updateCourse(course._id, body)
    this.setState({
      editing: false,
    })
  }

  render() {
    let { course, user, match, accessNotifications } = this.props;
    if (course && !this.state.guestMode) {
      let resource = match.params.resource;
      let myRooms;
      if (resource === 'rooms') {
        myRooms = course.rooms.filter(room => {
          let included = false
          room.members.forEach(member => {
            if (member.user._id === user._id) 
            included = true;
          })
          return included;
        })
      }
      // let contentData = {
      //   resource,
      //   parentResource: "courses",
      //   parentResourceId: course._id,
      //   userResources: ,
      //   notifications:  accessNotifications.filter(ntf => ntf._id === course._id) || [],
      //   userId: user._id, // @TODO <-- get rid of this user user object below
      //   user: user,
      //   owner: this.state.owner,
      // }

      let mainContent;
      if (resource === 'rooms' || resource === 'activities') {
        mainContent =  <ResourceList 
          userResources={myRooms || course[resource] || []} 
          notifications={accessNotifications.filter(ntf => ntf._id === course._id) || []}
          user={user}
          resource={resource}
          parentResource="courses"
          parentResourceId={course._id}
        />
      }
      else if (resource === 'members') {
        mainContent = <Members 
          user={user} 
          classList={course.members}
          owner={this.state.owner} 
          resourceType={'course'}
          resourceId={course._id} 
          notifications={accessNotifications.filter(ntf => ntf._id === course._id) || []}
        />
      }


      let additionalDetails = {
        facilitators: course.members.filter(member => member.role === 'facilitator').length,
        acitivities: course.activities.length,
        rooms: course.rooms.length,
        privacy: <EditText change={this.updateCourseInfo} inputType='radio' editing={this.state.editing} options={['public', 'private']} name='privacySetting'>{this.state.privacySetting}</EditText>,
      }

      if (this.state.owner) {
        additionalDetails.code = <EditText change={this.updateCourseInfo} inputType='text' name='entryCode' editing={this.state.editing}>{this.state.entryCode}</EditText>;
      }
      console.log(user.accountType)

      // @TODO MAYBE MOVE THESE MODAL INSTANCES OUTTA HERE TO COMPONENTS/UI
      return (
        <Aux>
          <DashboardLayout
            breadCrumbs={<BreadCrumbs crumbs={[{title: 'My VMT', link: '/myVMT/courses'}, {title: course.name, link: `/myVMT/courses/${course._id}/activities/`}]}/>}
            sidePanel={
              <SidePanel 
                image={course.image}
                alt={this.state.name}
                name={<EditText change={this.updateCourseInfo} inputType='title' name='name' editing={this.state.editing}>{this.state.name}</EditText>} 
                subTitle={<EditText change={this.updateCourseInfo} inputType='text' name='description' editing={this.state.editing}>{this.state.description}</EditText>} 
                owner={this.state.owner}
                bothRoles={this.state.bothRoles}
                additionalDetails={additionalDetails}
                accountType={user.accountType}
                editButton={ this.state.owner 
                  ? <Aux>
                      <div role='button' style={{color: this.state.editing ? 'blue' : 'gray'}} onClick={this.toggleEdit}>Edit Course <i className="fas fa-edit"></i></div>
                      {this.state.editing 
                        ? <div><Button click={this.updateCourse} theme='xs'>Save</Button> <Button click={this.toggleEdit} theme='xs'>Cancel</Button></div>
                        : null
                      }
                    </Aux>
                  : null
                }
              />
            }
            tabs={<TabList routingInfo={this.props.match} tabs={this.state.tabs} />}
            mainContent={mainContent}

            // routingInfo={this.props.match}
            // 
            // contentData={contentData}
            // tabs={this.state.tabs}
            // sidePanelData={sidePanelData}
            // // user={user}
            // accountType={user.accountType}
            // bothRoles={this.state.bothRoles}
            // view={'facilitator'}
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
      populateResource(store, 'courses', course_id, ['activities', 'rooms']) :
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
  updateCourse,
  getCourse,
  getUser,
})(Course);
