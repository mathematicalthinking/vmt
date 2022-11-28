// THIS DOESN"T FEEL LIKE ITS IN A VERY LOGICAL PLACE IN THE FILE STRUCUTRE

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import Select from 'react-select';
import { Aux, Error } from '../../../Components';
import MakeRooms from 'Containers/Create/MakeRooms/MakeRooms';
import EditRooms from 'Containers/Create/MakeRooms/EditRooms';
import { createPreviousAssignments } from 'utils/groupings';
import classes from './activityDetails.css';

const constants = {
  defaultNewAssignmentsValue: {
    label: 'Make or Reuse Groupings',
    value: [],
  },
  defaultEditAssignmentsValue: {
    label: 'Change Room Assignments',
    value: [],
  },
};

class ActivityDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      assigning: false,
      previousAssignments: // get from course or activity, default to []
        props.course && props.course.groupings
          ? createPreviousAssignments(props.course.groupings, props.rooms)
          : props.activity && props.activity.groupings
          ? createPreviousAssignments(props.activity.groupings, props.rooms)
          : [],
      selectedAssignment: null,
      editableRoomAssignOptions: [], // prevAssignemnts w/current activity._id
      newAssignmentsValue: constants.defaultNewAssignmentsValue,
      editAssignmentsValue: constants.defaultEditAssignmentsValue,
      showCreateSelect: true,
      showEditSelect: true,
    };
  }

  componentDidMount() {
    const { previousAssignments } = this.state;
    const { activity } = this.props;

    // create editableRoomAssignOptions based on previousAssignments
    const editableRoomAssignOptions = previousAssignments.filter(
      (assignment) => activity._id === assignment.roomDrafts[0].activity
    );

    const createNew = { name: 'New Grouping', roomDrafts: [] };
    previousAssignments.unshift(createNew);
    this.setState({ editableRoomAssignOptions, previousAssignments });
  }

  viewActivity = () => {
    const { history, activity } = this.props;
    history.push(`/myVMT/workspace/${activity._id}/activity`);
  };

  close = () => {
    this.setState({
      assigning: false,
      newAssignmentsValue: constants.defaultNewAssignmentsValue,
      editAssignmentsValue: constants.defaultEditAssignmentsValue,
      showCreateSelect: true,
      showEditSelect: true,
    });
  };

  render() {
    const {
      activity,
      course,
      loading,
      instructions,
      update,
      editing,
      userId,
      rooms,
      user,
      inEditMode,
    } = this.props;
    const {
      assigning,
      previousAssignments,
      selectedAssignment,
      editableRoomAssignOptions,
      newAssignmentsValue,
      editAssignmentsValue,
      showCreateSelect,
      showEditSelect,
    } = this.state;

    return (
      <Aux>
        <div>
          <div className={classes.AssignContainer}>
            {!inEditMode && showCreateSelect && (
              <div className={classes.NewAssignmentsContainer}>
                <label
                  className={classes.AssignText}
                  htmlFor="NewAssignmentsContainer"
                >
                  Create:
                </label>
                <Select
                  inputId="NewAssignmentsContainer"
                  className={classes.Select}
                  isSearchable={false}
                  options={previousAssignments.map((assignment) => ({
                    _id: assignment._id,
                    aliasMode: assignment.aliasMode,
                    dueDate: assignment.dueDate,
                    label: assignment.name,
                    value: assignment.roomDrafts,
                  }))}
                  onChange={(selectedOption) => {
                    this.setState({
                      assigning: true,
                      selectedAssignment: selectedOption,
                      newAssignmentsValue: {
                        ...selectedOption,
                      },
                      editAssignmentsValue:
                        constants.defaultEditAssignmentsValue,
                      showEditSelect: false,
                    });
                  }}
                  value={newAssignmentsValue}
                />
                <div className={classes.Instructions}>
                  <i
                    className={`far fa-question-circle fa-2x ${classes.QuestionMark}`}
                  />
                  <div className={classes.TooltipContent}>
                    <p>
                      "Make or Reuse Groupings" allows you to assign members to
                      rooms. "Alias Usernames" will randomize usernames for
                      members when they are in a room. "Change Room Assignments"
                      allows you to change which member is in which room as well
                      as editing the room name, due date, and whether to display
                      the member's usernames as aliases.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {inEditMode &&
            editableRoomAssignOptions &&
            editableRoomAssignOptions.length &&
            showEditSelect ? (
              <div className={classes.EditAssignmentsContainer}>
                <label
                  className={classes.AssignText}
                  htmlFor="EditAssignmentsContainer"
                >
                  Edit:
                </label>
                <Select
                  inputId="EditAssignmentsContainer"
                  className={classes.Select}
                  value={editAssignmentsValue}
                  isSearchable={false}
                  options={editableRoomAssignOptions.map((assignment) => ({
                    _id: assignment._id,
                    aliasMode: assignment.aliasMode,
                    dueDate: assignment.dueDate,
                    label: assignment.name,
                    value: assignment.roomDrafts,
                  }))}
                  onChange={(selectedOption) => {
                    this.setState({
                      assigning: true,
                      selectedAssignment: selectedOption,
                      editAssignmentsValue: { ...selectedOption },
                      newAssignmentsValue: constants.defaultNewAssignmentsValue,
                      showCreateSelect: false,
                    });
                  }}
                />
                <div className={classes.Instructions}>
                  <i
                    className={`far fa-question-circle fa-2x ${classes.QuestionMark}`}
                  />
                  <div className={classes.TooltipContent}>
                    <p>
                      "Make or Reuse Groupings" allows you to assign members to
                      rooms. "Alias Usernames" will randomize usernames for
                      members when they are in a room. "Change Room Assignments"
                      allows you to change which member is in which room as well
                      as editing the room name, due date, and whether to display
                      the member's usernames as aliases.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* </div> */}
        </div>

        {/* standalone template */}
        {assigning && !course && !inEditMode ? (
          <MakeRooms
            activity={activity}
            course={course ? course : null}
            userId={userId}
            close={this.close}
            participants={course ? course.members : [user]}
            rooms={rooms}
          />
        ) : null}

        {assigning && course && !inEditMode ? (
          <MakeRooms
            activity={activity}
            course={course ? course : null}
            userId={userId}
            close={this.close}
            participants={course ? course.members : []}
            rooms={rooms}
            selectedAssignment={selectedAssignment}
          />
        ) : null}

        {assigning && inEditMode ? (
          <EditRooms
            activity={activity}
            selectedAssignment={selectedAssignment}
            userId={userId}
            close={this.close}
            course={course ? course : null}
          />
        ) : null}
      </Aux>
    );
  }
}

ActivityDetails.propTypes = {
  activity: PropTypes.shape({}).isRequired,
  history: PropTypes.shape({}).isRequired,
  userId: PropTypes.string.isRequired,
  instructions: PropTypes.string,
  editing: PropTypes.bool,
  update: PropTypes.func.isRequired,
  course: PropTypes.shape({}),
  loading: PropTypes.bool,
  rooms: PropTypes.shape({}).isRequired,
  user: PropTypes.shape({}).isRequired,
  inEditMode: PropTypes.bool,
};

ActivityDetails.defaultProps = {
  instructions: null,
  editing: false,
  course: null,
  loading: false,
  inEditMode: false,
};

export default withRouter(ActivityDetails);
