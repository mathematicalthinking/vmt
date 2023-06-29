import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SelectionList, Search, Checkbox } from '../../../Components';
import API from '../../../utils/apiRequests';
import classes from '../create.css';

// import classes from '../create.css';
class Copy extends Component {
  state = {
    activityList: [],
    searchResults: [],
    searchText: '',
    isChecked: false,
  };
  componentDidMount() {
    API.get('activities').then((res) => {
      const activties = res.data.results;
      activties.sort((a, b) => {
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
    const { activityList, searchResults, searchText, isChecked } = this.state;
    const { userId } = this.props;
    const results = searchText.length ? searchResults : activityList;
    if (isChecked) {
      return results.filter(
        (currentActivity) => userId === currentActivity.creator
      );
    }
    return results;
  };

  render() {
    const { isChecked } = this.state;
    const { selectedActivities, addActivity } = this.props;
    return (
      <React.Fragment>
        <div className={classes.SearchWrapper}>
          <Search
            data-testid="step2copysearch"
            _search={this._search}
            placeholder="search for existing templates"
          />
          <Checkbox
            checked={isChecked}
            change={() =>
              this.setState((prevState) => {
                return { isChecked: !prevState.isChecked };
              })
            }
            dataId="show-creator-template"
          >
            show only my templates
          </Checkbox>
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
  userId: PropTypes.string,
};

Copy.defaultProps = {
  selectedActivities: [],
  userId: '',
};
export default Copy;
