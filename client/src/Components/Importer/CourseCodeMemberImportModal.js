import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import uniqBy from 'lodash/uniqBy';
import { Button, InfoBox, Member, GenericSearchResults } from 'Components';
import { addColors, hexToRGBA } from 'utils';
import CourseCodeMemberImportFunctions from './CourseCodeMemberImportFunctions';
import classes from './courseCodeMemberImportModal.css';

const CourseCodeMemberImportModal = (props) => {
  const { onCancel, onSubmit, userId } = props;
  const [searchResults, setSearchResults] = useState({});
  const [newParticipants, setNewParticipants] = useState([]);

  const inputRef = useRef();

  // autofocus isn't working
  // autofocus 1st attempt
  // const autoFocusInputRef = React.useCallback((inputElement) => {
  //   if (inputElement) inputElement.focus();
  // }, []);

  // autofocus 2nd attempt
  // const autoFocusInputRef = useRef();
  // useEffect(() => {
  //   if (autoFocusInputRef.current) autoFocusInputRef.current.focus();
  // });

  useEffect(() => {
    // add colors for each course
    const courseColorMapping = newParticipants.reduce((acc, curr) => {
      return { ...acc, [curr.user.course]: curr.user.displayColor };
    }, {});

    const newSearchResults = Object.values(searchResults).reduce(
      (acc, curr) => {
        return {
          ...acc,
          [curr._id]: {
            ...curr,
            backgroundColor: hexToRGBA(
              courseColorMapping[curr._id] || '#fff',
              0.3
            ),
          },
        };
      },
      {}
    );

    setSearchResults(newSearchResults);
  }, [newParticipants]);

  const search = async () => {
    // @TODO: tag each course with the color it should have
    // use that color when creating newParticipants
    // forget about addoclor stuff later on ...
    // keep a map of courses to colors
    // make a new function that taeks an existing map and return a map of new people and the map ...
    // searchResults -> enhance the members to match newParticipants (ie, with a course)

    if (!inputRef.current.value.length) return;

    const courseSearched = await CourseCodeMemberImportFunctions.getCourseFromCourseCode(
      inputRef.current.value,
      [userId]
    );

    if (
      !courseSearched ||
      !courseSearched.members ||
      !courseSearched.members.length
    ) {
      return;
    }

    // @TODO: don't add the same course multiple times
    // if it is already in searchResults and searched for again

    setSearchResults((prevState) => {
      return {
        ...prevState,
        [courseSearched._id]: courseSearched,
      };
    });
    inputRef.current.value = '';
  };

  const addAllToNewParticipants = (courseId) => {
    if (searchResults[courseId] && searchResults[courseId].members) {
      const memsToAdd = searchResults[courseId].members.map((mem) => ({
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

      setNewParticipants(
        addColorsToMembers(Object.values(uniqueParticipantsObject))
      );
      setSearchResults((prevState) => ({
        ...prevState,
        [courseId]: {
          ...prevState[courseId],
          isAdded: true,
        },
      }));
    }
  };

  const addColorsToMembers = (mems) => {
    const users = mems.map(({ user }) => user);
    const usersWithColors = addColors(users);
    const memsWithColors = usersWithColors.map((user, index) => ({
      ...mems[index],
      user,
    }));
    return memsWithColors;
  };

  const removeAllMembers = (courseId) => {
    // change isAdded to false
    // don't remove member if they're part of another added course

    // filter to get only courses that have been added & not courseId
    // collect together all members from all of those courses into 1 array
    // remove any duplicates via _uniqBy
    // set current course isAdded to false

    const currentlyAddedMembers = Object.values(searchResults)
      .filter((course) => course._id !== courseId && course.isAdded)
      .map((course) =>
        course.members.map((mem) => ({
          ...mem,
          user: { ...mem.user, course: course._id },
        }))
      )
      .flat();
    const uniqueMembers = uniqBy(currentlyAddedMembers, 'user._id');
    setNewParticipants(addColorsToMembers(uniqueMembers));
    setSearchResults((prevState) => ({
      ...prevState,
      [courseId]: {
        ...prevState[courseId],
        isAdded: false,
      },
    }));
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
                  itemsSearched={CourseCodeMemberImportFunctions.addUIElements(
                    searchResults,
                    addAllToNewParticipants,
                    removeAllMembers
                  )}
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
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};

export default CourseCodeMemberImportModal;
