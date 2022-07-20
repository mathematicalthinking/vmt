/* eslint-disable no-console */
/* eslint-disable react/no-did-update-set-state */
import React, { useState, Fragment } from 'react';
import { useDispatch } from 'react-redux';
// import PropTypes from 'prop-types';
import SearchResults from 'Containers/Members/SearchResults';
import API from 'utils/apiRequests';
import { Button, InfoBox, Search, Member } from 'Components';
import { updateCourseMembers } from 'store/actions';
import ParticipantList from './ParticipantList';
import classes from './makeRooms.css';

const AddParticipants = (props) => {
  const {
    participants,
    userId,
    courseId,
    updateList,
    close,
    sortParticipants,
  } = props;

  const dispatch = useDispatch();

  const [initialSearchResults, setInitialSearchResults] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentParticipants, setCurrentParticipants] = useState([
    ...participants,
  ]);
  const [newParticipants, setNewParticipants] = useState([]);

  const search = (text) => {
    if (text.length > 0) {
      API.search(
        'user',
        text,
        [userId]
          .concat(currentParticipants.map((p) => p.user._id))
          .concat(newParticipants.map((p) => p.user._id)) // Exclude myself and already selected members from th search
      )
        .then((res) => {
          const newSearchResults = res.data.results
            .filter((user) => user.accountType !== 'temp')
            .sort((a, b) => a.username.localeCompare(b.username));

          setInitialSearchResults(newSearchResults);
          setSearchResults(newSearchResults);
          setSearchText(text);
        })
        .catch((err) => {
          console.log('err: ', err);
        });
    } else {
      setSearchResults([]);
      setSearchText(text);
    }
  };

  const addParticipant = (_id, username, email) => {
    setNewParticipants((prevState) => [
      ...prevState,
      { role: 'participant', user: { _id, username } },
    ]);

    setSearchResults((prevState) =>
      prevState.filter((user) => user._id !== _id)
    );
  };

  const removeMember = (mem) => {
    setNewParticipants((prevState) =>
      prevState.filter(({ user }) => user._id !== mem.user._id)
    );

    // add mem back to the search results list?
    for (const user of initialSearchResults) {
      if (user._id === mem.user._id) {
        setSearchResults((prevState) =>
          [...prevState, user].sort((a, b) =>
            a.username.localeCompare(b.username)
          )
        );
        break;
      }
    }
  };

  const submit = () => {
    const facilitators = participants.filter(
      (mem) => mem.role === 'facilitator'
    );
    const prevParticipants = participants.filter(
      (mem) => mem.role === 'participant'
    );
    const newList = [...prevParticipants, ...newParticipants]
      .sort((a, b) => a.user.username.localeCompare(b.user.username))
      .concat(facilitators);

    updateList(newList);

    if (courseId) {
      dispatch(updateCourseMembers(courseId, newList));
    }
    close();
  };

  return (
    <div className={`${classes.ParticipantsContainer}`}>
      <InfoBox
        title="Add Participants"
        icon={<i className="fas fa-user-plus" />}
        className={classes.AddParticipants}
      >
        <div className={classes.AddParticipants}>
          <Fragment>
            <div style={{ fontSize: '12px' }}>
              <Search
                data-testid="member-search"
                _search={search}
                placeholder="search by username or email"
              />
            </div>
            {searchResults.length > 0 && (
              <SearchResults
                searchText={searchText}
                usersSearched={searchResults}
                inviteMember={addParticipant}
                className={classes.AddParticipants}
              />
            )}
          </Fragment>
        </div>
      </InfoBox>
      {newParticipants && (
        <InfoBox title="New Participants" icon={<i className="fas fa-users" />}>
          <div data-testid="members" className={classes.NewParticipants}>
            {newParticipants.map((member) => (
              <Member
                info={member}
                key={member.user._id}
                resourceName="template"
                canRemove
                rejectAccess={() => removeMember(member)}
              />
              // <i className="fas fa-trash-alt" style={{ fontSize: '20px' }} />
            ))}
          </div>
        </InfoBox>
      )}
      <div className={classes.ModalButton}>
        <Button m={5} click={submit} data-testid="next-step-assign">
          Add Participants
        </Button>
      </div>
    </div>
  );
};

// AddParticipants.propTypes = {
//   userId: PropTypes.string.isRequired,
//   course: PropTypes.string,
//   participants: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
//   //   setParticipants: PropTypes.func.isRequired,
// };

// AddParticipants.defaultProps = {
//   course: null,
// };

export default AddParticipants;
