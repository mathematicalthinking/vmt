import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SelectionList } from '../../../Components';
import API from '../../../utils/apiRequests';

// import classes from '../create.css';
class Step2Copy extends Component {
  state = {
    activityList: [],
  };
  componentDidMount() {
    API.get('activities').then((res) => {
      const activties = res.data.results;
      activties.sort(function(a, b) {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
      console.log('Activities: ', activties);
      this.setState({ activityList: activties });
    });
  }
  render() {
    const { selectedActivities, addActivity } = this.props;
    const { activityList } = this.state;
    return (
      <div>
        <p>Select one or many templates to copy</p>
        <SelectionList
          listToSelectFrom={activityList}
          selectItem={addActivity}
          selected={selectedActivities}
        />
      </div>
    );
  }
}

Step2Copy.propTypes = {
  addActivity: PropTypes.func.isRequired,
  selectedActivities: PropTypes.arrayOf(PropTypes.string),
};

Step2Copy.defaultProps = {
  selectedActivities: [],
};
export default Step2Copy;
