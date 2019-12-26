// THIS DOESN"T FEEL LIKE ITS IN A VERY LOGICAL PLACE IN THE FILE STRUCUTRE

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Aux, Button, EditText, Error } from '../../../Components';
import MakeRooms from '../../../Containers/Create/MakeRooms/MakeRooms';
import classes from './activityDetails.css';

class ActivityDetails extends Component {
  state = {
    assigning: false,
  };

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
    } = this.props;
    const { assigning } = this.state;
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
                this.setState({ assigning: true });
              }}
              data-testid="assign"
            >
              Assign Activity
            </Button>
          </div>
        </div>
        {assigning ? (
          <MakeRooms
            activity={activity}
            course={course ? course._id : null}
            userId={userId}
            close={() => {
              this.setState({ assigning: false });
            }}
            participants={
              course
                ? course.members.filter(
                    (member) => member.role === 'participant'
                  )
                : []
            }
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
};

ActivityDetails.defaultProps = {
  instructions: null,
  editing: false,
  course: null,
  loading: false,
};

export default withRouter(ActivityDetails);
