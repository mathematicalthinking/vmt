import React, { Component } from 'react';
import { connect } from 'react-redux';
import {getCourses, getActivities} from '../store/actions/';
import { CommunityLayout } from '../Layout';

class Community extends Component {
  state = {
    visibleResources: [],
    resource: '',
  }
  allResources = [];
  componentDidUpdate(prevProps, prevState) {
      // if resource changed see if we need to fetch the data
    const resource = this.props.match.params.resource;
    const resourceList = this.props[`${resource}Arr`].map(id => this.props[resource][id])
    if (prevProps.match.params.resource !== resource) {
      if (resourceList.length < 50) {
        this.fetchData(resource);

      }
      // if we already have the data just set the state
      else {this.setState({visibleResources: resourceList})}
    }
    // if rooms/courses updated from redux
    if (prevProps[resource] !== this.props[resource]) {
      this.setState({visibleResources: resourceList})
    }
    this.allResources = resourceList;
  }

  componentDidMount() {
    const resource = this.props.match.params.resource;
    // @TODO WHen should we refresh this data. Here we're saying:
    // if there aren't fift result then we've probably only loaded the users
    // own courses. This is assuming that the database will have more than 50 courses and rooms
    // MAYBE conside having and upToDate flag in resoure that tracks whether we've requested this recently
    if (Object.keys(this.props[resource]).length < 50 && !this.state.upToDate) {
      this.fetchData(resource);
    }
    else {
      const resourceList = this.props[`${resource}Arr`].map(id => this.props[resource][id])
      this.setState({visibleResources: resourceList})
      this.allResources = resourceList;
    }
  }

  fetchData = resource => {
    if (resource === 'rooms') this.props.getRooms();
    else this.props.getActivities();
  }


  filterResults = value => {
    value = value.toLowerCase();
    const updatedResources = this.allResources.filter(resource => {
      return (
      resource.name.toLowerCase().includes(value) ||
      resource.description.toLowerCase().includes(value)
    )});
    this.setState({visibleResources: updatedResources})

  }
  render () {
    let linkPath; let linkSuffix;
    // @ TODO conditional logic for displaying room in dahsboard if it belongs to the user
    if (this.props.match.params.resource === 'courses') {
      linkPath = '/profile/courses/';
      linkSuffix = '/rooms'
    } else {
      linkPath = '/profile/rooms/';
      linkSuffix = '/summary';
    }
    return (
        <CommunityLayout {...this.props} visibleResources={this.state.visibleResources}/>
    )
  }
}

const mapStateToProps = store => {
  return {
    courses: store.courses.byId,
    coursesArr: store.courses.allIds,
    activities: store.activities.byId,
    activitiesArr: store.activities.allIds,
  }
}

export default connect(mapStateToProps, {getCourses, getActivities})(Community);
