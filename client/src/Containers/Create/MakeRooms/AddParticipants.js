/* eslint-disable no-console */
/* eslint-disable react/no-did-update-set-state */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { debounce, findKey, uniqBy } from 'lodash';
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

  const buttonStrategies = {
    DONE: (assignedParticipants, listedParticipants, courseParticipants) =>
      courseParticipants.every(
        (mem) =>
          assignedParticipants.findIndex(
            (amMem) => amMem.user._id === mem.user._id
          ) > -1
      ),
    REMOVE: (assignedParticipants, listedParticipants, courseParticipants) =>
      courseParticipants.every(
        (mem) =>
          listedParticipants
            .concat(assignedParticipants)
            .findIndex((amMem) => amMem.user._id === mem.user._id) > -1
      ),
    ADD: (assignedParticipants, listedParticipants, courseParticipants) =>
      !courseParticipants.some(
        (mem) =>
          listedParticipants.findIndex(
            (amMem) => amMem.user._id === mem.user._id
          ) > -1
      ) &&
      !courseParticipants.some(
        (mem) =>
          assignedParticipants.findIndex(
            (amMem) => amMem.user._id === mem.user._id
          ) > -1
      ),
    ADD_REMAINING: () => true,
  };

  const buttonAttributes = {
    DONE: { buttonLabel: 'Done', disabled: true, onClick: null },
    REMOVE: {
      buttonLabel: 'Remove',
      disabled: false,
      onClick: (...args) => removeRosterFromNewParticipantsList(...args),
    },
    ADD: {
      buttonLabel: 'Add',
      disabled: false,
      onClick: (...args) => addParticipantFromRoster(...args),
    },
    ADD_REMAINING: {
      buttonLabel: 'Add Remaining',
      disabled: false,
      onClick: (...args) => addParticipantFromRoster(...args),
    },
  };

  const userCoursesById = useSelector((state) => state.courses.byId);

  const coursesUserDidNotCreate = Object.values(
    userCoursesById
  ).filter((course) => amIAFacilitator(course, userId));

  const [searchText, setSearchText] = useState('');
  const [rosterSearchText, setRosterSearchText] = useState('');
  const [courseCodeSearchText, setCourseCodeSearchText] = useState('');
  const [initialSearchResults, setInitialSearchResults] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [rosterSearchResults, setRosterSearchResults] = useState(
    coursesUserDidNotCreate
  );
  const [courseCodeSearchResults, setCourseCodeSearchResults] = useState({});
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
    const courseList = courses.map((course) => {
      const notCurrentUser = course.members.filter(
        (mem) => mem.user._id !== userId
      );
      const strategy = findKey(buttonStrategies, (testFcn) =>
        testFcn(participants, newParticipants, notCurrentUser)
      );
      return {
        key: course._id,
        label: course.name,
        altLabel: course.courseCode || null,
        ...buttonAttributes[strategy],
      };
    });
    return (
      courseList
        // filter out course you are currently in
        .filter((a) => a.key !== originatingCourseId)
        // sort DONE courses to bottom of list
        .sort((a) =>
          a.buttonLabel === buttonAttributes.DONE.buttonLabel ? 1 : -1
        )
    );
  };

  const searchCourseCode = async () => {
    if (!courseCodeSearchText.length) return;

    const courseSearched = await CourseCodeMemberImportFunctions.getCourseFromCourseCode(
      courseCodeSearchText,
      [userId] // ignore userId
    );

    if (
      !courseSearched ||
      !courseSearched.members ||
      !courseSearched.members.length
    ) {
      return;
    }

    // used to display altLabel in GenericSearchResults /
    // generateRosterSearchResults
    courseSearched.courseCode = courseCodeSearchText;

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
    let memsToAdd = [];

    if (
      courseToAdd &&
      !(
        courseCodeSearchResults[courseId] &&
        courseCodeSearchResults[courseId].members
      )
    ) {
      courseToAdd.members.forEach((mem) => {
        addParticipant({
          ...mem,
          course: courseId,
        });
      });
      setAddedCourse((prevState) => ({
        ...prevState,
        [courseId]: { ...courseToAdd, isAdded: true },
      }));
    }

    if (
      courseCodeSearchResults[courseId] &&
      courseCodeSearchResults[courseId].members
    ) {
      memsToAdd = courseCodeSearchResults[courseId].members.map((mem) => ({
        ...mem,
        user: { ...mem.user, course: courseId },
      }));

      const uniqueParticipants = uniqBy(
        newParticipants.concat(...memsToAdd),
        'user._id'
      );

      // if facilitators from the newly added course were previously added as
      // participants, upgrade their role to facilitator within
      // uniqueParticipants
      const memsToAddObject = memsToAdd.reduce((acc, curr) => {
        return {
          ...acc,
          [curr.user._id]: { ...curr },
        };
      }, {});

      const uniqueParticipantsObject = uniqueParticipants.reduce(
        (acc, curr) => {
          return {
            ...acc,
            [curr.user._id]: { ...curr },
          };
        },
        {}
      );

      Object.values(memsToAddObject).forEach((mem) => {
        if (
          uniqueParticipantsObject[mem.user._id] &&
          mem.role === 'facilitator'
        )
          uniqueParticipantsObject[mem.user._id].role = 'facilitator';
      });

      // addParticipants
      Object.values(uniqueParticipantsObject).forEach((mem) => {
        addParticipant({ ...mem, course: courseId });
      });

      // set addedCourse[courseId].isAdded to true
      // used in CourseCodeMemberImportFunction to swtich b/t
      // buttonLabel & onClick
      setCourseCodeSearchResults((prevState) => ({
        ...prevState,
        [courseId]: {
          ...prevState[courseId],
          isAdded: true,
        },
      }));

      setAddedCourse((prevState) => ({
        ...prevState,
        [courseId]: { ...courseCodeSearchResults[courseId], isAdded: true },
      }));
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

  const removeRosterFromNewParticipantsList = (courseId) => {
    // handle state changes if course is in "Your Courses"
    const rosterCourse = coursesUserDidNotCreate.find(
      (c) => c._id === courseId
    );
    const rosterCourseMembers = rosterCourse ? rosterCourse.members : [];
    const rosterCourseMembersIds = rosterCourseMembers.map(
      (mem) => mem.user._id
    );
    // setNewParticipants((prevState) =>
    //   prevState.filter((mem) => !rosterCourseMembersIds.includes(mem.user._id))
    // );

    // handle state changes if course is in courseCodeSearchResults
    const courseCodeMembersIds =
      courseCodeSearchResults[courseId] &&
      courseCodeSearchResults[courseId].members
        ? courseCodeSearchResults[courseId].members.map((mem) => mem.user._id)
        : [];

    setNewParticipants((prevState) => {
      let memsToUpdate = [];

      if (rosterCourseMembersIds.length) {
        memsToUpdate = prevState.filter(
          (mem) => !rosterCourseMembersIds.includes(mem.user._id)
        );
      }

      if (courseCodeMembersIds.length) {
        memsToUpdate = Array.from(
          new Set([
            ...memsToUpdate,
            ...prevState.filter(
              (mem) => !courseCodeMembersIds.includes(mem.user._id)
            ),
          ])
        );
      }

      return memsToUpdate;
      // prevState.filter(
      //   (mem) =>
      //     !rosterCourseMembersIds.includes(mem.user._id) &&
      //     !courseCodeMembersIds.includes(mem.user._id)
      // );
    });

    if (
      courseCodeSearchResults[courseId] ||
      (courseCodeSearchResults[courseId] &&
        courseCodeSearchResults[courseId].members &&
        courseCodeSearchResults[courseId].members.length === 0)
    ) {
      setCourseCodeSearchResults((prevCourseCodeCourses) => ({
        ...prevCourseCodeCourses,
        [courseId]: {
          ...prevCourseCodeCourses[courseId],
          isAdded: false,
        },
      }));
    }

    // remove the course from the addedCourses
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
                placeholder="search your courses to import members from"
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
                // itemsSearched={CourseCodeMemberImportFunctions.addUIElements(
                //   courseCodeSearchResults,
                //   addParticipantsFromCourseCode,
                //   removeParticipantsFromCourseCode
                // )}
                itemsSearched={generateRosterSearchResults(
                  Object.values(courseCodeSearchResults)
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
    onSubmit(
      participantsToAdd,
      shouldInviteMembersToCourse,
      [...newParticipants],
      addedCourse
    );
    onCancel();
  };

  return (
    <div className={classes.ParticipantsContainer}>
      <div className={classes.InfoBoxContainer}>
        <div className={classes.InfoBox}>
          <InfoBox
            title="Add Members"
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
  originatingCourseId: PropTypes.string,
};

AddParticipants.defaultProps = {
  originatingCourseId: null,
};
export default AddParticipants;
