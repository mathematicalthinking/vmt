// THIS DOESN"T FEEL LIKE ITS IN A VERY LOGICAL PLACE IN THE FILE STRUCUTRE

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import Select from 'react-select';
import { Aux, Button, EditText, Error } from '../../../Components';
import MakeRooms from '../../../Containers/Create/MakeRooms/MakeRooms';
import EditRooms from 'Containers/Create/MakeRooms/EditRooms';
import { createPreviousAssignments } from 'utils/groupings';
import classes from './activityDetails.css';

class ActivityDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      assigning: false,
      inEditMode: false,
      previousAssignments: createPreviousAssignments(
        props.course.groupings,
        props.rooms
      ),
      selectedAssignment: null,
      editableRoomAssignOptions: [], // prevAssignemnts w/current activity._id
    };
  }

  componentDidMount() {
    const { previousAssignments } = this.state;
    const { activity } = this.props;

    // create editableRoomAssignOptions based on previousAssignments
    const editableRoomAssignOptions = previousAssignments.filter(
      (assignment) => activity._id === assignment.roomDrafts[0].activity
    );

    const createNew = { name: 'Assign Rooms From Scratch', value: null };
    previousAssignments.unshift(createNew);

    this.setState({ editableRoomAssignOptions, previousAssignments });
  }

  viewActivity = () => {
    const { history, activity } = this.props;
    history.push(`/myVMT/workspace/${activity._id}/activity`);
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
              <span className={classes.AssignText}>New:</span>
              <Select
                className={classes.Select}
                placeholder={
                  previousAssignments.length > 1
                    ? 'Create New Or Use Existing'
                    : 'Create New'
                }
                value={{
                  label:
                    previousAssignments.length > 1
                      ? 'Create New Or Use Existing'
                      : 'Create New',
                  value: null,
                }}

                isSearchable={false}
                options={previousAssignments.map((assignment) => ({
                  label: assignment.name,
                  value: assignment.roomDrafts,
                }))}
                onChange={(selectedOption) => {
                  this.setState({
                    assigning: true,
                    inEditMode: false,
                    selectedAssignment: selectedOption,
                  });
                }}
              />
            </div>

            {editableRoomAssignOptions && editableRoomAssignOptions.length ? (
              <div className={classes.EditAssignmentsContainer}>
                <span className={classes.AssignText}>Edit:</span>
                <Select
                  className={classes.Select}
                  placeholder="Edit Existing Room Assignments"
                  value={{label: "Edit Existing Room Assignments", value: null}}
                  isSearchable={false}
                  options={editableRoomAssignOptions.map((assignment) => ({
                    label: assignment.name,
                    value: assignment.roomDrafts,
                  }))}
                  onChange={(selectedOption) => {
                    this.setState({
                      assigning: true,
                      inEditMode: true,
                      selectedAssignment: selectedOption,
                    });
                  }}
                />
              </div>
            ) : null}
          </div>

          {/* </div> */}
        </div>

        {assigning && !inEditMode ? (
          <MakeRooms
            activity={activity}
            course={course ? course : null}
            userId={userId}
            close={() => {
              this.setState({ assigning: false });
            }}
            participants={course ? course.members : []}
            rooms={rooms}
          />
        ) : null}

        {assigning && inEditMode ? (
          <EditRooms
            activity={activity}
            selectedAssignment={selectedAssignment}
            userId={userId}
            close={() => {
              this.setState({ assigning: false });
            }}
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
