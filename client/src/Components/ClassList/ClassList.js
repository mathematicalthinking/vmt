import React from 'react';
import PropTypes from 'prop-types';
import classes from './classlist.css';

const ClassList = ({ members, join }) => {
  const hasMembers = members && members.length > 0;

  const isUserInSession = (userData) => {
    if (userData.user.socketId) {
      return true;
    }
    return false;
  };

  return hasMembers ? (
    <div>
      <div className={classes.THead}>Select Your Username</div>
      <table className={classes.ParticipantList}>
        <thead>
          <tr>{/* <th className={classes.THead} /> */}</tr>
        </thead>
        <tbody>
          {members.map((member, i) => {
            return (
              <tr
                className={
                  isUserInSession(member)
                    ? classes.InSession
                    : classes.Participant
                }
                key={member.user._id}
                id={member.user._id}
                onClick={() => join(member)}
              >
                <td>{`${i + 1}. ${member.user.username.toLowerCase()}`}</td>
                <td>
                  {isUserInSession(member) && (
                    <span>User already in session</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ) : (
    <div data-testid="no-data-message">No class list found.</div>
  );
};

ClassList.propTypes = {
  members: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  join: PropTypes.func.isRequired,
};

export default ClassList;
