/* eslint-disable react/no-did-update-set-state */
import React, { Component, Fragment } from 'react';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { AdminDashboardLayout } from '../Layout';
import { socket } from 'utils';
import API from '../utils/apiRequests';
import Modal from '../Components/UI/Modal/Modal';
import Button from '../Components/UI/Button/Button';
import ModalClasses from '../Components/UI/Modal/modal.css';

const SKIP_VALUE = 20;
class Dashboard extends Component {
  _isOkToLoadResults = false;
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
      userToManage: null,
      manageUserAction: null,
      isLoading: false,
    };
    this.debounceFetchData = debounce(() => this.fetchData(), 1000);
    this.debouncedSetCriteria = debounce((criteria) => {
      const filters = this.getQueryParams();
      filters.search = criteria;
      this.setQueryParams(filters);
    }, 700);
  }

  componentDidMount() {
    this._isOkToLoadResults = true;
    const { match, history } = this.props;
    const { resource } = match.params;

    const allowedResources = ['rooms', 'users'];

    if (allowedResources.indexOf(resource) === -1) {
      history.push('/dashboard/rooms');
      return;
    }

    this.fetchData();
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
          visibleResources: [],
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

  componentWillUnmount() {
    this._isOkToLoadResults = false;
    this.debounceFetchData.cancel();
    this.debouncedSetCriteria.cancel();
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

    this.setState({ isLoading: true });
    API.getRecentActivity(resource, updatedFilters.search, skip, updatedFilters)
      .then((res) => {
        this.setState({ isLoading: false });
        const [items, totalCounts] = res.data.results;

        const moreAvailable = items.length >= SKIP_VALUE;
        if (this._isOkToLoadResults) {
          this.setState((prevState) => ({
            visibleResources: concat
              ? [...prevState.visibleResources].concat(items)
              : items,
            moreAvailable,
            totalCounts,
          }));
        }
      })
      .catch((err) => this.setState({ isLoading: false }));
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

  _buttonAction = (apiAction, userId, update) => {
    return apiAction()
      .then((res) => {
        const { user, username } = res.data;

        // API actions return different values if successful,
        // so allow for a couple of possibilities.
        if (user || username) {
          this.updateVisibleResource(userId, update);
        }
        this.stopManageUser();
      })
      .catch((err) => {
        this.stopManageUser();
        // eslint-disable-next-line no-console
        console.log({ err });
      });
  };

  logoutUser = (userId) =>
    this._buttonAction(() => API.revokeRefreshToken(userId), userId, {
      socketId: null,
    });

  suspendUser = (userId) =>
    this._buttonAction(() => API.suspendUser(userId), userId, {
      isSuspended: true,
    });

  reinstateUser = (userId) =>
    this._buttonAction(() => API.reinstateUser(userId), userId, {
      isSuspended: false,
    });

  removeAsAdmin = (userId) => {
    const { user } = this.props;
    console.log('about to force logout', userId, user._id);
    socket.emit('FORCE_LOGOUT', userId, user._id);
    this._buttonAction(() => API.removeAsAdmin(userId), userId, {
      isAdmin: false,
      socketId: null,
    });
  };

  makeAdmin = (userId) => {
    const { user } = this.props;
    console.log('about to force logout', userId, user._id);
    socket.emit('FORCE_LOGOUT', userId, user._id);
    this._buttonAction(() => API.makeAdmin(userId), userId, {
      isAdmin: true,
      socketId: null,
    });
  };

  updateVisibleResource = (itemId, update) => {
    const { visibleResources } = this.state;

    const updated = visibleResources.map((resource) => {
      if (resource._id !== itemId) {
        return resource;
      }
      return { ...resource, ...update };
    });

    this.setState({ visibleResources: updated });
  };

  manageUser = (user, actionType) => {
    this.setState({
      userToManage: user,
      manageUserAction: actionType,
    });
  };

  stopManageUser = () => {
    this.setState({
      userToManage: null,
      manageUserAction: null,
    });
  };

  _getIconActions = (details, resource, isSelf) => {
    if (resource !== 'users') return [];
    const suspendReinstateAction = details.isSuspended
      ? {
          iconClass: 'fas fa-undo',
          title: 'Reinstate User',
          testid: 'reinstate',
          color: 'green',
          onClick: () => {
            this.manageUser(details, 'reinstateUser');
          },
        }
      : {
          iconClass: 'fas fa-ban',
          title: 'Suspend User',
          testid: 'suspend',
          color: 'red',
          onClick: () => {
            this.manageUser(details, 'suspendUser');
          },
        };

    const forceLogoutAction = {
      iconClass: 'fas fa-power-off',
      title: 'Force Logout',
      testid: 'force-logout',
      onClick: () => {
        this.manageUser(details, 'logoutUser');
      },
    };

    const makeRemoveAdmin = details.isAdmin
      ? {
          iconClass: 'fas fa-minus',
          title: 'Remove as Admin',
          testid: 'remove-as-admin',
          onClick: () => {
            this.manageUser(details, 'removeAsAdmin');
          },
        }
      : {
          iconClass: 'fas fa-plus',
          title: 'Make into Admin',
          testid: 'make-as-admin',
          onClick: () => {
            this.manageUser(details, 'makeAdmin');
          },
        };

    const iconActions = [];
    if (details.socketId && !details.doForceLogout)
      iconActions.push(forceLogoutAction);
    if (!isSelf) iconActions.push(suspendReinstateAction, makeRemoveAdmin);
    return iconActions;
  };

  render() {
    const { match, user } = this.props;
    const {
      visibleResources,
      moreAvailable,
      searchText,
      totalCounts,
      dateRangePreset,
      customSinceDate,
      customToDate,
      userToManage,
      manageUserAction,
      isLoading,
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
    let manageUserPrompt = null;
    if (userToManage && manageUserAction) {
      const { username } = userToManage;
      const actionMessageHash = {
        logoutUser: `Are you sure you want to manually logout ${username}?`,
        reinstateUser: `Are you sure you want to reinstate ${username}?`,
        suspendUser: `Are you sure you want to suspend ${username}. They will not be able to use VMT until they are reinstated.`,
        removeAsAdmin: `Are you sure you want to remove ${username} as an Admin?`,
        makeAdmin: `Are you sure you want to give ${username} Admin privileges?`,
      };
      manageUserPrompt = actionMessageHash[manageUserAction];
    }
    return (
      <Fragment>
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
          setToDate={this.setToDate}
          dateRangePreset={dateRangePreset}
          customSinceDate={customSinceDate}
          customToDate={customToDate}
          manageUser={this.manageUser}
          ownUserId={user._id}
          isLoading={isLoading}
          getIconActions={this._getIconActions}
        />
        <Modal show={userToManage !== null} closeModal={this.stopManageUser}>
          {manageUserPrompt}
          <div className={ModalClasses.Row}>
            <Button
              data-testid={manageUserAction}
              click={() => {
                this[manageUserAction](userToManage._id);
              }}
              m={5}
            >
              Yes
            </Button>
            <Button
              data-testid="cancel-manage-user"
              click={this.stopManageUser}
              theme="Cancel"
              m={5}
            >
              Cancel
            </Button>
          </div>
        </Modal>
      </Fragment>
    );
  }
}

Dashboard.propTypes = {
  courses: PropTypes.shape({}).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  activities: PropTypes.shape({}).isRequired,
  rooms: PropTypes.shape({}).isRequired,
  user: PropTypes.shape({ _id: PropTypes.string }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({ resource: PropTypes.string }),
    url: PropTypes.string,
  }).isRequired,
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

export default connect(mapStateToProps, null)(Dashboard);
