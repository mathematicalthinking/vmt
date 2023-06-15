import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SelectionList, Search } from '../../../Components';
import API from '../../../utils/apiRequests';
import classes from '../create.css';

// import classes from '../create.css';
class Copy extends Component {
  state = {
    activityList: [],
    searchResults: [],
    searchText: '',
  };
  componentDidMount() {
    API.get('activities').then((res) => {
      const activties = res.data.results;
      // eslint-disable-next-line func-names
      activties.sort(function(a, b) {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
      this.setState({ activityList: activties });
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
    const { activityList, searchResults, searchText } = this.state;
    // searchResults.length ? searchResults : activityList
    if (searchText.length === 0) {
      return activityList;
    }
    return searchResults;
  };

  render() {
    const { selectedActivities, addActivity } = this.props;
    return (
      <React.Fragment>
        <div className={classes.SearchWrapper}>
          <Search
            data-testid="step2copysearch"
            _search={this._search}
            placeholder="search for existing templates"
          />
        </div>
        <div>
          <p>Select one or many templates to copy</p>
          <SelectionList
            listToSelectFrom={this.displayResults()}
            selectItem={addActivity}
            selected={selectedActivities}
          />
        </div>
      </React.Fragment>
    );
  }
}

Copy.propTypes = {
  addActivity: PropTypes.func.isRequired,
  selectedActivities: PropTypes.arrayOf(PropTypes.string),
};

Copy.defaultProps = {
  selectedActivities: [],
};
export default Copy;
