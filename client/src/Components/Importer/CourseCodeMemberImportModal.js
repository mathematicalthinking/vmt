import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import uniqBy from 'lodash/uniqBy';
import { Button, InfoBox, Member, GenericSearchResults } from 'Components';
import { addColors, hexToRGBA } from 'utils';
import classes from './courseCodeMemberImportModal.css';

const CourseCodeMemberImportModal = (props) => {
  const {
    currentMembers,
    getMembersFromCourseCode,
    onCancel,
    onSubmit,
  } = props;
  const [initialSearchResults, setInitialSearchResults] = useState([]);
  const [searchResults, setSearchResults] = useState({});
  const [newParticipants, setNewParticipants] = useState([]);
  const [newParticipantsObject, setNewParticipantsObject] = useState({});
  const [currentMembersObject, _setCurrentMembersObject] = useState(
    currentMembers.reduce((acc, curr) => {
      return { ...acc, [curr.user._id]: curr };
    }, {})
  );

  const searchResultsRef = useRef({});
  const inputRef = useRef();
  const newParfticipantsRef = useRef([]);

  // autofocus isn't working
  // const autoFocusInputRef = React.useCallback((inputElement) => {
  //   if (inputElement) inputElement.focus();
  // }, []);

  // const autoFocusInputRef = useRef();
  // useEffect(() => {
  //   if (autoFocusInputRef.current) autoFocusInputRef.current.focus();
  // });

  useEffect(() => {
    // ref is used because addAllToNewParticipants
    // didn't keep access to searchResults
    searchResultsRef.current = {
      ...searchResultsRef.current,
      ...searchResults,
    };
  }, [searchResults]);

  useEffect(() => {
    // if (newParticipants.length === 0) return;
    // setNewParticipantsObject(
    //   newParticipants.reduce((acc, curr) => {
    //     return { ...acc, [curr.user._id]: curr };
    //   }, {})
    // );
    // add colors for each course
  }, [newParticipants]);

  const search = async () => {
    const courseSearched = await getMembersFromCourseCode(
      inputRef.current.value
    );
    if (
      !courseSearched ||
      !courseSearched.courseMembers ||
      !courseSearched.courseMembers.length ||
      !courseSearched.courseId ||
      !courseSearched.courseEntryCode
    ) {
      return;
    }

    // formatted for use with GenericSearchResults
    const formattedCourse = formatCourseSearchResults(
      courseSearched.courseId,
      courseSearched.courseName,
      inputRef.current.value
    );
    setSearchResults((prevState) => {
      return {
        ...prevState,
        [courseSearched.courseId]: {
          ...formattedCourse,
          ...courseSearched,
        },
      };
    });
    inputRef.current.value = '';
  };

  const formatCourseSearchResults = (courseId, courseName, courseCode) => {
    let buttonLabel = 'add';
    const buttonAction = (id) => {
      addAllToNewParticipants(id);
      searchResultsRef.current[id].buttonLabel === 'add'
        ? (buttonLabel = 'remove')
        : (buttonLabel = 'add');
    };
    return {
      label: courseName,
      altLabel: `Course Code: ${courseCode}`,
      buttonLabel,
      onClick: buttonAction,
      key: courseId,
    };
  };

  const addAllToNewParticipants = (courseId) => {
    if (
      searchResultsRef.current[courseId] &&
      searchResultsRef.current[courseId].courseMembers
    ) {
      const mems = searchResultsRef.current[courseId].courseMembers.map(
        (mem) => ({
          user: {
            _id: mem.user._id,
            username: mem.user.username,
            role: mem.user.accountType,
            course: courseId,
          },
        })
      );

      console.log('mems');
      console.log(mems);

      const uniqueParticipants = uniqBy(
        newParticipants.concat(...mems),
        'user._id'
      );

      setNewParticipants(addColorsToMembers(uniqueParticipants));
    }
  };

  const addColorsToMembers = (mems) => {
    const users = mems.map(({ user }) => user);
    const usersWithColors = addColors(users);
    const memsWithColors = usersWithColors.map((user) => ({
      user,
    }));
    return memsWithColors;
  };

  const addParticipant = (member) => {
    const { _id } = member.user;

    // If member is in newParticipants, ignore this add
    // unless this version of the member is a facilitor,
    // then we want to switch their role to facilitator, but
    // not re-add them
    // (currently we just ignore collisions)

    if (newParfticipantsRef.current.find((mem) => _id === mem.user._id)) return;

    // HOW TO SORT MEMBERS IN NEW PARTICIPANTS COLUMN?
    // alpha by course (better)
    // alpha all (current)

    setNewParticipants((prevState) =>
      [...prevState, { ...member }].sort((a, b) =>
        a.user.username.localeCompare(b.user.username)
      )
    );
    if (
      searchResults[member.user.course] ||
      searchResultsRef.current[member.user.course]
    ) {
      // backgroundColor is static (each gets same color)
      // doesn't change b/c we pass 1 mem at a time
      const backgroundColor = hexToRGBA(member.user.displayColor, 0.5);
      console.log(`backgroundColor: ${backgroundColor}`);
      setSearchResults((prevState) => ({
        ...prevState,
        [member.user.course]: {
          ...prevState[member.user.course],
          backgroundColor,
        },
      }));
    }
  };

  const removeMember = (mem) => {
    setNewParticipants((prevState) =>
      prevState.filter(({ user }) => user._id !== mem.user._id)
    );
  };

  const submit = () => {
    const participantsToAdd = [...newParticipants]; // newParfticipants???
    onSubmit(participantsToAdd);
    onCancel();
  };

  return (
    <div className={classes.ParticipantsContainer}>
      <div className={classes.InfoBoxContainer}>
        <div className={classes.InfoBox}>
          <InfoBox
            title="Import Members by Course Code"
            icon={<i className="fas fa-user-plus" style={{ height: '25px' }} />}
          >
            <div className={classes.CourseCodeSearch}>
              <div className={classes.Search}>
                <input
                  data-testid="CourseCodeMemberImportModal-search-input"
                  ref={inputRef}
                  type="text"
                  placeholder="enter a course code"
                  className={classes.Input}
                  // ref={autoFocusInputRef} // autofocus isn't working
                />
                <i className={`fas fa-search ${classes.Icon}`} />
                <Button
                  data-testid="CourseCodeMemberImportModal-search-button"
                  click={search}
                  p="0px 16px"
                  m="0px 16px"
                >
                  Search
                </Button>
              </div>
              {Object.values(searchResults).length > 0 && (
                <GenericSearchResults
                  itemsSearched={Object.values(searchResults)}
                />
              )}
            </div>
          </InfoBox>
        </div>

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
                // <i className="fas fa-trash-alt" style={{ fontSize: '20px' }} />
              ))}
            </div>
          </InfoBox>
        </div>
      </div>
      <div className={classes.ModalButton}>
        <div>
          <Button m={5} click={() => onCancel()} data-testid="next-step-assign">
            Cancel
          </Button>
          <Button
            m={5}
            click={submit}
            disabled={newParticipants.length === 0}
            data-testid="next-step-assign"
          >
            Import
          </Button>
        </div>
      </div>
    </div>
  );
};

CourseCodeMemberImportModal.propTypes = {
  currentMembers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  getMembersFromCourseCode: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default CourseCodeMemberImportModal;
