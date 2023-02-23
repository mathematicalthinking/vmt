import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  InfoBox,
  Search,
  Member,
  GenericSearchResults,
} from 'Components';
import { SearchResults } from 'Containers';
import classes from './courseCodeMemberImportModal.css';

const CourseCodeMemberImportModal = (props) => {
  const {
    currentMembers,
    getMembersFromCourseCode,
    onCancel,
    onSubmit,
  } = props;
  const [searchText, setSearchText] = useState();
  const [initialSearchResults, setInitialSearchResults] = useState([]);
  const [searchResults, setSearchResults] = useState({});
  const [newParticipants, setNewParticipants] = useState([]);
  const [newParticipantsObject, setNewParticipantsObject] = useState([]);
  const [currentMembersObject, _setCurrentMembersObject] = useState(
    currentMembers.reduce((acc, curr) => {
      return { ...acc, [curr.user._id]: curr };
    }, {})
  );
  const resultsRef = React.useRef({});

  useEffect(() => {
    console.group('useEffect');
    console.log('searchResults');
    console.log(searchResults);
    // ref is used because addAllToNewParticipants
    // didn't keep access to searchResults
    resultsRef.current = { ...resultsRef.current, ...searchResults };
    console.groupEnd('useEffect');
  }, [searchResults]);

  // useEffect(() => {
  //   console.group('resultsRef useEffect');
  //   console.log('resultsRef.current');
  //   console.log(resultsRef.current);
  //   console.log('searchResults');
  //   console.log(searchResults);
  //   console.groupEnd();

  //   setSearchResults({ ...resultsRef.current });
  // }, [resultsRef.current]);

  useEffect(() => {
    // before searching, match human-readable-ids pattern of
    // word-word-number
    if (/(?<!\S)(?!\S*--)\S+-\d+/.test(searchText)) search();
  }, [searchText]);

  useEffect(() => {
    if (newParticipants.length === 0) return;
    setNewParticipantsObject(
      newParticipants.reduce((acc, curr) => {
        return { ...acc, [curr.user._id]: curr };
      }, {})
    );
  }, [newParticipants]);

  const search = async () => {
    /** This commented out block was used to return a members list after a succesful search. Now we return a course after a successful search */
    // const courseMembersSearched = await getMembersFromCourseCode(searchText);
    // if (!courseMembersSearched || courseMembersSearched.length === 0) {
    //   setSearchResults([]);
    //   return;
    // }
    // const uniqueCourseMembersSearched = courseMembers.filter(
    //   (mem) => !currentMembersObject[mem._id] && !newParticipantsObject[mem._id]
    // );
    // setInitialSearchResults((prevState) => [
    //   ...prevState,
    //   ...uniqueCourseMembersSearched,
    // ]);
    // setSearchResults(uniqueCourseMembersSearched);

    const courseSearched = await getMembersFromCourseCode(searchText);
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
    const searchObject = formatCourseSearchResults(
      courseSearched.courseId,
      courseSearched.courseName
    );
    // resultsRef.current = {
    //   [courseSearched.courseId]: {
    //     ...searchObject,
    //     ...courseSearched,
    //   },
    //   ...resultsRef.current,
    // };
    setSearchResults((prevState) => {
      return {
        [courseSearched.courseId]: {
          ...searchObject,
          ...courseSearched,
        },
        ...prevState,
      };
    });
  };

  const formatCourseSearchResults = (courseId, courseName) => {
    let buttonLabel = 'add';
    const buttonAction = (id) => {
      addAllToNewParticipants(id);
      console.log('resultsRef.current[id]');
      console.log(resultsRef.current[id]);
      resultsRef.current[id].buttonLabel === 'add'
        ? (buttonLabel = 'remove')
        : (buttonLabel = 'remove');
    };
    return {
      label: courseName,
      buttonLabel,
      onClick: buttonAction,
      key: courseId,
    };
  };

  const addAllToNewParticipants = (courseId) => {
    // if (!searchResults.length) return;
    // ⬇️ used for members, now we use courses
    // searchResults.forEach((mem) =>
    //   addParticipant({ user: { _id: mem._id, username: mem.username } })
    // );
    console.group('add all');
    console.log(`courseId: ${courseId}`);
    console.log('searchResults[courseId]');
    console.log(searchResults[courseId]);
    console.log('searchResults');
    console.log(searchResults);
    console.log('resultsRef.current');
    console.log(resultsRef.current);
    console.groupEnd();

    if (
      resultsRef.current[courseId] &&
      resultsRef.current[courseId].courseMembers
    )
      resultsRef.current[courseId].courseMembers.forEach((mem) =>
        addParticipant({
          user: { _id: mem._id, username: mem.username, role: mem.accountType },
        })
      );
  };

  const addParticipant = (member) => {
    const { _id } = member.user;
    // filter out duplicates in the right column (New Participants column)
    console.groupCollapsed('addParticipant');
    console.log('member');
    console.log(member);
    console.log('newParticipants');
    console.log(newParticipants);
    console.groupEnd();
    if (newParticipants.find((mem) => _id === mem.user._id)) return;
    setNewParticipants((prevState) =>
      [...prevState, { ...member }].sort((a, b) =>
        a.user.username.localeCompare(b.user.username)
      )
    );
  };

  const removeMember = (mem) => {
    setNewParticipants((prevState) =>
      prevState.filter(({ user }) => user._id !== mem.user._id)
    );

    // add mem back to the search results list?

    /**
     * ways to add mem back to search results list
     * 1. track if current search yielded a result, if so add mem back
     *  -> what if removed mem came from another search?
     * 2. keep all search results in an object:
     * {[userId]: ['productive-search', 'results-array']}
     */

    // eslint-disable-next-line no-restricted-syntax
    for (const user of initialSearchResults) {
      if (user._id === mem.user._id) {
        setSearchText((prevState) => prevState);
        // setSearchResults((prevState) =>
        //   [...prevState, user].sort((a, b) =>
        //     a.username.localeCompare(b.username)
        //   )
        // );
        break;
      }
    }
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
              <div>
                <Search
                  _search={(text) => {
                    setSearchText(text);
                    // search(text);
                  }}
                  data-testid="CourseCodeMemberImportModal-search"
                  placeholder="enter a course code"
                />
              </div>
              {Object.values(searchResults).length > 0 && (
                <GenericSearchResults
                  itemsSearched={Object.values(searchResults)}
                />
              )}
            </div>
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
                  // <i className="fas fa-trash-alt" style={{ fontSize: '20px' }} />
                ))}
              </div>
            </InfoBox>
          </div>
        )}
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
