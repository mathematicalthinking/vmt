import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actions';
import BoxList from '../../Layout/BoxList/BoxList';
import Search from '../../Components/Search/Search';
import classes from './publicList.css';

class PublicList extends Component {
  state = {
    visibleResources: [],
    resource: '',
  };
  allResources = [];
  componentDidUpdate(prevProps, prevState) {
    // if resource changed see if we need to fetch the data
    const { resource } = this.props.match.params;
    const resourceList = this.props[`${resource}Arr`].map(
      (id) => this.props[resource][id]
    );
    if (prevProps.match.params.resource !== resource) {
      if (resourceList.length < 50) {
        this.fetchData(resource);
      }
      // if we already have the data just set the state
      else {
        this.setState({ visibleResources: resourceList });
      }
    }
    // if rooms/courses updated from redux
    if (prevProps[resource] !== this.props[resource]) {
      this.setState({ visibleResources: resourceList });
    }
    this.allResources = resourceList;
  }

  componentDidMount() {
    const { resource } = this.props.match.params;
    // @TODO WHen should we refresh this data. Here we're saying:
    // if there aren't fift result then we've probably only loaded the users
    // own courses. This is assuming that the database will have more than 50 courses and rooms
    // MAYBE conside having and upToDate flag in resoure that tracks whether we've requested this recently
    if (Object.keys(this.props[resource]).length < 50 && !this.state.upToDate) {
      this.fetchData(resource);
    } else {
      const resourceList = this.props[`${resource}Arr`].map(
        (id) => this.props[resource][id]
      );
      this.setState({ visibleResources: resourceList });
      this.allResources = resourceList;
    }
  }

  fetchData = (resource) => {
    if (resource === 'courses') this.props.getCourses();
    else this.props.getRooms();
  };

  filterResults = (value) => {
    value = value.toLowerCase();
    const updatedResources = this.allResources.filter((resource) => {
      return (
        resource.name.toLowerCase().includes(value) ||
        resource.description.toLowerCase().includes(value)
      );
    });
    this.setState({ visibleResources: updatedResources });
  };
  render() {
    let linkPath;
    let linkSuffix;
    // @ TODO conditional logic for displaying room in dahsboard if it belongs to the user
    if (this.props.match.params.resource === 'courses') {
      linkPath = '/profile/courses/';
      linkSuffix = '/rooms';
    } else {
      linkPath = '/profile/rooms/';
      linkSuffix = '/details';
    }
    return (
      <div>
        <h2>{this.props.match.params.resource}</h2>
        <Search _filter={(value) => this.filterResults(value)} />
        <div className={classes.Seperator} />
        {/* @ TODO Eventually remove dashboard...we want to have a public facing view
        that does not show up in  the dashboard. */}
        <BoxList
          list={this.state.visibleResources}
          resource={this.props.match.params.resource}
          linkPath={linkPath}
          linkSuffix={linkSuffix}
        />
      </div>
    );
  }
}

const mapStateToProps = (store) => {
  return {
    rooms: store.rooms.byId,
    roomsArr: store.rooms.allIds,
    courses: store.courses.byId,
    coursesArr: store.courses.allIds,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    getRooms: () => dispatch(actions.getRooms()),
    getCourses: () => dispatch(actions.getCourses()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PublicList);
