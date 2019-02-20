import React, { Component } from "react";
// import PropTypes from 'prop-types';
import { connect } from "react-redux";
import {
  DashboardLayout,
  SidePanel,
  ActivityDetails,
  ResourceList
} from "../Layout/Dashboard/";
import {
  Aux,
  // Modal,
  Button,
  BreadCrumbs,
  TabList,
  EditText,
  TrashModal,
  Error
} from "../Components";
import {
  getCourses,
  getRooms,
  updateActivity,
  getActivities
} from "../store/actions";
import { populateResource } from "../store/reducers";
class Activity extends Component {
  state = {
    owner: false,
    tabs: [{ name: "Details" }, { name: "Rooms" }, { name: "Settings" }],
    // assigning: false, // this seems to be duplicated in Layout/Dashboard/MakeRooms.js
    editing: false,
    name: this.props.activity.name,
    description: this.props.activity.description,
    instructions: this.props.activity.instructions,
    privacySetting: this.props.activity.privacySetting
  };

  componentDidMount() {
    // this.props.getActivities() // WHY ARE WE DOING THIS??
    const { resource } = this.props.match.params;
    if (resource === "rooms") {
      // this.fetchRooms();
    }
    // Check ability to edit
    if (this.props.activity.creator === this.props.user._id) {
      this.setState({ owner: true });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.props.activity) {
      return;
    }
    const prevResource = prevProps.match.params.resource;
    const { resource } = this.props.match.params;
    if (prevResource !== resource && resource === "rooms") {
      // this.fetchRooms()
    }
    if (
      prevProps.loading.updateResource === null &&
      this.props.loading.updateResource === "activity"
    ) {
      this.setState({
        name: this.props.activity.name,
        description: this.props.activity.description,
        privacySetting: this.props.activity.privacySetting,
        instructions: this.props.activity.instructions
      });
    }
  }

  // fetchRooms() {
  //   const { activity, populatedActivity } = this.props;
  //   if (activity.rooms.length !== populatedActivity.rooms.length) {
  //     this.props.getRooms(activity.rooms)
  //   }
  // }

  toggleEdit = () => {
    this.setState(prevState => ({
      editing: !prevState.editing,
      name: this.props.activity.name,
      description: this.props.activity.description,
      privacySetting: this.props.activity.privacySetting,
      instructions: this.props.activity.instructions
    }));
  };
  // options is for radioButton/checkbox inputs
  updateActivityInfo = (event, option) => {
    let { value, name } = event.target;
    this.setState({ [name]: option || value });
  };

  updateActivity = () => {
    let { updateActivity, activity } = this.props;
    let {
      name,
      instructions,
      details,
      privacySetting,
      description
    } = this.state;
    let body = { name, details, instructions, privacySetting, description };
    Object.keys(body).forEach(key => {
      if (body[key] === activity[key]) {
        delete body[key];
      }
    });
    updateActivity(activity._id, body);
    this.setState({
      editing: false
    });
  };

  trashActivity = () => {
    this.setState({ trashing: true });
  };

  render() {
    let { activity, course, match, user, loading } = this.props;
    let { updateFail, updateKeys } = this.props;
    if (activity) {
      let { resource } = match.params;
      let additionalDetails = {
        type: activity.roomType,
        privacy: (
          <Error
            error={updateFail && updateKeys.indexOf("privacySetting") > -1}
          >
            <EditText
              change={this.updateActivityInfo}
              inputType="radio"
              editing={this.state.editing}
              options={["public", "private"]}
              name="privacySetting"
            >
              {this.state.privacySetting}
            </EditText>
          </Error>
        )
      };

      const crumbs = [{ title: "My VMT", link: "/myVMT/courses" }];
      if (course) {
        crumbs.push(
          {
            title: `${course.name}`,
            link: `${crumbs[0].link}/${course._id}/activities`
          },
          {
            title: `${activity.name}`,
            link: `${crumbs[0].link}/${course._id}/activities/${
              activity._id
            }/details`
          }
        );
      } else {
        crumbs.push({
          title: `${activity.name}`,
          link: `/myVMT/activities/${activity._id}/details`
        });
      }

      let mainContent = (
        <ActivityDetails
          activity={this.props.activity}
          update={this.updateActivityInfo}
          instructions={this.state.instructions}
          editing={this.state.editing}
          owner={this.state.owner}
          toggleEdit={this.toggleEdit}
          userId={this.props.user._id}
          course={this.props.course}
          loading={loading}
        />
      );

      if (resource === "rooms") {
        mainContent = (
          <ResourceList
            userResources={activity.rooms.map(
              roomId => this.props.rooms[roomId]
            )}
            notifications={[]}
            user={user}
            resource={resource}
            parentResource={course ? "course" : "activity"}
            parentResourceId={course ? course._id : activity._id}
          />
        );
      }

      return (
        <Aux>
          <DashboardLayout
            breadCrumbs={
              <BreadCrumbs crumbs={crumbs} notifications={user.notifications} />
            }
            sidePanel={
              <SidePanel
                image={activity.image}
                editing={this.state.editing}
                name={
                  <Error error={updateFail && updateKeys.indexOf("name")}>
                    <EditText
                      change={this.updateActivityInfo}
                      inputType="title"
                      name="name"
                      editing={this.state.editing}
                    >
                      {this.state.name}
                    </EditText>
                  </Error>
                }
                subTitle={
                  <Error
                    error={updateFail && updateKeys.indexOf("description")}
                  >
                    <EditText
                      change={this.updateActivityInfo}
                      inputType="text"
                      name="description"
                      editing={this.state.editing}
                    >
                      {this.state.description}
                    </EditText>
                  </Error>
                }
                owner={this.state.owner}
                additionalDetails={additionalDetails}
                editButton={
                  this.state.owner ? (
                    <Aux>
                      <div
                        role="button"
                        style={{
                          display: this.state.editing ? "none" : "block"
                        }}
                        data-testid="edit-activity"
                        onClick={this.toggleEdit}
                      >
                        Edit Activity <i className="fas fa-edit" />
                      </div>
                      {this.state.editing ? (
                        // @TODO this should be a resuable component
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-around"
                          }}
                        >
                          <Button
                            click={this.updateActivity}
                            data-testid="save-activity"
                            theme="Small"
                          >
                            Save
                          </Button>
                          <Button
                            click={this.trashActivity}
                            data-testid="trash-activity"
                            theme="Danger"
                          >
                            <i className="fas fa-trash-alt" />
                          </Button>
                          <Button click={this.toggleEdit} theme="Cancel">
                            Cancel
                          </Button>
                        </div>
                      ) : null}
                    </Aux>
                  ) : null
                }
              />
            }
            mainContent={mainContent}
            tabs={
              <TabList routingInfo={this.props.match} tabs={this.state.tabs} />
            }
          />
          {this.state.trashing ? (
            <TrashModal
              resource="activity"
              resourceId={activity._id}
              update={this.props.updateActivity}
              show={this.state.trashing}
              closeModal={() => {
                this.setState({ trashing: false });
              }}
              history={this.props.history}
            />
          ) : null}
        </Aux>
      );
    } else return null;
  }
}

const mapStateToProps = (state, ownProps) => {
  const { activity_id, course_id } = ownProps.match.params;
  return {
    activity: state.activities.byId[activity_id],
    populatedActivity: state.activities.byId[activity_id]
      ? populateResource(state, "activities", activity_id, ["rooms"])
      : {},
    course: state.courses.byId[course_id],
    rooms: state.rooms.byId,
    userId: state.user._id,
    user: state.user,
    loading: state.loading
  };
};

export default connect(
  mapStateToProps,
  { getCourses, getRooms, updateActivity, getActivities }
)(Activity);
