import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './makeRooms.css';
// import { Checkbox } from '../../../Components';

class ParticipantList extends Component {
  render() {
    const { list, selectedParticipants, select } = this.props;
    return !list || list.length === 0
      ? 'there are no users to display yet'
      : list.map((participant, i) => {
          const rowClass = selectedParticipants.some(
            (u) => u.user._id === participant.user._id
          )
            ? [classes.Participant, classes.Selected].join(' ')
            : classes.Participant;
          return (
            <div
              className={rowClass}
              key={participant.user._id}
              id={participant.user._id}
            >
              <input
                type="checkbox"
                id={participant.user._id}
                onChange={(event) => {
                  select(event, participant);
                }}
                checked={selectedParticipants.some(
                  (u) => u.user._id === participant.user._id
                )}
              />
              <label htmlFor={participant.user._id}>
                {' '}
                {`${i + 1}. ${participant.user.username}`}
              </label>
              {/* <Checkbox
                label={`${i + 1}. ${participant.user.username}`}
                change={select}
                dataId={participant.user._id}
                checked={
                  selectedParticipants.indexOf(participant.user._id) > -1
                }
              >
                {`${i + 1}. ${participant.user.username}`}
              </Checkbox> */}
            </div>
          );
        });
  }
}

ParticipantList.propTypes = {
  list: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  selectedParticipants: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  select: PropTypes.func.isRequired,
};
export default ParticipantList;
