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

  const displayResults = () => {
    const results = searchText.length ? searchResults : activityList;

    const filteredResults = [];
    if (filters.myTemplates) {
      filteredResults.push(
        ...results.filter(
          (currentActivity) => userId === currentActivity.creator
        )
      );
    }
    if (filters.grade6) {
      filteredResults.push(
        ...results.filter((currentActivity) => {
          const { tags } = currentActivity;
          return tags[0] && tags[0].gradeLevel && tags[0].gradeLevel === 6;
        })
      );
    }
    if (filters.grade7) {
      filteredResults.push(
        ...results.filter((currentActivity) => {
          const { tags } = currentActivity;
          return tags[0] && tags[0].gradeLevel && tags[0].gradeLevel === 7;
        })
      );
    }
    if (filters.grade8) {
      filteredResults.push(
        ...results.filter((currentActivity) => {
          const { tags } = currentActivity;
          return tags[0] && tags[0].gradeLevel && tags[0].gradeLevel === 8;
        })
      );
    }
    return Object.values(filters).every((filter) => filter === false)
      ? results
      : filteredResults;
  };

  const filterResults = (event, selectedFilter) => {
    setFilters((prevState) => ({
      ...prevState,
      [selectedFilter]: !prevState[selectedFilter],
    }));
  };

  return (
    <React.Fragment>
      <div className={classes.SearchWrapper}>
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
      </div>
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
