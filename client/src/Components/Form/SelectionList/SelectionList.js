import React, { Component } from 'react';
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
    let list = this.state.list.map((activity) => {
      return <li key={activity._id}>{activity.name}</li>
    })
    return (
      <ul>{list}</ul>
    )
  }
}

export default SelectionList;