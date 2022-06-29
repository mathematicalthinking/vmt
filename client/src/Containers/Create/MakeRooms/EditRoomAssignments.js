import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { TextInput, Button } from 'Components';
import classes from './makeRooms.css';

class EditRoomAssignments extends Component {
  constructor(props) {
    super(props);
    const { roomName } = this.props;
    this.state = {
      defaultRoomName: roomName,
      selectName: 'Previous Assignments',
      confirmButtonName: props.inEditMode ? 'Confirm Edit' : 'Assign',
    };
  }

  componentDidMount() {
    // const { selectedAssignment, select } = this.props;
    // if (selectedAssignment) {
    //   this.handleSelectChange(selectedAssignment);
    // }
  }

  render() {
    const {
      assignmentMatrix,
      error,
      roomName,
      setNumber,
      setRoomName,
      submit,
      close
    } = this.props;

    const { defaultRoomName, selectName, confirmButtonName } = this.state;

    // show revert button if roomName differs from defaultRoomName
    // if the names differ, show the button
    const showRevertButton = defaultRoomName !== roomName;

    const date = assignmentMatrix.dueDate
      ? new Date(assignmentMatrix.dueDate)
      : new Date();
    const dateStamp = `${date.getMonth() + 1}-${date.getDate()}`;

    const restoreNameClick = () => {
      setRoomName(defaultRoomName);
    };

    const restoreNameKeyDown = (event) => {
      event.preventDefault();
      // 13 === "Enter" || 32 === "Space"
      if (event.keyCode === 13 || event.keyCode === 32) {
        setRoomName(defaultRoomName);
      }
    };

    const resetAssignmentSelection = () => {
      this.setState({ selectName: 'Previous Assignments' });
    };

    const handleParticipantsPerRoomChange = (event) => {
      const numberOfParticipants = parseInt(event.target.value.trim(), 10);
      setNumber(numberOfParticipants);
      resetAssignmentSelection();
    };

    const handleShuffleClick = () => {
      const { shuffleParticipants } = this.props;
      resetAssignmentSelection();
      shuffleParticipants();
    };

    return (
      <div className={classes.Container}>
        <h2 className={classes.Title}>Edit Members Per Room</h2>
 
        {assignmentMatrix}
        <div className={classes.Button}>
          <Button
            m={5}
            click={close}
            data-testid="assign-rooms"
            disabled={roomName === ''}
          >
            Cancel
          </Button>
          <Button
            m={5}
            click={submit}
            data-testid="assign-rooms"
            disabled={roomName === ''}
          >
            Confirm Edit
          </Button>
        </div>
      </div>
    );
  }
}

EditRoomAssignments.propTypes = {
  activity: PropTypes.shape({}).isRequired,
  assignmentMatrix: PropTypes.element.isRequired,
  error: PropTypes.string,
  roomNum: PropTypes.number,
//   roomName: PropTypes.string.isRequired,
//   setNumber: PropTypes.func.isRequired,
//   setRoomName: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  previousAssignments: PropTypes.array,
  selectedAssignment: PropTypes.shape({}).isRequired,
};

EditRoomAssignments.defaultProps = {
  error: null,
  isRandom: false,
  roomNum: 1,
  previousAssignments: [],
};

export default EditRoomAssignments;
