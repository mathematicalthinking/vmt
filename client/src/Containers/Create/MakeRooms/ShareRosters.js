import React, { Fragment, useState } from 'react';
import { useSelector } from 'react-redux';
import { amIAFacilitator } from 'utils';
import { Button, InfoBox, Member, Search } from 'Components';
import GenericSearchResults from 'Components/Search/GenericSearchResults';
import classes from './makeRooms.css';

const ShareRosters = (props) => {
  const { participants, userId, updateList, close } = props;

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
  const [newParticipants, setNewParticipants] = useState([]);

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
    const newList = [...prevParticipants, ...newParticipants]
      .sort((a, b) => a.user.username.localeCompare(b.user.username))
      .concat(facilitators);
    updateList(newList);
    close();
  };

  return (
    <div className={`${classes.ParticipantsContainer}`}>
      <InfoBox
        title="Add Participants From Shared Rosters"
        icon={<i className="fas fa-user-plus" />}
        className={classes.AddParticipants}
      >
        {/* <div> */}
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
                searchText={'searchText'}
                select={addParticipantFromRoster}
                className={classes.AddParticipants}
              />
            )}
          </Fragment>
        </div>
      </InfoBox>
      {newParticipants ? (
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
      ) : null}
      {/* </div> */}
      <div className={classes.ModalButton}>
        <Button m={5} click={close} data-testid="next-step-assign">
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

export default ShareRosters;
