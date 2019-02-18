import React, { Component } from "react";
import { connect } from "react-redux";
import { updateUserResource } from "../store/actions/";
import { CommunityLayout } from "../Layout";
import API from "../utils/apiRequests";
const SKIP_VALUE = 20;
class Community extends Component {
  state = {
    visibleResources: [],
    skip: 0,
    criteria: "",
    moreAvailable: true,
    filters: {
      privacySetting: "",
      roomType: ""
    }
  };
  allResources = [];

  componentDidMount() {
    let { resource } = this.props.match.params;
    // @TODO WHen should we refresh this data. Here we're saying:
    // if there aren't fift result then we've probably only loaded the users
    // own courses. This is assuming that the database will have more than 50 courses and rooms
    // MAYBE conside having and upToDate flag in resoure that tracks whether we've requested this recently
    // if (Object.keys(this.props[resource]).length < 50 && !this.state.upToDate) {
    this.fetchData(resource);
    // }
    // else {
    let resourceList = this.props[`${resource}Arr`].map(
      id => this.props[resource][id]
    );
    this.setState({ visibleResources: resourceList });
    this.allResources = resourceList;
    // }
  }

  componentDidUpdate(prevProps, prevState) {
    const { resource } = this.props.match.params;
    if (prevProps.match.params.resource !== resource) {
      this.setState({ skip: 0, criteria: "", moreAvailable: true }, () =>
        this.fetchData(resource)
      );
    } else if (prevState.criteria !== this.state.criteria) {
      this.fetchData(resource);
    } else if (prevState.skip !== this.state.skip) {
      let concat = true;
      this.fetchData(resource, concat);
    }
  }
  // concat tells us whether we should concat to existing results or overwrite
  fetchData = (resource, concat) => {
    let { criteria, skip, filters } = this.state;
    API.searchPaginated(resource, criteria, skip, filters).then(res => {
      console.log(res);
      if (res.data.results.length < SKIP_VALUE) {
        if (concat) {
          this.setState(prevState => ({
            visibleResources: [...prevState.visibleResources].concat(
              res.data.results
            )
          }));
        } else {
          this.setState({
            moreAvailable: false,
            visibleResources: res.data.results
          });
        }
      } else if (concat) {
        this.setState(prevState => ({
          visibleResources: [...prevState.visibleResources].concat(
            res.data.results
          )
        }));
      } else this.setState({ visibleResources: res.data.results });
    });
  };

  setCriteria = criteria => {
    this.setState({ criteria, skip: 0, moreAvailable: true });
  };

  setSkip = () => {
    this.setState(prevState => ({
      skip: prevState.skip + SKIP_VALUE
    }));
  };

  toggleFilter = (filter, clearAll) => {
    if (clearAll) {
      return this.setState({ filters: { privactSetting: "", roomType: "" } });
    } else {
      let updatedFilters = { ...this.state.filters };
      if (filter === "public" || filter === "private") {
        updatedFilters.privacySetting = filter;
      } else if (filter === "desmos" || filter === "geogebra") {
        updatedFilters.roomType = filter;
      }
      this.setState({ filters: updatedFilters }, () => {
        setTimeout(this.fetchData(this.props.match.params.resource, false), 0);
      });
    }
  };

  render() {
    let linkPath;
    let linkSuffix;
    // @ TODO conditional logic for displaying room in dahsboard if it belongs to the user
    if (this.props.match.params.resource === "courses") {
      linkPath = "/myVMT/courses/";
      linkSuffix = "/rooms";
    } else if (this.props.match.params.resource === "rooms") {
      linkPath = "/myVMT/rooms/";
      linkSuffix = "/details";
    } else {
      linkPath = "/myVMT/workspace/";
      linkSuffix = "/activity";
    }
    return (
      <CommunityLayout
        visibleResources={this.state.visibleResources}
        resource={this.props.match.params.resource}
        linkPath={linkPath}
        linkSuffix={linkSuffix}
        setSkip={this.setSkip}
        setCriteria={this.setCriteria}
        moreAvailable={this.state.moreAvailable}
        filters={this.state.filters}
        toggleFilter={this.toggleFilter}
      />
    );
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
    userId: store.user._id
  };
};

export default connect(
  mapStateToProps,
  { updateUserResource }
)(Community);
