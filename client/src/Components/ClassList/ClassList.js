import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { API } from 'utils';
import classes from './classlist.css';

const ClassList = ({ classId, join }) => {
  const { isSuccess, data } = useQuery(
    classId,
    () =>
      API.getWithCode('courses', classId).then((res) => {
        const { members } = res.data.result[0];
        return members;
      }),
    { refreshInterval: 1000 }
  );

  const members = isSuccess ? data : [];
  const hasMembers = members && members.length > 0;

  const isUserInSession = (userData) => {
    if (userData.user.socketId) {
      return true;
    }
    return false;
  };

  const participantList = [];

  members.forEach((member) => {
    if (member.role === 'participant' || member.role === 'guest') {
      participantList.push(member);
    }
  });

  return hasMembers ? (
    <div>
      <div className={classes.THead}>Member List</div>
      <table className={classes.ParticipantList}>
        <thead>
          <tr>
            {/* <th className={classes.THead}>Select Your Username</th> */}
          </tr>
        </thead>
        <tbody>
          {participantList.map((member, i) => {
            return (
              <tr
                className={
                  isUserInSession(member)
                    ? classes.InSession
                    : classes.Participant
                }
                key={member.user._id}
                id={member.user._id}
                onClick={() => join(member.user)}
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
  classId: PropTypes.string.isRequired,
  join: PropTypes.func.isRequired,
};

export default ClassList;
