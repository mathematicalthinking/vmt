import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Spinner, SelectionList, Search, Checkbox } from '../../../Components';
import API from '../../../utils/apiRequests';
import classes from '../create.css';

// import classes from '../create.css';
class Copy extends Component {
  state = {
    activityList: [],
    searchResults: [],
    searchText: '',
    filters: {
      myTemplates: false,
      grade6: false,
      grade7: false,
      grade8: false,
    },
    isLoading: true,
  };
  componentDidMount() {
    API.get('activities').then((res) => {
      const activties = res.data.results;
      activties.sort((a, b) => {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
      this.setState({ activityList: activties, isLoading: false });
    });
  }
  _search = (searchText) => {
    // create a function to search activity list
    // we want to search on activity.name
    const { activityList } = this.state;
    const searchResults = activityList.filter((currentActivity) => {
      return currentActivity.name
        .toLowerCase()
        .includes(searchText.toLowerCase());
    });
    this.setState({ searchResults, searchText });
  };

  displayResults = () => {
    const { activityList, searchResults, searchText, filters } = this.state;
    const { userId } = this.props;
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

  filterResults = (event, selectedFilter) => {
    this.setState(
      (prevState) => ({
        ...prevState,
        filters: {
          ...prevState.filters,
          [selectedFilter]: !prevState.filters[selectedFilter],
        },
      }),
      () => this.displayResults()
    );
  };

  render() {
    const { filters, isLoading } = this.state;
    const { selectedActivities, addActivity } = this.props;
    return (
      <React.Fragment>
        <div className={classes.SearchWrapper}>
          <Search
            data-testid="step2copysearch"
            _search={this._search}
            placeholder="search for existing templates"
            customStyle={{ width: '65%', padding: '0 30px' }}
          />
          <div className={classes.CheckboxFilters}>
            <Checkbox
              checked={filters.myTemplates}
              change={this.filterResults}
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
              change={this.filterResults}
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
              change={this.filterResults}
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
              change={this.filterResults}
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
                listToSelectFrom={this.displayResults()}
                selectItem={addActivity}
                selected={selectedActivities}
              />
            </React.Fragment>
          )}
        </div>
      </React.Fragment>
    );
  }
}

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
