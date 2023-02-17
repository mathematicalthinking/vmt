import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  InfoBox,
  Search,
  GenericSearchResults,
  Member,
  ToggleGroup,
  Checkbox,
} from 'Components';
import SearchResults from 'Containers/Members/SearchResults';
import classes from './courseCodeMemberImportModal.css';

const CourseCodeMemberImportModal = (props) => {
  const { getMembersFromCourseCode, onCancel, onSubmit } = props;
  const [searchText, setSearchText] = useState();
  const [initialSearchResults, setInitialSearchResults] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [newParticipants, setNewParticipants] = useState([]);

  const search = async () => {
    console.log(searchText);
    if (searchText.length === 0) {
      setSearchResults([]);
      return;
    }
    const courseMembers = await getMembersFromCourseCode(searchText);
    console.log('courseMembers');
    console.log(courseMembers);
    if (courseMembers.length === 0) {
      //   setSearchResults();
      return;
    }
    setInitialSearchResults(courseMembers.map((mem) => mem.user));
    setSearchResults(courseMembers.map((mem) => mem.user));
  };

  const addParticipant = (member) => {
    const { _id } = member.user;
    // filter out duplicates in the right column (New Participants column)
    if (newParticipants.find((mem) => _id === mem.user._id)) return;
    setNewParticipants((prevState) => [
      ...prevState,
      { ...member, role: 'participant' },
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
    const participantsToAdd = [...searchResults];
    onSubmit(participantsToAdd);
    onCancel();
  };

  return (
    <div>
      <InfoBox
        title="Import Members by Course Code"
        icon={<i className="fas fa-user-plus" style={{ height: '25px' }} />}
      >
        <Search
          _search={(text) => {
            setSearchText(text);
            // search(text);
          }}
          data-testid="CourseCodeMemberImportModal-search"
          placeholder="enter a course code"
        />
        <Button click={search}>Search</Button>
        {searchResults.length > 0 && searchText > 0 && (
          <div>
            <Button click={search}>Add All</Button>
          </div>
        )}
        {searchResults.length > 0 && (
          <SearchResults
            searchText={searchText}
            usersSearched={searchResults}
            inviteMember={(_id, username) =>
              addParticipant({ user: { _id, username } })
            }
            // className={classes.AddParticipants}
          />
        )}
      </InfoBox>

      {newParticipants && (
        <div>
          <InfoBox
            title="New Participants"
            icon={<i className="fas fa-users" style={{ height: '25px' }} />}
          >
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
        </div>
      )}
      <div className={classes.ModalButton}>
        <div>
          <Button m={5} click={onCancel} data-testid="next-step-assign">
            Cancel
          </Button>
          <Button
            m={5}
            click={submit}
            disabled={searchResults.length === 0}
            data-testid="next-step-assign"
          >
            Add Participants
          </Button>
        </div>
      </div>
    </div>
  );
};

CourseCodeMemberImportModal.propTypes = {
  getMembersFromCourseCode: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default CourseCodeMemberImportModal;
