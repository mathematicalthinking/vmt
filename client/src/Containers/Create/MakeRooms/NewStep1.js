/* eslint-disable no-console */
/* eslint-disable react/no-did-update-set-state */
import React, { useState, Fragment } from 'react';
// import PropTypes from 'prop-types';
import SearchResults from 'Containers/Members/SearchResults';
import API from 'utils/apiRequests';
import { Button, InfoBox, Search, Member } from 'Components';
import ParticipantList from './ParticipantList';
import classes from './makeRooms.css';

const NewStep1 = (props) => {
  const { participants, userId, courseId } = props;

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
          const newSearchResults = res.data.results.filter(
            (user) => user.accountType !== 'temp'
          );

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
    // setNewParticipants((prevState) => ({
    //     ...prevState,
    //     {user: { _id, username }}
    // }))

    setNewParticipants((prevState) => {
      [...prevState, { user: { _id, username, email } }];
    });

    // console.log(searchResults);

    setSearchResults((prevState) => {
      console.log(prevState);
      const newResults = prevState.filter((user) => user._id !== _id);
      console.log(newResults);
      return newResults;
      //   return prevState.filter((user) => user._id !== _id)
    });
  };

  const goNext = () => {
    setParticipants(currentParticipants);
    nextStep();
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
                canRemove={true}
                rejectAccess={() => console.log(member)}
              />
              // <i className="fas fa-trash-alt" style={{ fontSize: '20px' }} />
            ))}
          </div>
        </InfoBox>
      )}
      <div className={classes.ModalButton}>
        <Button m={5} click={goNext} data-testid="next-step-assign">
          Add Participants
        </Button>
      </div>
    </div>
  );
};

// NewStep1.propTypes = {
//   userId: PropTypes.string.isRequired,
//   course: PropTypes.string,
//   participants: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
//   //   setParticipants: PropTypes.func.isRequired,
// };

// NewStep1.defaultProps = {
//   course: null,
// };

export default NewStep1;
