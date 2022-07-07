// THIS DOESN"T FEEL LIKE ITS IN A VERY LOGICAL PLACE IN THE FILE STRUCUTRE

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import Select from 'react-select';
import { Aux, Button, EditText, Error } from '../../../Components';
import MakeRooms from '../../../Containers/Create/MakeRooms/MakeRooms';
import NewMakeRooms from 'Containers/Create/MakeRooms/NewMakeRooms';
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
      inEditMode: false,
      previousAssignments:
        props.course && props.course.groupings
          ? createPreviousAssignments(props.course.groupings, props.rooms)
          : [],
      selectedAssignment: null,
      editableRoomAssignOptions: [], // prevAssignemnts w/current activity._id
      newAssignmentsValue: constants.defaultNewAssignmentsValue,
      editAssignmentsValue: constants.defaultEditAssignmentsValue,
    };
  }

  componentDidMount() {
    const { previousAssignments } = this.state;
    const { activity } = this.props;

    // create editableRoomAssignOptions based on previousAssignments
    const editableRoomAssignOptions = previousAssignments.filter(
      (assignment) => activity._id === assignment.roomDrafts[0].activity
    );

    const createNew = { name: 'Create New Grouping', roomDrafts: [] };
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
    } = this.props;
    const {
      assigning,
      inEditMode,
      previousAssignments,
      selectedAssignment,
      editableRoomAssignOptions,
      newAssignmentsValue,
      editAssignmentsValue,
    } = this.state;

    return (
      <Aux>
        <div>
          {/* <div className={classes.Instructions}>
              <p className={classes.InstructionsHeader}>Instructions:</p>
              <Error
                error={
                  loading.updateFail &&
                  loading.updateKeys.indexOf('instructions') > -1
                }
              >
                <EditText
                  inputType="text-area"
                  name="instructions"
                  change={update}
                  editing={editing}
                >
                  {instructions}
                </EditText>
              </Error>
            </div> */}
          {/* <div> */}
          {/* <Button m={5} click={this.viewActivity} data-testid="view-activity">
              Enter
            </Button>
            <Button
              m={5}
              click={() => {
                this.setState({
                  assigning: true,
                  selectedAssignment: null,
                  inEditMode: false,
                });
              }}
              data-testid="assign"
            >
              Assign Template
            </Button> */}

          <div className={classes.AssignContainer}>
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
                  aliasMode: assignment.aliasMode,
                  dueDate: assignment.dueDate,
                  label: assignment.name,
                  value: assignment.roomDrafts,
                }))}
                onChange={(selectedOption) => {
                  this.setState({
                    assigning: true,
                    inEditMode: false,
                    selectedAssignment: selectedOption,
                    newAssignmentsValue: {
                      ...selectedOption,
                    },
                    editAssignmentsValue: constants.defaultEditAssignmentsValue,
                  });
                }}
                value={newAssignmentsValue}
              />
            </div>

            {editableRoomAssignOptions && editableRoomAssignOptions.length ? (
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
                    aliasMode: assignment.aliasMode,
                    dueDate: assignment.dueDate,
                    label: assignment.name,
                    value: assignment.roomDrafts,
                  }))}
                  onChange={(selectedOption) => {
                    this.setState({
                      assigning: true,
                      inEditMode: true,
                      selectedAssignment: selectedOption,
                      editAssignmentsValue: { ...selectedOption },
                      newAssignmentsValue: constants.defaultNewAssignmentsValue,
                    });
                  }}
                />
              </div>
            ) : null}
          </div>

          {/* </div> */}
        </div>

        {/* standalone template --> open this to allow member assignment */}
        {assigning && !course && !inEditMode ? (
          <MakeRooms
            activity={activity}
            course={course ? course : null}
            userId={userId}
            close={this.close}
            participants={course ? course.members : []}
            rooms={rooms}
          />
        ) : null}

        {assigning && course && !inEditMode ? (
          <NewMakeRooms
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
};

ActivityDetails.defaultProps = {
  instructions: null,
  editing: false,
  course: null,
  loading: false,
};

export default withRouter(ActivityDetails);
