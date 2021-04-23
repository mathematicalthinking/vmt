import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SelectionList, Aux } from '../../../Components';
import API from '../../../utils/apiRequests';

// import classes from '../create.css';
class Step2Copy extends Component {
  state = {
    activityList: [],
  };
  componentDidMount() {
    API.get('activities').then((res) => {
      this.setState({ activityList: res.data.results });
    });
  }
  render() {
    const { selectedActivities, addActivity } = this.props;
    const { activityList } = this.state;
    return (
      <Aux>
        <p>Select one or many templates to copy</p>
        <SelectionList
          listToSelectFrom={activityList}
          selectItem={addActivity}
          selected={selectedActivities}
        />
      </Aux>
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
