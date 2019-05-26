/* eslint-disable react/no-did-update-set-state */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { updateUserResource } from '../store/actions';
import { CommunityLayout } from '../Layout';
import API from '../utils/apiRequests';

const SKIP_VALUE = 20;
class Community extends Component {
  state = {
    visibleResources: [],
    skip: 0,
    criteria: '',
    moreAvailable: true,
    filters: {
      privacySetting: null,
      roomType: null,
    },
  };
  allResources = [];

  componentDidMount() {
    const { match } = this.props;
    const { resource } = match.params;
    // @TODO WHen should we refresh this data. Here we're saying:
    // if there aren't fift result then we've probably only loaded the users
    // own courses. This is assuming that the database will have more than 50 courses and rooms
    // MAYBE conside having and upToDate flag in resoure that tracks whether we've requested this recently
    // if (Object.keys(this.props[resource]).length < 50 && !this.state.upToDate) {
    this.fetchData(resource);
    // }
    // else {
    // eslint-disable-next-line react/destructuring-assignment
    const resourceList = this.props[`${resource}Arr`].map(
      // eslint-disable-next-line react/destructuring-assignment
      id => this.props[resource][id]
    );
    this.setState({ visibleResources: resourceList });
    this.allResources = resourceList;
    // }
  }

  componentDidUpdate(prevProps, prevState) {
    const { match } = this.props;
    const { criteria, skip } = this.state;
    const { resource } = match.params;
    if (prevProps.match.params.resource !== resource) {
      this.setState(
        {
          skip: 0,
          criteria: '',
          moreAvailable: true,
          filters: { privactSetting: null, roomType: null },
        },
        () => this.fetchData(resource)
      );
    } else if (prevState.criteria !== criteria) {
      this.fetchData(resource);
    } else if (prevState.skip !== skip) {
      const concat = true;
      this.fetchData(resource, concat);
    }
  }
  // concat tells us whether we should concat to existing results or overwrite
  fetchData = (resource, concat) => {
    const { criteria, skip, filters } = this.state;
    API.searchPaginated(resource, criteria, skip, filters).then(res => {
      if (res.data.results.length < SKIP_VALUE) {
        if (concat) {
          this.setState(prevState => ({
            visibleResources: [...prevState.visibleResources].concat(
              res.data.results
            ),
            moreAvailable: false,
          }));
        } else {
          this.setState({
            moreAvailable: false,
            visibleResources: res.data.results,
          });
        }
      } else if (concat) {
        this.setState(prevState => ({
          visibleResources: [...prevState.visibleResources].concat(
            res.data.results
          ),
        }));
      } else this.setState({ visibleResources: res.data.results });
    });
  };

  setCriteria = criteria => {
    this.setState({ criteria, skip: 0, moreAvailable: true });
  };

  setSkip = () => {
    this.setState(prevState => ({
      skip: prevState.skip + SKIP_VALUE,
    }));
  };

  toggleFilter = (filter, clearAll) => {
    const { match } = this.props;
    const { filters } = this.state;
    let updatedFilters = { ...filters };
    if (clearAll) {
      updatedFilters = { privacySetting: null, roomType: null };
    } else {
      if (filter === 'public' || filter === 'private') {
        updatedFilters.privacySetting = filter;
      } else if (filter === 'desmos' || filter === 'geogebra') {
        updatedFilters.roomType = filter;
      }
      if (match.params.resource === 'courses') {
        updatedFilters.roomType = null;
      }
    }
    this.setState({ filters: updatedFilters }, () => {
      setTimeout(this.fetchData(match.params.resource, false), 0);
    });
  };

  render() {
    const { match, user } = this.props;
    const { visibleResources, moreAvailable, filters } = this.state;
    let linkPath;
    let linkSuffix;
    // @ TODO conditional logic for displaying room in dahsboard if it belongs to the user
    if (match.params.resource === 'courses') {
      linkPath = '/myVMT/courses/';
      linkSuffix = '/rooms';
    } else if (match.params.resource === 'rooms') {
      linkPath = '/myVMT/rooms/';
      linkSuffix = '/details';
    } else if (user.isAdmin) {
      linkPath = '/myVMT/activities/';
      linkSuffix = '/details';
    } else {
      linkPath = '/myVMT/workspace/';
      linkSuffix = '/activity';
    }
    return (
      <CommunityLayout
        visibleResources={visibleResources}
        resource={match.params.resource}
        linkPath={linkPath}
        linkSuffix={linkSuffix}
        setSkip={this.setSkip}
        setCriteria={this.setCriteria}
        moreAvailable={moreAvailable}
        filters={filters}
        toggleFilter={this.toggleFilter}
      />
    );
  }
}

Community.propTypes = {
  courses: PropTypes.shape({}).isRequired,
  // coursesArr: PropTypes.arrayOf(PropTypes.string).isRequired,
  activities: PropTypes.shape({}).isRequired,
  // activitiesArr: PropTypes.arrayOf(PropTypes.string).isRequired,
  rooms: PropTypes.shape({}).isRequired,
  // roomsArr: PropTypes.PropTypes.arrayOf(PropTypes.string).isRequired,
  user: PropTypes.shape({}).isRequired,
  match: PropTypes.shape({}).isRequired,
  connectUpdateUserResource: PropTypes.shape({}).isRequired,
};

const mapStateToProps = store => {
  return {
    courses: store.courses.byId,
    coursesArr: store.courses.allIds,
    activities: store.activities.byId,
    activitiesArr: store.activities.allIds,
    rooms: store.rooms.byId,
    roomsArr: store.rooms.allIds,
    user: store.user,
  };
};

export default connect(
  mapStateToProps,
  { connectUpdateUserResource: updateUserResource }
)(Community);
