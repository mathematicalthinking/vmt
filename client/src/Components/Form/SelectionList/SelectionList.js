import React, { Component } from 'react';
import Checkbox from '../Checkbox/Checkbox';
import classes from './selectionList.css';
import API from '../../../utils/apiRequests';
class SelectionList extends Component {

  state = {
    list: []
  }
  componentDidMount() {
    if (this.props.list === 'activities') {  
      API.get('activities')
      .then(res => {
        this.setState({list: res.data.results})
      })
    }
  }
  
  render() {
    let list = this.state.list.map((activity, i) => {
      return <li className={[classes.ListItem, i%2 ? classes.Odd : null].join(' ')}key={activity._id}>
        <Checkbox change={(event) => {this.props.selectItem(event, activity._id)}}>{activity.name}</Checkbox>
      </li>
    })
    return (
      <ul className={classes.List}>{list}</ul>
    )
  }
}

export default SelectionList;