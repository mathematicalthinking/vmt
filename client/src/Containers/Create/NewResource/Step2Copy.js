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
    API.get('activities').then(res => {
      this.setState({ activityList: res.data.results });
    });
  }
  render() {
    const { addActivity } = this.props;
    const { activityList } = this.state;
    return (
      <Aux>
        <p>Select one or many activities to copy</p>
        <SelectionList list={activityList} selectItem={addActivity} />
      </Aux>
    );
  }
}

Step2Copy.propTypes = {
  addActivity: PropTypes.func.isRequired,
};
export default Step2Copy;
