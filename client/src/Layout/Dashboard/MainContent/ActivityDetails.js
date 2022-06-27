// THIS DOESN"T FEEL LIKE ITS IN A VERY LOGICAL PLACE IN THE FILE STRUCUTRE

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import Select from 'react-select';
import { Aux, Button, EditText, Error } from '../../../Components';
import MakeRooms from '../../../Containers/Create/MakeRooms/MakeRooms';
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
    };
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
    } = this.state;
    return (
      <Aux>
        <div>
          <div className={classes.Instructions}>
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
          </div>
          <div>
            <Button m={5} click={this.viewActivity} data-testid="view-activity">
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
            </Button>
            <Select
              placeholder="Edit Member Room Assignments"
              isSearchable={false}
              options={previousAssignments.map((assignment) => ({
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
        </div>
        {assigning ? (
          <MakeRooms
            activity={activity}
            course={course ? course : null}
            userId={userId}
            close={() => {
              this.setState({ assigning: false });
            }}
            participants={course ? course.members : []}
            rooms={rooms}
            inEditMode={inEditMode}
            selectedAssignment={selectedAssignment}
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
