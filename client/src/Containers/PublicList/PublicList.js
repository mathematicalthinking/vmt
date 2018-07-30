import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/';
import BoxList from '../../Layout/BoxList/BoxList';
import Search from '../../Components/Search/Search';
import classes from './publicList.css';
let allResources = [];

class PublicList extends Component {
  state = {
    resources: [],
    resource: ''
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.resource !== prevState.resource) {
      const resource = nextProps.match.params.resource;
      allResources = nextProps[resource];
      return {resource: resource, resources: nextProps[resource]}
    }
  }

  componentDidMount() {
    // get the rooms
    if (Object.keys(this.props.rooms).length === 0){
      this.props.getCourses();
    }
    if (Object.keys(this.props.courses).length === 0){
      this.props.getRooms();
    }
  }

  filterResults = value => {
    value = value.toLowerCase();
    console.log(value)
    console.log(this.state.resources)
    const updatedResources = allResources.filter(resource => {
      console.log(resource)
      return (
        resource.name.toLowerCase().includes(value) ||
        resource.description.toLowerCase().includes(value) ||
        resource.creator.toLowerCase().includes(value)
      )
    })
    console.log(updatedResources)
    this.setState({resources: updatedResources})

  }
  render () {
    console.log(this.state.resources)
    return (
      <div>
        <h2>{this.props.match.params.resource}</h2>
        <Search filter={value => this.filterResults(value)} />
        <div className={classes.Seperator}></div>
        {/* @ TODO Eventually remove dashboard...we want to have a public facing view
        that does not show up in  the dashboard. */}
        <BoxList list={this.state.resources} resource={this.props.match.params.resource} />
      </div>
    )
  }
}

const mapStateToProps = store => {
  return {
    rooms: store.roomsReducer.rooms,
    courses: store.coursesReducer.courses,
  }
}
const mapDispatchToProps = dispatch => {
  return {
    getRooms: () => dispatch(actions.getRooms()),
    getCourses: () => dispatch(actions.getCourses())
  }
}

export default connect(mapStateToProps, mapDispatchToProps,)(PublicList);
