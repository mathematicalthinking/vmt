import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Checkbox from '../Checkbox/Checkbox';
import classes from './selectionList.css';
import API from '../../../utils/apiRequests';

class SelectionList extends Component {
  state = {
    list: [],
  };
  componentDidMount() {
    const { list } = this.props;
    if (list === 'activities') {
      API.get('activities').then(res => {
        this.setState({ list: res.data.results });
      });
    }
  }

  render() {
    const { selectItem } = this.props;
    const { list } = this.state;
    const ElementList = list.map((activity, i) => {
      return (
        <li
          className={[classes.ListItem, i % 2 ? classes.Odd : null].join(' ')}
          key={activity._id}
        >
          <Checkbox
            change={event => {
              selectItem(event, activity._id);
            }}
          >
            {activity.name}
          </Checkbox>
        </li>
      );
    });
    return (
      <ul className={classes.List}>
        {list.length > 0 ? (
          ElementList
        ) : (
          <div className={classes.ErrorText}>
            There doesn&#39;t appear to be anything here yet...
          </div>
        )}
      </ul>
    );
  }
}

SelectionList.propTypes = {
  list: PropTypes.arrayOf({}).isRequired,
  selectItem: PropTypes.func.isRequired,
};

export default SelectionList;
