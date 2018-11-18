import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateUserResource } from '../store/actions/';
import { CommunityLayout } from '../Layout';
import API from '../utils/apiRequests';

class Community extends Component {
  state = {
    visibleResources: [],
    resource: '',
    selecting: this.props.match.params.action === 'selecting',
    selectCount: 0,
  }
  allResources = [];

  componentDidUpdate(prevProps, prevState) {
      // if resource changed see if we need to fetch the data
    const { resource, action } = this.props.match.params;
    // const resourceList = this.props[`${resource}Arr`].map(id => this.props[resource][id])
    if (prevProps.match.params.resource !== resource) {
      console.log('resource changed')
      this.fetchData(resource);
    }
    // if rooms/courses updated from redux
    // if (prevProps[resource] !== this.props[resource]) {
    //   this.setState({visibleResources: resourceList})
    // }
    if (prevProps.match.params.action !== action) {
      this.setState({selecting: action === 'selecting'})
    }
    // this.allResources = resourceList;
  }

  componentDidMount() {
    let { resource, action } = this.props.match.params;
    // @TODO WHen should we refresh this data. Here we're saying:
    // if there aren't fift result then we've probably only loaded the users
    // own courses. This is assuming that the database will have more than 50 courses and rooms
    // MAYBE conside having and upToDate flag in resoure that tracks whether we've requested this recently
    // if (Object.keys(this.props[resource]).length < 50 && !this.state.upToDate) {
      this.fetchData(resource);
    // }
    // else {
      let resourceList = this.props[`${resource}Arr`].map(id => this.props[resource][id])
      this.setState({visibleResources: resourceList})
      this.allResources = resourceList;
    // }
    this.setState({selecting: action})
  }

  fetchData = resource => {
    console.log('fetching data')
    // if (resource === 'courses') this.props.getCourses();
    // else if (resource === 'rooms') this.props.getRooms();
    // else this.props.getActivities();
    // WE DONT WANT TO CLUTTER THE REDUX STORE WITH THIS DATA 
    API.get(resource)
    .then(res => {
      this.setState({visibleResources: res.data.results})
    })
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

  select = (id) => {
    this.props.updateUserResource('activities', id, this.props.userId)
    this.setState(prevState => ({selectCount: prevState.selectCount + 1}))
  }
  render () {
    let linkPath; let linkSuffix;
    // @ TODO conditional logic for displaying room in dahsboard if it belongs to the user
    if (this.props.match.params.resource === 'courses') {
      linkPath = '/myVMT/courses/';
      linkSuffix = '/rooms'
    } else if(this.props.match.params.resource === 'rooms') {
      linkPath = '/myVMT/rooms/';
      linkSuffix = '/details';
    } else {
      linkPath = '/myVMT/activities/';
      linkSuffix = '/details';
    }
    return (
        <CommunityLayout 
          visibleResources={this.state.visibleResources} 
          resource={this.props.match.params.resource}
          linkPath={linkPath}
          linkSuffix={linkSuffix}
          selecting={this.state.selecting}
          select={this.select}
          selectCount={this.state.selectCount}
        />
    )
  }
}

const mapStateToProps = store => {
  return {
    courses: store.courses.byId,
    coursesArr: store.courses.allIds,
    activities: store.activities.byId,
    activitiesArr: store.activities.allIds,
    rooms: store.rooms.byId,
    roomsArr: store.rooms.allIds,
    userId: store.user._id,
  }
}

export default connect(mapStateToProps, {updateUserResource})(Community);
