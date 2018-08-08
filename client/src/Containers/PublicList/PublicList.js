import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/';
import BoxList from '../../Layout/BoxList/BoxList';
import Search from '../../Components/Search/Search';
import classes from './publicList.css';
let allResources = [];

class PublicList extends Component {
  state = {
    visibleResources: [],
    resource: '',
  }

  componentDidUpdate(prevProps, prevState) {
      // if resource changed see if we need to fetch the data
    const resource = this.props.match.params.resource;
    const resourceList = this.props[`${resource}Arr`].map(id => this.props[resource][id])
    if (prevProps.match.params.resource !== resource) {
      if (resourceList.length === 0) {
        this.fetchData(resource);
      }
      // if we already have the data just set the state
      else {this.setState({visibleResources: resourceList})}
    }
    // if rooms/courses updated from redux
    if (prevProps[resource] !== this.props[resource]) {
      this.setState({visibleResources: resourceList})
    }
  }

  componentDidMount() {
    const resource = this.props.match.params.resource;
    if (Object.keys(this.props[resource]).length === 0) {
      this.fetchData(resource);
    }
    else {
      const resourceList = this.props[`${resource}Arr`].map(id => this.props[resource][id])
      this.setState({visibleResources: resourceList})
    }
  }

  fetchData = resource => {
    if (resource === 'courses') this.props.getCourses();
    else this.props.getRooms();
  }


  filterResults = value => {
    value = value.toLowerCase();
    console.log(value)
    console.log(this.state.resources)
    const updatedResources = allResources.filter(resource => (
      resource.name.toLowerCase().includes(value) ||
      resource.description.toLowerCase().includes(value)
    ));
    console.log(updatedResources)
    this.setState({visibleResources: updatedResources})

  }
  render () {
    let linkPath; let linkSuffix;
    // @ TODO conditional logic for displaying room in dahsboard if it belongs to the user
    if (this.props.match.params.resource === 'courses' && this.props.coursesArr.length > 0) {
      linkPath = '/dashboard/course/';
      linkSuffix = '/rooms'
    } else if (this.props.roomsArr.length > 0){
      linkPath = '/dashboard/room/';
      linkSuffix = '/summary';
    }
    return (
      <div>
        <h2>{this.props.match.params.resource}</h2>
        <Search _filter={value => this.filterResults(value)} />
        <div className={classes.Seperator}></div>
        {/* @ TODO Eventually remove dashboard...we want to have a public facing view
        that does not show up in  the dashboard. */}
        <BoxList
          list={this.state.visibleResources}
          resource={this.props.match.params.resource}
          linkPath={linkPath}
          linkSuffix={linkSuffix}
        />
      </div>
    )
  }
}

const mapStateToProps = store => {
  return {
    rooms: store.rooms.byId,
    roomsArr: store.rooms.allIds,
    courses: store.courses.byId,
    coursesArr: store.courses.allIds,
  }
}
const mapDispatchToProps = dispatch => {
  return {
    getRooms: () => dispatch(actions.getRooms()),
    getCourses: () => dispatch(actions.getCourses())
  }
}

export default connect(mapStateToProps, mapDispatchToProps,)(PublicList);
