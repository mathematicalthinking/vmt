/* eslint-disable no-console */
/* eslint-disable react/no-did-update-set-state */
import React, { useState, Fragment } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import SearchResults from 'Containers/Members/SearchResults';
import { amIAFacilitator } from 'utils';
import API from 'utils/apiRequests';
import { Button, InfoBox, Search, Member, Slider } from 'Components';
import GenericSearchResults from 'Components/Search/GenericSearchResults';
import classes from './makeRooms.css';

const AddParticipants = (props) => {
  const { participants, userId, onSubmit, onCancel } = props;

  const userCoursesById = useSelector((state) => state.courses.byId);

  const coursesUserDidNotCreate = Object.values(
    userCoursesById
  ).filter((course) => amIAFacilitator(course, userId));

  const coursesByNames = coursesUserDidNotCreate.reduce((acc, curr) => {
    return { ...acc, [curr.name]: { ...curr } };
  }, {});

  const [initialSearchResults, setInitialSearchResults] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [rosterSarchResults, setRosterSearchResults] = useState(
    Object.keys(coursesByNames)
  );
  const [searchText, setSearchText] = useState('');
  const [newParticipants, setNewParticipants] = useState([]);
  const [isAddingParticipants, setIsAddingParticipants] = useState(true);

  const search = (text) => {
    if (text.length > 0) {
      API.search(
        'user',
        text,
        [userId]
          .concat([...participants].map((p) => p.user._id))
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

  const searchRosters = (text) => {
    // initial search -- search course names
    const res = Object.keys(coursesByNames).filter((courseName) =>
      courseName.includes(text)
    );

    if (!res.length) {
      // search facilitators and return an array of course names containing those facilitators
      coursesUserDidNotCreate.forEach((course) => {
        if (
          course.members.some(
            (mem) =>
              mem.role === 'facilitator' && mem.user.username.includes(text)
          )
        )
          res.push(course.name);
      });
    }

    setRosterSearchResults(res);
  };

  const addParticipant = (_id, username) => {
    // filter out duplicates in the right column (New Participants column)
    if (
      newParticipants.find((mem) => _id === mem.user._id) ||
      participants.find((mem) => _id === mem.user._id)
    )
      return;
    setNewParticipants((prevState) => [
      ...prevState,
      { role: 'participant', user: { _id, username } },
    ]);

    setSearchResults((prevState) =>
      prevState.filter((user) => user._id !== _id)
    );
  };

  const addParticipantFromRoster = (courseName) => {
    console.log(`courseName: ${courseName}`);
    coursesByNames[courseName].members.forEach((mem) =>
      addParticipant(mem.user._id, mem.user.username)
    );
  };

  const removeMember = (mem) => {
    setNewParticipants((prevState) =>
      prevState.filter(({ user }) => user._id !== mem.user._id)
    );

    // add mem back to the search results list?
    // eslint-disable-next-line no-restricted-syntax
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
    const participantsToAdd = [...prevParticipants, ...newParticipants]
      .sort((a, b) => a.user.username.localeCompare(b.user.username))
      .concat(facilitators);
    onSubmit(participantsToAdd);
    onCancel();
  };

  return (
    <div className={`${classes.ParticipantsContainer}`}>
      <InfoBox
        title="Add Participants"
        icon={<i className="fas fa-user-plus" />}
        className={classes.AddParticipants}
        rightIcons={
          <Slider
            action={() => setIsAddingParticipants((prevState) => !prevState)}
            isOn={!isAddingParticipants}
            name="addParticipantsSlider"
            data-testid="addParticipants-slider"
          />
        }
        rightTitle="Shared Roster"
      >
        {isAddingParticipants && (
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
        )}

        {!isAddingParticipants && (
          <div className={classes.AddParticipants}>
            <Fragment>
              <div style={{ fontSize: '12px' }}>
                <Search
                  data-testid="roster-search"
                  _search={searchRosters}
                  placeholder="search courses to import rosters from"
                />
              </div>
              {Object.keys(coursesByNames).length > 0 && (
                <GenericSearchResults
                  itemsSearched={rosterSarchResults}
                  searchText={searchText}
                  select={addParticipantFromRoster}
                  className={classes.AddParticipants}
                />
              )}
            </Fragment>
          </div>
        )}
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
        <Button m={5} click={onCancel} data-testid="next-step-assign">
          Cancel
        </Button>
        <Button
          m={5}
          click={submit}
          disabled={newParticipants.length === 0}
          data-testid="next-step-assign"
        >
          Add Participants
        </Button>
      </div>
    </div>
  );
};

AddParticipants.propTypes = {
  participants: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  userId: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default AddParticipants;
