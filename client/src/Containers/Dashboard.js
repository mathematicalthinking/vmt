/* eslint-disable react/no-did-update-set-state */
import React, { Component } from 'react';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { AdminDashboardLayout } from '../Layout';
import API from '../utils/apiRequests';

const SKIP_VALUE = 20;
class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleResources: [],
      skip: 0,
      moreAvailable: true,
      searchText: this.getQueryParams().search || '',
      totalCounts: null,
      dateRangePreset: 'day',
      customSinceDate: null,
      customToDate: null,
    };
    this.debounceFetchData = debounce(() => this.fetchData(), 1000);
    this.debouncedSetCriteria = debounce((criteria) => {
      const filters = this.getQueryParams();
      filters.search = criteria;
      this.setQueryParams(filters);
    }, 700);
  }

  componentDidMount() {
    const { match, history } = this.props;
    const { resource } = match.params;

    const allowedResources = ['rooms', 'users'];

    if (allowedResources.indexOf(resource) === -1) {
      history.push('/dashboard/rooms');
      return;
    }
    // @TODO WHen should we refresh this data. Here we're saying:
    // if there aren't fift result then we've probably only loaded the users
    // own courses. This is assuming that the database will have more than 50 courses and rooms
    // MAYBE conside having and upToDate flag in resoure that tracks whether we've requested this recently
    // if (Object.keys(this.props[resource]).length < 50 && !this.state.upToDate) {
    this.fetchData();
    // }
    // else {

    if (resource !== 'users') {
      // eslint-disable-next-line react/destructuring-assignment
      const resourceList = this.props[`${resource}Arr`].map(
        // eslint-disable-next-line react/destructuring-assignment
        (id) => this.props[resource][id]
      );

      this.setState({ visibleResources: resourceList });
      // }
    }
  }

  componentDidUpdate(prevProps) {
    const { match, location } = this.props;
    // const { criteria, skip } = this.state;
    const { resource } = match.params;
    // when switching between resources and filters,
    // we should reset skip back to 0
    // reset search text
    if (prevProps.match.params.resource !== resource) {
      this.setState(
        {
          skip: 0,
          searchText: '',
          customSinceDate: null,
          customToDate: null,
          dateRangePreset: 'day',
        },
        () => {
          this.fetchData();
        }
      );
    } else if (location.search !== prevProps.location.search) {
      const stateHash = { skip: 0 };

      if (location.search.indexOf('search=') === -1) {
        // search query was cleared from url so search input needs to be cleared
        // happens when clicking community top bar
        stateHash.searchText = '';
      }
      this.setState(stateHash, () => {
        this.fetchData();
      });
    }
  }
  // concat tells us whether we should concat to existing results or overwrite
  fetchData = (concat = false) => {
    const { skip } = this.state;
    const {
      match: {
        params: { resource },
      },
    } = this.props;
    const filters = this.getQueryParams();
    // if filter = all we're not actually filtering...we want all
    const updatedFilters = { ...filters };
    // if (updatedFilters.roomType === 'all') {
    //   delete updatedFilters.roomType;
    // }
    // if (updatedFilters.privacySetting === 'all') {
    //   delete updatedFilters.privacySetting;
    // }
    API.getRecentActivity(
      resource,
      updatedFilters.search,
      skip,
      updatedFilters
    ).then((res) => {
      const [items, totalCounts] = res.data.results;

      const moreAvailable = items.length >= SKIP_VALUE;
      this.setState((prevState) => ({
        visibleResources: concat
          ? [...prevState.visibleResources].concat(items)
          : items,
        moreAvailable,
        totalCounts,
      }));
    });
  };

  setSkip = () => {
    this.setState(
      (prevState) => ({
        skip: prevState.skip + SKIP_VALUE,
      }),
      () => {
        this.fetchData(true);
      }
    );
  };

  toggleFilter = (filter) => {
    const filters = this.getQueryParams();
    if (filter.indexOf('last-') !== -1) {
      const split = filter.split('-');
      const unit = split[1];
      filters.since = unit;
      this.setState({ dateRangePreset: unit });
    } else if (filter === 'custom') {
      const customTo = new Date();
      const customSince = new Date();
      filters.since = customSince.getTime();
      filters.to = customTo.getTime();
      this.setState({
        dateRangePreset: 'custom',
        customToDate: customTo,
        customSinceDate: customSince,
      });
    }

    this.setQueryParams(filters);
  };

  getQueryParams = () => {
    const {
      location: { search },
    } = this.props;
    const params = new URLSearchParams(search);
    const filters = {
      since: params.get('since') || 'day',
      to: params.get('to'),
      search: params.get('search'),
    };
    return filters;
  };

  setQueryParams = (filters) => {
    const { history, match } = this.props;
    const { since, to, search } = filters;
    history.push({
      pathname: match.url,
      search: `?since=${since || 'day'}&to=${to || ''}&search=${search || ''}`,
    });
  };

  setSearchCriteria = (text) => {
    // immediately update the state so user sees what they're typing
    this.setState({ searchText: text });
    // debounce update the url so it doesn't change on each key stroke
    // only when the user is done typing
    this.debouncedSetCriteria(text);
  };

  setSinceDate = (date) => {
    let filters = this.getQueryParams();
    const ms = date.getTime();
    filters = { ...filters, since: ms };

    this.setState({ customSinceDate: date });

    this.setQueryParams(filters);
  };

  setToDate = (date) => {
    let filters = this.getQueryParams();
    const ms = date.getTime();
    filters = { ...filters, to: ms };
    this.setState({ customToDate: date });
    this.setQueryParams(filters);
  };

  render() {
    const { match } = this.props;
    const {
      visibleResources,
      moreAvailable,
      searchText,
      totalCounts,
      dateRangePreset,
      customSinceDate,
      customToDate,
    } = this.state;
    const filters = this.getQueryParams();
    let linkPath;
    let linkSuffix;
    // @ TODO conditional logic for displaying room in dahsboard if it belongs to the user
    if (match.params.resource === 'rooms') {
      linkPath = '/myVMT/rooms/';
      linkSuffix = '/details';
    } else if (match.params.resource === 'users') {
      // there's currently no interface for viewing other users' profiles
      linkPath = null;
      linkSuffix = null;
    }
    return (
      <AdminDashboardLayout
        visibleResources={visibleResources}
        resource={match.params.resource}
        linkPath={linkPath}
        searchValue={searchText}
        linkSuffix={linkSuffix}
        setSkip={this.setSkip}
        setCriteria={this.setSearchCriteria}
        moreAvailable={moreAvailable}
        filters={filters}
        toggleFilter={this.toggleFilter}
        totalCounts={totalCounts}
        setSinceDate={this.setSinceDate}
        dateRangePreset={dateRangePreset}
        customSinceDate={customSinceDate}
        customToDate={customToDate}
        setToDate={this.setToDate}
      />
    );
  }
}

Dashboard.propTypes = {
  courses: PropTypes.shape({}).isRequired,
  history: PropTypes.shape({}).isRequired,
  location: PropTypes.shape({}).isRequired,
  activities: PropTypes.shape({}).isRequired,
  rooms: PropTypes.shape({}).isRequired,
  user: PropTypes.shape({}).isRequired,
  match: PropTypes.shape({}).isRequired,
};

const mapStateToProps = (store) => {
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
  null
)(Dashboard);
