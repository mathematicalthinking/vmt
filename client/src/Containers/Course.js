import React, { Component } from 'react';
import { connect } from 'react-redux';
// import _difference from 'lodash/difference';
import { populateResource } from '../store/reducers';
import Members from './Members/Members';
import * as ntfUtils from '../utils/notifications';

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
  TrashModal,
  Error,
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
    privacySetting: this.props.course ? this.props.course.privacySetting: null,
    trashing: false,
  }
  initialTabs = [
    {name: 'Activities'},
    {name: 'Rooms'},
    {name: 'Members'},
  ]
  // SO we can reset the tabs easily

  componentDidMount() {
    const { course, user, notifications, match } = this.props;
    if (course) {
      // this.props.getCourse(course._id); // What information are we getting here
      // this.props.getUser(user._id);
      let firstView = false;
      if (notifications.length > 0) {
       notifications.forEach(ntf => {
          if (ntf.notificationType === 'grantedAccess' && ntf.resourceId === course._id) {
            firstView = true;
            this.props.clearNotification(ntf._id)
          }
        })
      }
      // check if we need to fetch data
      // this.checkForFetch();
      // Check user's permission level -- owner, member, or guest
      let updatedTabs = [...this.state.tabs];
      let owner = course.members.filter(member => member.role === 'facilitator' && member.user._id === user._id).length > 0;

      updatedTabs = this.displayNotifications(updatedTabs);

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
    if (!this.props.course) {
      return;
    }
    // If we've just fetched the course?
    if (!prevProps.course && this.props.course) {
      this.checkAccess();
    }

    if (prevProps.course && prevProps.course.members.length !== this.props.course.members.length) {
      this.checkAccess();
    }
    if (prevProps.notifications.length !== this.props.notifications.length) {
      // this.props.getCourse(this.props.match.params.course_id)
      let updatedTabs = this.displayNotifications([...this.state.tabs])
      this.setState({tabs: updatedTabs})
    }
    // if the course has been updated by redux
    // This will happen when an update request is unsuccessful. When a user updates the course we are changing this components state
    // and updating the UI immediately, if the request fails we need to undo that state/ui change
    if (prevProps.loading.updateResource === null && this.props.loading.updateResource === 'course') {

      this.setState({
        name: this.props.course.name,
        description: this.props.course.description,
        entryCode: this.props.course.entryCode,
        privacySetting: this.props.course.privacySetting,
      })
    }
    // if ((this.state.member || this.state.owner) && !this.props.loading) {
    //   this.checkForFetch();
    // }
    // if (prevProps.match.params.resource !== this.props.match.params.resource) {
    //   this.props.getUser(this.props.user._id)
    // }
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
    // console.log(notifications)
    const { course, notifications, user } = this.props;
    // if (course.creator === user._id
    let isOwner = course.members.filter(member => member.role === 'facilitator' && member.user._id === user._id).length > 0;
      if (isOwner) {
        let memberNtfs = notifications.filter(ntf => (ntf.resourceId === course._id && (ntf.notificationType === 'requestAccess' || ntf.notificationType === 'newMember')));
        tabs[2].notifications = memberNtfs.length > 0 ? memberNtfs.length : '';
      }
      let newRoomNtfs = notifications.filter(ntf => (ntf.parentResource === course._id && ntf.notificationType === 'assignedNewRoom'))
      tabs[1].notifications = newRoomNtfs.length > 0 ? newRoomNtfs.length : '';
    // }
    // if (notifications.llength > 0){
    //   tabs[1].notifications = notifications.llength;
    // }
    return tabs;
  }

  // checkForFetch = () => {
  //   const { course, user, match } = this.props;
  //   const resource = match.params.resource;
  //   const needToFetch = _difference(user[resource], this.props[resource]).length !== 0;
  //   if (needToFetch) {
  //     // @IDEA We could avoid this formatting if we dont use camel case like in the myVMT container
  //     let re = resource[0].toUpperCase() + resource.substr(1)
  //     this.props[`get${re}`](course[resource])
  //   }
  // }

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
      instructions: this.props.instructions,
    }))
  }

  updateCourseInfo = (event, option) => {
    let { value, name } = event.target;
    this.setState({[name]: option || value})
  }

  updateCourse = () => {
    let { updateCourse, course, } = this.props;
    let { entryCode, name, details, description, privacySetting } = this.state
    let body = { entryCode, name, details, description, privacySetting }
    // only send the fields that have changed
    Object.keys(body).forEach(key => {
      if (body[key] === course[key]) {
        delete body[key]
      }
    })
    updateCourse(course._id, body)
    this.setState({
      editing: false,
    })
  }

  clearFirstViewNtf = () => {
    this.setState({firstView: false})
    // Find the notifcation that corresponds to this course
    // let ntfId = this.props.user.notifications.filter(ntf => ntf.resourceId === this.props.match.params.course_id)
    // this.props.clearNotification(ntfId)
  }

  trashCourse = () => {
    this.setState({trashing: true})
  }

  render() {
    let { course, user, match, notifications } = this.props;
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
      //   notifications:  notifications.filter(ntf => ntf.resourceId === course._id) || [],
      //   userId: user._id, // @TODO <-- get rid of this user user object below
      //   user: user,
      //   owner: this.state.owner,
      // }

      let mainContent;
      if (resource === 'rooms' || resource === 'activities') {
        mainContent =  <ResourceList
          userResources={myRooms || course[resource] || []}
          user={user}
          resource={resource}
          notifications={notifications.filter(ntf => ntf.parentResource === course._id)}
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
          notifications={notifications.filter(ntf => ntf.resourceId === course._id) || []}
        />
      }
      // Updatekeys = the keys that we failed to update
      let { updateFail, updateKeys } = this.props.loading;

      let additionalDetails = {
        facilitators: course.members.filter(member => member.role === 'facilitator').length,
        acitivities: course.activities.length,
        rooms: course.rooms.length,
        privacy: <Error error={updateFail && updateKeys.indexOf('privacySetting') > -1}><EditText change={this.updateCourseInfo} inputType='radio' editing={this.state.editing} options={['public', 'private']} name='privacySetting'>{this.state.privacySetting}</EditText></Error>,
      }

      if (this.state.owner) {
        additionalDetails.code =  <Error error={updateFail && updateKeys.indexOf('entryCode') > -1}><EditText change={this.updateCourseInfo} inputType='text' name='entryCode' editing={this.state.editing}>{this.state.entryCode}</EditText></Error>;
      }

      // @TODO MAYBE MOVE THESE MODAL INSTANCES OUTTA HERE TO COMPONENTS/UI
      return (
        <Aux>
          <DashboardLayout
            breadCrumbs={<BreadCrumbs
              crumbs={[{title: 'My VMT', link: '/myVMT/courses'}, {title: course.name, link: `/myVMT/courses/${course._id}/activities/`}]}
              notifications={user.notifications}
            />}
            sidePanel={
              <SidePanel
                image={course.image}
                alt={this.state.name}
                name={<Error error={updateFail && updateKeys.indexOf('name') > -1}><EditText change={this.updateCourseInfo} inputType='title' name='name' editing={this.state.editing}>{this.state.name}</EditText></Error>}
                subTitle={<Error error={updateFail && updateKeys.indexOf('description') > -1}><EditText change={this.updateCourseInfo} inputType='text' name='description' editing={this.state.editing}>{this.state.description}</EditText></Error>}
                owner={this.state.owner}
                bothRoles={this.state.bothRoles}
                additionalDetails={additionalDetails}
                accountType={user.accountType}
                editButton={ this.state.owner
                  ? <Aux>
                      <div role='button' style={{display: this.state.editing ? 'none' : 'block'}} data-testid='edit-course' onClick={this.toggleEdit}><span>Edit Course <i className="fas fa-edit"></i></span></div>
                      {this.state.editing
                        ? <div>
                            <Button click={this.updateCourse} theme='edit-save'>Save</Button>
                            <Button click={this.trashCourse} data-testid='trash-course' theme='Danger'><i className="fas fa-trash-alt"></i></Button>
                            <Button click={this.toggleEdit} theme='edit'>Cancel</Button>
                          </div>
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
          <Modal show={this.state.firstView} closeModal={this.clearFirstViewNtf}>
            <p>Welcome to {course.name}. If this is your first time joining a course,
            we recommend you take a tour. Otherwise you can start exploring this course's features.</p>
            <Button theme={'Small'} click={this.clearFirstViewNtf}>Explore</Button>
          </Modal>
          {this.state.trashing
            ? <TrashModal
              resource='course'
              resourceId={course._id}
              update={this.props.updateCourse}
              show={this.state.trashing}
              closeModal={() => {this.setState({trashing: false})}}
              history={this.props.history}
              />
            : null
          }

        </Aux>
      )
    } else return (
      <Access
        resource='course'
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
    // notifications: store.user.courseNotifications.access,
    notifications: ntfUtils.getUserNotifications(store.user, null, 'course'),
    loading: store.loading,
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