import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useUIState } from 'utils';
import { Spinner, SelectionList, Search, Checkbox } from '../../../Components';
import API from '../../../utils/apiRequests';
import classes from '../create.css';

// import classes from '../create.css';
const Copy = (props) => {
  const { addActivity, selectedActivities, userId } = props;
  const [loadedTemplates, setLoadedTemplates] = useUIState(
    'use-existing-templates',
    []
  );
  const [activityList, setActivityList] = useState(loadedTemplates || []);
  const [searchResults, setSearchResults] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    myTemplates: false,
    grade6: false,
    grade7: false,
    grade8: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // if we already have loadedTemplates, ignore API call
    if (loadedTemplates.length) {
      setIsLoading(false);
      return;
    }
    API.get('activities').then((res) => {
      const activities = res.data.results;
      activities.sort((a, b) => {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
      setActivityList(activities);
      setIsLoading(false);
      // store activityList in uiState
      setLoadedTemplates(activities);
    });
  }, []);
  useEffect(() => {
    displayResults();
  }, [filters]);

  // add filteredSearchResults & setSearchResults in a useEffect
  // that runs when searchText changes
  const _search = (searchTextInput) => {
    // create a function to search activity list
    // we want to search on activity.name
    const filteredSearchResults = activityList.filter((currentActivity) => {
      return currentActivity.name
        .toLowerCase()
        .includes(searchText.toLowerCase());
    });
    setSearchResults(filteredSearchResults);
    setSearchText(searchTextInput);
  };

  // This function gets the search results and filters them based on the user's filters.
  const displayResults = () => {
    const results = searchText.length ? searchResults : activityList;

    const filteredResults = results.filter((currentActivity) => {
      if (filters.myTemplates === true) {
        // If the "My Templates" filter is enabled, then we only return activities that were created by the current user.
        return (
          currentActivity.creator === userId &&
          // The activity must also be in the user's grade level.
          (filters.grade6 === false ||
            (currentActivity.tags[0] &&
              currentActivity.tags[0].gradeLevel === 6)) &&
          (filters.grade7 === false ||
            (currentActivity.tags[0] &&
              currentActivity.tags[0].gradeLevel === 7)) &&
          (filters.grade8 === false ||
            (currentActivity.tags[0] &&
              currentActivity.tags[0].gradeLevel === 8))
        );
      }
      // If the "My Templates" filter is not enabled, then we only return activities that match the selected grade level(s).
      return (
        (filters.grade6 === false ||
          (currentActivity.tags[0] &&
            currentActivity.tags[0].gradeLevel === 6)) &&
        (filters.grade7 === false ||
          (currentActivity.tags[0] &&
            currentActivity.tags[0].gradeLevel === 7)) &&
        (filters.grade8 === false ||
          (currentActivity.tags[0] && currentActivity.tags[0].gradeLevel === 8))
      );
    });

    return filteredResults;
  };

  const filterResults = (_event, selectedFilter) => {
    setFilters((prevState) => ({
      ...prevState,
      [selectedFilter]: !prevState[selectedFilter],
    }));
  };

  return (
    <React.Fragment>
      {/* <div className={classes.SearchWrapper}>
        <Search
          data-testid="step2copysearch"
          _search={_search}
          placeholder="search for existing templates"
          customStyle={{ width: '65%', padding: '0 30px' }}
        />
        <div className={classes.CheckboxFilters}>
          <Checkbox
            checked={filters.myTemplates}
            change={filterResults}
            dataId="myTemplates"
            style={{
              background: '#75b7f6',
              color: 'white',
              paddingLeft: '10px',
            }}
          >
            show only my templates
          </Checkbox>
          <Checkbox
            checked={filters.grade6}
            change={filterResults}
            dataId="grade6"
            style={{
              background: '#75b7f6',
              color: 'white',
              paddingLeft: '10px',
            }}
          >
            show Grade 6 templates
          </Checkbox>
          <Checkbox
            checked={filters.grade7}
            change={filterResults}
            dataId="grade7"
            style={{
              background: '#75b7f6',
              color: 'white',
              paddingLeft: '10px',
            }}
          >
            show Grade 7 templates
          </Checkbox>
          <Checkbox
            checked={filters.grade8}
            change={filterResults}
            dataId="grade8"
            style={{
              background: '#75b7f6',
              color: 'white',
              paddingLeft: '10px',
            }}
          >
            show Grade 8 templates
          </Checkbox>
        </div>
      </div> */}
      <div>
        {isLoading ? (
          <Spinner />
        ) : (
          <React.Fragment>
            <p>Select one or many templates to copy</p>
            <SelectionList
              listToSelectFrom={displayResults()}
              selectItem={addActivity}
              selected={selectedActivities}
            />
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  );
};

Copy.propTypes = {
  addActivity: PropTypes.func.isRequired,
  selectedActivities: PropTypes.arrayOf(PropTypes.string),
  userId: PropTypes.string,
};

Copy.defaultProps = {
  selectedActivities: [],
  userId: '',
};
export default Copy;
