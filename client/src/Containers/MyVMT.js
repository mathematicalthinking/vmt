import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  DashboardLayout,
  SidePanel,
  DashboardContent,
} from '../Layout/Dashboard';
import {
  TabList,
  BreadCrumbs,
  // Avatar,
} from '../Components';
// import {
//   getRooms,
//   getActivities,
//   getCourses,
//   getUser,
//   toggleJustLoggedIn,
// } from '../store/actions';

import getUserNotifications from '../utils/notifications';

class MyVMT extends Component {
  state = {
    tabs: [
      { name: 'Rooms' },
      { name: 'Courses' },
      { name: 'Activities' },
      { name: 'Monitor' },
    ],
    // touring: false,
    // displayResources: [],
    view: 'facilitator',
  };

  componentDidMount() {
    // this.fetchData(this.props.match.params.resource)
    // if (!this.props.user.justLoggedIn) {
    // this.props.getUser(this.props.user._id)
    // }
    // this.checkMultipleRoles()
    //   .then(res => this.setDisplayResources())
    //   .then(res => {
    //     this.props.toggleJustLoggedIn();
    //   });
    this.updateTabs();
  }

  componentDidUpdate(prevProps) {
    const { match, user } = this.props;
    const { resource } = match.params;

    if (
      prevProps[resource] &&
      // eslint-disable-next-line react/destructuring-assignment
      this.props[resource] &&
      // eslint-disable-next-line react/destructuring-assignment
      prevProps[resource].allIds.length !== this.props[resource].allIds.length
    ) {
      this.updateTabs();
    }
    // If the user has new notifications
    if (
      Array.isArray(prevProps.user.notifications) &&
      prevProps.user.notifications.length !== user.notifications.length
    ) {
      this.updateTabs();
    }
  }

  updateTabs = () => {
    const { user } = this.props;
    const { tabs } = this.state;
    const updatedTabs = [...tabs];
    const courseNtfs = getUserNotifications(user, null, 'course', 'MY_VMT');
    const roomNtfs = getUserNotifications(user, null, 'room', 'MY_VMT');
    updatedTabs[1].notifications =
      courseNtfs.length === 0 ? '' : courseNtfs.length;
    updatedTabs[0].notifications = roomNtfs.length === 0 ? '' : roomNtfs.length;
    this.setState({
      tabs: updatedTabs,
    });
  };

  toggleView = () => {
    const validViews = ['facilitator', 'participant'];
    const { bothRoles, view } = this.state;
    if (!bothRoles || validViews.indexOf(view) === -1) {
      return;
    }
    const newView = view === 'facilitator' ? 'participant' : 'facilitator';
    this.setState({ view: newView });
  };

  render() {
    const { user, match } = this.props;
    const { bothRoles, view, tabs } = this.state;
    const { resource } = match.params;
    // eslint-disable-next-line react/destructuring-assignment

    const additionalDetails = {
      courses: user.courses.length,
      rooms: user.rooms.length,
      activities: user.activities.length,
    };
    const resourceTypes = [
      'rooms',
      'courses',
      'activities',
      'templates',
      'monitor',
    ];
    let bodyContent = (
      <DashboardContent
        userResources={
          // simple ternary in case navigation beats props update
          user[resource]
            ? user[resource]
                // eslint-disable-next-line react/destructuring-assignment
                .map((id) => this.props[resource].byId[id])
                .sort((a, b) => {
                  return new Date(b.createdAt) - new Date(a.createdAt);
                }) || []
            : []
        }
        notifications={
          resource === 'courses'
            ? getUserNotifications(user, null, 'course')
            : getUserNotifications(user, null, 'room')
        }
        user={user}
        resource={resource}
        context="myVMT"
      />
    );
    // resource 404 error display
    if (!resourceTypes.includes(resource)) {
      bodyContent = (
        <div>
          Could not find &#39;{resource}&#39; as a resource, please check again!{' '}
        </div>
      );
    }
    return (
      <DashboardLayout
        breadCrumbs={
          <BreadCrumbs
            crumbs={[{ title: 'My VMT', link: '/myVMT/rooms' }]}
            notifications={user.notifications}
          />
        }
        sidePanel={
          <SidePanel
            image={user.profilePic}
            name={user.username}
            subTitle={`${user.firstName} ${user.lastName}`}
            additionalDetails={additionalDetails}
            accountType={user.accountType}
            bothRoles={bothRoles}
            toggleView={this.toggleView}
            view={view}
          />
        }
        mainContent={bodyContent}
        tabs={<TabList routingInfo={match} tabs={tabs} />}
      />
    );
  }
}

MyVMT.propTypes = {
  match: PropTypes.shape({}).isRequired,
  user: PropTypes.shape({
    courses: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]) // allows for an id or a populated object
    ),
    rooms: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})])
    ),
    activities: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})])
    ),
  }).isRequired,
};

// @NB THE LACK OF CAMEL CASE HERE IS INTENTIONAL AND ALLOWS US TO AVOID LOTS
// OF CONDITIONAL LOGIC CHECKING THE RESOURCE TYPE AND THEN GRABBING DATA BASED
// ON ITS VALUE. INSTEAD, WITH THE CURRENT METHOD WE CAN DO LIKE user[resource] or get[resource]
const mapStateToProps = (store) => ({
  user: { ...store.user, monitor: store.user.rooms },
  rooms: store.rooms,
  courses: store.courses,
  activities: store.activities,
  monitor: store.rooms,
  loading: store.loading.loading,
});

export default connect(mapStateToProps, {
  // getRooms,
  // getActivities,
  // getCourses,
  // getUser,
  // toggleJustLoggedIn,
})(MyVMT);
