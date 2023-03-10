/* eslint-disable no-console */
/* eslint-disable react/no-did-update-set-state */
import React, { useEffect, useState, Fragment } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { debounce, uniqBy } from 'lodash';
import SearchResults from 'Containers/Members/SearchResults';
import { amIAFacilitator } from 'utils';
import API from 'utils/apiRequests';
import {
  Button,
  InfoBox,
  Search,
  GenericSearchResults,
  Member,
  ToggleGroup,
  Checkbox,
} from 'Components';
import CourseCodeMemberImportFunctions from 'Components/Importer/CourseCodeMemberImportFunctions';
import classes from './makeRooms.css';

const AddParticipants = (props) => {
  const {
    participants,
    userId,
    onSubmit,
    onCancel,
    courseCheckbox,
    originatingCourseId,
  } = props;

  const constants = {
    INDIVIDUALS: 'Individuals',
    ROSTERS: 'Your Courses',
    COURSE_CODE: 'Course Code',
  };

  const userCoursesById = useSelector((state) => state.courses.byId);

  const coursesUserDidNotCreate = Object.values(
    userCoursesById
  ).filter((course) => amIAFacilitator(course, userId));

  const [searchText, setSearchText] = useState('');
  const [rosterSearchText, setRosterSearchText] = useState('');
  const [initialSearchResults, setInitialSearchResults] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [rosterSearchResults, setRosterSearchResults] = useState(
    coursesUserDidNotCreate
  );
  const [courseCodeSearchResults, setCourseCodeSearchResults] = useState({});
  const [courseCodeSearchText, setCourseCodeSearchText] = useState('');
  const [newParticipants, setNewParticipants] = useState([]);
  const [addedCourse, setAddedCourse] = useState({});
  const [
    shouldInviteMembersToCourse,
    setShouldInviteMembersToCourse,
  ] = useState(false);
  const [viewType, setViewType] = useState(constants.INDIVIDUALS);

  useEffect(() => {
    return () => debounceSearch.cancel();
  }, []);

  const debounceSearch = debounce((text) => search(text), 700);

  const search = (text) => {
    // see if text is a course code
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
        })
        .catch((err) => {
          console.log('err: ', err);
        });
    } else {
      setSearchResults([]);
    }
  };

  const searchRosters = (text) => {
    // initial search -- search course names
    // or search facilitators and return an array of course names containing those facilitators
    const res = coursesUserDidNotCreate.filter(
      (course) =>
        course.name.toLowerCase().includes(text.toLowerCase()) ||
        course.members.some(
          (mem) =>
            mem.role === 'facilitator' && mem.user.username.includes(text)
        )
    );

    setRosterSearchText(text);
    setRosterSearchResults(res);
  };

  const generateRosterSearchResults = (courses) => {
    return courses
      .map((course) => ({
        key: course._id,
        label: course.name,
        buttonLabel: addedCourse[course._id] ? 'Remove' : 'Add',
        onClick: addedCourse[course._id]
          ? removeRosterFromParticipantsList
          : addParticipantFromRoster,
      }))
      .filter((generatedCourse) => generatedCourse.key !== originatingCourseId);
  };

  const searchCourseCode = async () => {
    if (!courseCodeSearchText.length) return;

    const courseSearched = await CourseCodeMemberImportFunctions.getCourseFromCourseCode(
      courseCodeSearchText,
      // currently ignoring userId, prob ignore all newParticipants & currentParticipants
      [userId]
    );

    if (
      !courseSearched ||
      !courseSearched.members ||
      !courseSearched.members.length
    ) {
      return;
    }

    setCourseCodeSearchResults((prevState) => {
      return {
        ...prevState,
        [courseSearched._id]: courseSearched,
      };
    });

    setCourseCodeSearchText('');
  };

  const addParticipant = (member) => {
    const { _id } = member.user;
    // filter out duplicates in the right column (New Participants column)
    if (
      newParticipants.find((mem) => _id === mem.user._id) ||
      participants.find((mem) => _id === mem.user._id)
    )
      return;
    setNewParticipants((prevState) => [
      ...prevState,
      { ...member, role: member.role || 'participant' },
    ]);

    setSearchResults((prevState) =>
      prevState.filter((user) => user._id !== _id)
    );
  };

  const addParticipantFromRoster = (courseId) => {
    const courseToAdd = coursesUserDidNotCreate.find(
      (course) => course._id === courseId
    );

    if (courseToAdd) {
      courseToAdd.members.forEach((mem) => {
        addParticipant({
          ...mem,
          course: courseId,
        });
        setAddedCourse((prevState) => ({ ...prevState, [courseId]: true }));
      });
    }
  };

  const addParticipantsFromCourseCode = (courseId) => {
    if (
      courseCodeSearchResults[courseId] &&
      courseCodeSearchResults[courseId].members
    ) {
      const memsToAdd = courseCodeSearchResults[courseId].members.map(
        (mem) => ({
          ...mem,
          user: { ...mem.user, course: courseId },
        })
        
      );
    }
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

  const removeRosterFromParticipantsList = (courseId) => {
    const course = coursesUserDidNotCreate.find((c) => c._id === courseId);
    const courseMembers = course ? course.members : [];
    const courseMembersIds = courseMembers.map((mem) => mem.user._id);
    setNewParticipants((prevState) =>
      prevState.filter((mem) => !courseMembersIds.includes(mem.user._id))
    );
    setAddedCourse((prevState) => {
      const { [courseId]: old, ...others } = prevState;
      return others;
    });
  };

  const _displayViewType = () => {
    switch (viewType) {
      case constants.INDIVIDUALS:
        return (
          // 1st div is duplicated
          <div className={classes.AddParticipants}>
            <div style={{ fontSize: '12px' }}>
              <Search
                data-testid="member-search"
                _search={(text) => {
                  setSearchText(text);
                  debounceSearch(text);
                }}
                placeholder="search by username or email"
                value={searchText}
                isControlled
              />
            </div>
            {searchResults.length > 0 && (
              <SearchResults
                searchText={searchText}
                usersSearched={searchResults}
                inviteMember={(_id, username) =>
                  addParticipant({ user: { _id, username } })
                }
                className={classes.AddParticipants}
              />
            )}
          </div>
        );
      case constants.ROSTERS:
        return (
          <div className={classes.AddParticipants}>
            <div style={{ fontSize: '12px' }}>
              <Search
                data-testid="roster-search"
                _search={searchRosters}
                placeholder="search courses to import rosters from"
                value={rosterSearchText}
                isControlled
              />
            </div>
            {rosterSearchResults && (
              <GenericSearchResults
                itemsSearched={generateRosterSearchResults(rosterSearchResults)}
                className={classes.AddParticipants}
              />
            )}
          </div>
        );
      case constants.COURSE_CODE:
        return (
          <div className={classes.AddParticipants}>
            <div className={classes.Search}>
              <input
                data-testid="CourseCodeMemberImportModal-search-input"
                value={courseCodeSearchText}
                onChange={(e) => setCourseCodeSearchText(e.target.value)}
                type="text"
                placeholder="enter a course code"
                className={classes.Input}
                // ref={autoFocusInputRef} // autofocus isn't working
              />
              <i className={`fas fa-search ${classes.Icon}`} />
              <Button
                data-testid="CourseCodeMemberImportModal-search-button"
                click={searchCourseCode}
                p="0px 16px"
                m="0px 16px"
              >
                Search
              </Button>
            </div>
            {Object.values(courseCodeSearchResults).length > 0 && (
              <GenericSearchResults
                itemsSearched={CourseCodeMemberImportFunctions.addUIElements(
                  courseCodeSearchResults,
                  () => {
                    console.log('add');
                  },
                  () => {
                    console.log('add');
                  }
                  // addAllToNewParticipants,
                  // removeAllMembers
                )}
              />
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const handleInviteMembersToCourse = () => {
    setShouldInviteMembersToCourse((prevState) => !prevState);
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
    onSubmit(participantsToAdd, shouldInviteMembersToCourse, [
      ...newParticipants,
    ]);
    onCancel();
  };

  return (
    <div className={classes.ParticipantsContainer}>
      <div className={classes.InfoBoxContainer}>
        <div className={classes.InfoBox}>
          <InfoBox
            title=""
            icon={<i className="fas fa-user-plus" style={{ height: '25px' }} />}
            className={classes.AddParticipants}
            rightIcons={
              <ToggleGroup
                buttons={[
                  constants.INDIVIDUALS,
                  constants.ROSTERS,
                  constants.COURSE_CODE,
                ]}
                onChange={(type) => setViewType(type)}
              />
            }
          >
            {_displayViewType()}
          </InfoBox>
        </div>
        {newParticipants && (
          <div className={classes.InfoBox}>
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
                ))}
              </div>
            </InfoBox>
          </div>
        )}
      </div>
      <div className={classes.ModalButton}>
        {courseCheckbox && (
          <Checkbox
            change={handleInviteMembersToCourse}
            checked={shouldInviteMembersToCourse}
            dataId="invite-members-to-course"
            labelStyle={{ width: 'auto' }}
          >
            Add New Members to Course
          </Checkbox>
        )}
        <div>
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
    </div>
  );
};

AddParticipants.propTypes = {
  participants: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  userId: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  courseCheckbox: PropTypes.bool.isRequired,
  originatingCourseId: PropTypes.string.isRequired,
};

export default AddParticipants;
