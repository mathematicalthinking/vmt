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
  }
  // static getDerivedStateFromProps(nextProps, prevState) {
  //   console.log('next resource: ', nextProps.match.params.resource)
  //   console.log('prevState.resource: ', prevState.resource)
  //   const resource = nextProps.match.params.resource;
  //   console.log(nextProps[resource])
  //   if (resource !== prevState.resource && nextProps[resource].length > 0){
  //     console.log('setting state from props')
  //     allResources = nextProps[resource];
  //     return {resource: resource, resources: nextProps[resource]}
  //   } else return null;
  // }

  componentDidMount() {
    console.log('public list mounted ', this.props)
    const resource = this.props.match.params.resource;
    // get the rooms
    if (Object.keys(this.props.courses).length === 0 && (resource === 'courses')){
      console.log('getting courses')
      this.props.getCourses();
    }
    if (Object.keys(this.props.rooms).length === 0 && (resource === 'rooms')){
      this.props.getRooms();
    }
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
    let linkPath; let resourceList; let linkSuffix;
    // @ TODO conditional logic for displaying room in dahsboard if it belongs to the user
    if (this.props.match.params.resource === 'courses' && this.props.coursesArr.length > 0) {
      linkPath = (this.state.resource === 'rooms') ? '/dashboard/room/' : '/dashboard/course/';
      linkSuffix = (this.state.resource === 'rooms') ? '/summary' : '/rooms'
      resourceList = this.props.coursesArr.map(id => this.props.courses[id])
    } else {

    }
    return (
      <div>
        <h2>{this.props.match.params.resource}</h2>
        <Search _filter={value => this.filterResults(value)} />
        <div className={classes.Seperator}></div>
        {/* @ TODO Eventually remove dashboard...we want to have a public facing view
        that does not show up in  the dashboard. */}
        <BoxList
          list={resourceList}
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
    rooms: store.rooms.rooms,
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
