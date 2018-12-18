import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DashboardLayout, SidePanel, ActivityDetails, ResourceList } from '../Layout/Dashboard/';
import {
  Aux,
  Modal,
  Button,
  BreadCrumbs,
  TabList,
  EditText,
} from '../Components';
import { getCourses, getRooms, updateActivity, getActivities } from '../store/actions';
import { populateResource } from '../store/reducers';
class Activity extends Component {
  state = {
    owner: false,
    tabs: [
      {name: 'Details'},
      {name: 'Rooms'},
      {name: 'Settings'},
    ],
    // assigning: false, // this seems to be duplicated in Layout/Dashboard/MakeRooms.js
    editing: false,
    name: this.props.activity.name,
    description: this.props.activity.description,
    instructions: this.props.activity.instructions,
    privacySetting: this.props.activity.privacySetting,
  }

  componentDidMount() {
    this.props.getActivities() // WHY ARE WE DOING THIS??
    const { resource } = this.props.match.params;
    if (resource === 'rooms') {
      this.fetchRooms();
    }
    // Check ability to edit
    if (this.props.activity.creator === this.props.user._id) {
      this.setState({owner: true})
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const prevResource = prevProps.match.params.resource;
    const { resource } = this.props.match.params;
    if (prevResource !== resource && resource === 'rooms') {
      this.fetchRooms()
    }
  }

  fetchRooms() {
    const { activity, populatedActivity } = this.props;
    if (activity.rooms.length !== populatedActivity.rooms.length) {
      this.props.getRooms(activity.rooms)
    }
  }

  toggleEdit = () => {
    this.setState(prevState => ({
      editing: !prevState.editing,
      name: this.props.activity.name,
      privacySetting: this.props.activity.privacySetting,
      instrucitons: this.props.activity.instructions,
    }))
  }
  // options is for radioButton/checkbox inputs
  updateActivityInfo = (event, option) => {
    let { value, name } = event.target;
    this.setState({[name]: option || value})
  }

  updateActivity= () => {
    let { updateActivity, activity, } = this.props;
    let { name, instructions, details, privacySetting, } = this.state
    let body = {name, details, instructions, privacySetting}
    updateActivity(activity._id, body)
    this.setState({
      editing: false,
    })
  }

  render() {
    let { activity, course, match, user } = this.props;
    let { resource }= match.params;
    let populatedActivity = this.props.populatedActivity;
    const contentData = {
      resource,
      activity,
      course,
      userResources: activity[resource] || [],
      parentResource: 'activities',
      parentResourceId: activity._id,
      notifications: [],
      user: this.props.user,
      owner: this.state.owner
    }

    let additionalDetails = {
      type: activity.roomType,
      privacy: <EditText change={this.updateActivityInfo} inputType='radio' editing={this.state.editing} options={['private', 'public']} name="privacySetting">{activity.privacySetting}</EditText>
    }

    const crumbs = [{title: 'My VMT', link: '/myVMT/courses'}]
    if (course) {
      crumbs.push(
        {title: `${course.name}`, link: `${crumbs[0].link}/${course._id}/activities`},
        {title: `${activity.name}`, link: `${crumbs[0].link}/${course._id}/activities/${activity._id}/details`},
      )
    } else {
      crumbs.push({title: `${activity.name}`, link: `/myVMT/activities/${activity._id}/details`})
    }

    let mainContent = <ActivityDetails
      activity={this.props.activity}
      update={this.updateActivityInfo}
      instructions={this.state.instructions}
      editing={this.state.editing}
      owner={this.state.owner}
      toggleEdit={this.toggleEdit}
      userId={this.props.user._id}
      course={this.props.course}
    />

    if (resource === 'rooms' ) {
      mainContent = <ResourceList
      userResources={activity.rooms.map(roomId => this.props.rooms[roomId])}
      notifications={[]}
      user={user}
      resource={resource}
      parentResource={course ? "course" : "activity"}
      parentResourceId={course ? course._id : activity._id}
    />
    }


    return (
      <DashboardLayout
        breadCrumbs={
          <BreadCrumbs crumbs={crumbs} />
        }
        sidePanel={
          <SidePanel
            image={activity.image}
            name={<EditText change={this.updateActivityInfo} inputType='title' name='name' editing={this.state.editing}>{this.state.name}</EditText>}
            subTitle={<EditText change={this.updateActivityInfo} inputType='text' name='description' editing={this.state.editing}>{this.state.description}</EditText>}
            owner={this.state.owner}
            additionalDetails={additionalDetails}
            editButton={ this.state.owner 
              ? <Aux>
                  <div role='button' style={{display: this.state.editing ? 'none' : 'block'}}  onClick={this.toggleEdit}>Edit Activity <i className="fas fa-edit"></i></div>
                  {this.state.editing
                    ? <div>
                      <Button click={this.updateActivity} theme='edit-save'>Save</Button>
                      <Button click={this.toggleEdit} theme='edit'>Cancel</Button>
                    </div>
                    : null
                  }
                </Aux>
              : null
            }
          />
        }
        mainContent={mainContent}
        tabs={<TabList routingInfo={this.props.match} tabs={this.state.tabs} />}
      />
    )
  }
}

const mapStateToProps = (store, ownProps ) => {
  const { activity_id, course_id } = ownProps.match.params;
  return {
    activity: store.activities.byId[activity_id],
    populatedActivity: populateResource(store, 'activities', activity_id, ['rooms']),
    course: store.courses.byId[course_id],
    rooms: store.rooms.byId,
    userId: store.user._id,
    user: store.user,
  }
}


export default connect(mapStateToProps, { getCourses, getRooms, updateActivity, getActivities })(Activity);
