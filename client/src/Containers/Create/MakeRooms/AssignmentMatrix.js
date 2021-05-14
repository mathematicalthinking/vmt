import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classes from './makeRooms.css';
import { Checkbox } from '../../../Components';

const AssignmentMatrix = (props) => {
  const { list, selectedParticipants, select } = props;

  const rooms = ['Room 1', 'Room 2'];

  return (
    <Fragment>
      {/* top row rooms list */}
      {rooms.map((room, i) => {
        return (
          <span
            // className={roomsList}
            key={`room-${i + 1}`}
            id={`room-${i + 1}`}
          >
            {room}
          </span>
        );
      })}
      {list.map((participant, i) => {
        const rowClass = selectedParticipants.includes(participant.user._id)
          ? [classes.Participant, classes.Selected].join(' ')
          : classes.Participant;
        return (
          <div
            className={rowClass}
            key={participant.user._id}
            id={participant.user._id}
          >
            <span>{`${i + 1}. ${participant.user.username}`}</span>
            {rooms.map((room, j) => {
              return (
                <Checkbox
                  label={`${j + 1}. `}
                  change={select}
                  dataId={`${participant.user._id}rm${j + 1}`}
                  key={`${participant.user._id}rm${j + 1}`}
                  checked={
                    selectedParticipants.indexOf(participant.user._id) > -1
                  }
                >
                  {`${j + 1}. `}
                </Checkbox>
              );
            })}
          </div>
        );
      })}
    </Fragment>
  );
};

AssignmentMatrix.propTypes = {
  list: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  selectedParticipants: PropTypes.arrayOf(PropTypes.string).isRequired,
  select: PropTypes.func.isRequired,
};
export default AssignmentMatrix;
