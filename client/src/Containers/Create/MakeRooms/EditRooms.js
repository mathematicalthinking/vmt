import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { updateRoomMembers } from 'store/actions';
import { AssignmentMatrix, EditRoomAssignments } from './index';

class EditRooms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomDrafts: props.selectedAssignment.value,
      participants: [],
      roomNum: props.selectedAssignment.value.length,
    };
  }

  componentDidMount() {
    const { roomDrafts } = this.state;
    const { selectedAssignment } = this.props;
    console.log('roomDrafts:');
    console.log(roomDrafts);
    console.log('selectedAssignment:');
    console.log(selectedAssignment);

    const membersObj = {};
    roomDrafts.forEach((room) => {
      room.members.forEach((mem) => {
        if (!membersObj[mem.user._id]) membersObj[mem.user._id] = mem;
      });
    });
    console.log('membersObj:');
    console.log(membersObj);

    const members = Object.values(membersObj).map((mem) => mem);
    console.log('members:');
    console.log(members);

    this.setState({ participants: members });
  }

  updateParticipants = (selectionMatrix) => {
    this.setState({ roomDrafts: selectionMatrix });
  };

  editPreviousAssignment = () => {
    const { connectUpdateRoomMembers, selectedAssignment, close } = this.props;

    const { roomDrafts } = this.state;

    /**
     * If there are new room ids in the updatedAssignment that weren't
     * in the previousAssignment w/the same id as updatedAssignmnet,
     * create those rooms & associate them with the activity, course &
     * grouping in the db/store. Also, replace the previousAssignment
     * with the _id of updatedAssignment in previousAssignments with the
     * updatedAssignment
     * Create a function to updateGroupings => add the new rooms / remove any
     * deleted rooms
     *
     * If the only change is which members are in which room, call
     * connectUpdateRoomMembers for each roomId and pass in the updatedMembers
     *
     * Activity._id & Course._id are found in the roomDrafts object of
     * the updatedAssignment
     */

    selectedAssignment.value.forEach((oldRoomDraft, i) => {
      const membersToUpdate = roomDrafts[i].members.map((mem) => ({
        role: mem.role,
        color: mem.color,
        user: mem.user,
      }));
      connectUpdateRoomMembers(oldRoomDraft.room, membersToUpdate);
    });
    close();
  };
  render() {
    const {
      activity,
      course,
      previousAssignments,
      selectedAssignment,
      userId,
      close
    } = this.props;
    const { participants, roomDrafts, roomNum } = this.state;

    const assignmentMatrix = (
      <AssignmentMatrix
        list={participants}
        requiredParticipants={participants.filter(
          // required people
          (mem) => mem.role === 'facilitator'
        )}
        select={this.updateParticipants}
        roomNum={parseInt(roomNum, 10)} // ensure a number is passed
        activity={activity}
        courseId={course ? course._id : null}
        userId={userId}
        roomDrafts={roomDrafts}
      />
    );

    return (
        <EditRoomAssignments
          activity={activity}
          assignmentMatrix={assignmentMatrix}
          submit={this.editPreviousAssignment}
        //   setNumber={this.setNumber}
          roomNum={parseInt(roomNum, 10)} // ensure a number is passed
        //   roomName={roomName}
          setRoomName={this.setRoomName}
          setParticipantNumber={this.setParticipantNumber}
        //   rooms={rooms}
          previousAssignments={previousAssignments}
          selectedAssignment={selectedAssignment}
          close={close}
        />
    //   <div>hi</div>
    );
  }
}

EditRooms.propTypes = {
  activity: PropTypes.shape({}).isRequired,
  course: PropTypes.shape({}),
  selectedAssignment: PropTypes.shape({}).isRequired,
  userId: PropTypes.string.isRequired,
  close: PropTypes.func.isRequired,
};

EditRooms.defaultProps = {
  course: null,
};

export default withRouter(
  connect(null, {
    connectUpdateRoomMembers: updateRoomMembers,
  })(EditRooms)
);
