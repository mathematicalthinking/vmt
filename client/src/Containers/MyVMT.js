import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { DashboardLayout, SidePanel, ResourceList } from '../Layout/Dashboard';
import {
  TabList,
  BreadCrumbs,
  // Avatar,
} from '../Components';
import {
  getRooms,
  getActivities,
  getCourses,
  getUser,
  toggleJustLoggedIn,
} from '../store/actions';

import * as ntfUtils from '../utils/notifications';

class MyVMT extends Component {
  state = {
    tabs: [{ name: 'Rooms' }, { name: 'Courses' }, { name: 'Activities' }],
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

  // Checks if the user has mulitple roles for a single resource (i.e. facilitator and participant)
  // if so we toggle the "view as" buttons to be visible
  // checkMultipleRoles = () => {
  //   let { match, user } = this.props;
  //   let { resource } = match.params;
  //   return new Promise(resolve => {
  //     if (match.params.resource === "activities") {
  //       this.setState({ bothRoles: false, view: "facilitator" });
  //       return resolve(); // Activities are for facilitators only
  //     } else {
  //       // determine roles
  //       let isFacilitator = false;
  //       let isParticipant = false;
  //       let bothRoles = false;
  //       let view = "facilitator";
  //       if (this.props[resource]) {
  //         console.log(this.props[resource]);
  //         this.props[resource].allIds.forEach(id => {
  //           this.props[resource].byId[id].members.forEach(member => {
  //             if (member.user && member.user._id === user._id) {
  //               if (member.role === "participant" || member.role === "guest")
  //                 isParticipant = true;
  //               if (member.role === "facilitator") isFacilitator = true;
  //             }
  //           });
  //         });
  //       }
  //       // @TODO Theres some redundancy here
  //       if (isFacilitator && isParticipant) bothRoles = true;
  //       else view = isFacilitator ? "facilitator" : "participant";
  //       this.setState(
  //         {
  //           bothRoles,
  //           view
  //         },
  //         () => resolve()
  //       );
  //     }
  //   });
  // };

  // fetchByIds = (resource, ids) => {
  //   resource = resource.charAt(0).toUpperCase() + resource.slice(1);
  //   this.props[`get${resource}`](ids);
  // };

  updateTabs = () => {
    const { user } = this.props;
    const { tabs } = this.state;
    // const { resource } = this.props.match.params;
    // let { notifications } = this.props.user; // add room notifications eventually
    const updatedTabs = [...tabs];
    // let courseNtfs = courseNotifications.access.filter(ntf => { //WHY ARE WE FILTERING HERE ? WE SHOULD BE FILTERING FOR THEIR ROLE NOT THE RESOURCE ID
    //   let found = false;
    //   this.state.displayResources.forEach(resource => {
    //     if (resource._id === ntf._id) {
    //      found = true;
    //     }
    //   })
    //   return found;
    // })
    const courseNtfs = ntfUtils.getUserNotifications(
      user,
      null,
      'course',
      'MY_VMT'
    );
    const roomNtfs = ntfUtils.getUserNotifications(
      user,
      null,
      'room',
      'MY_VMT'
    );
    updatedTabs[1].notifications =
      courseNtfs.length === 0 ? '' : courseNtfs.length;
    // if (courseNotifications.newRoom.length > 0){
    //   updatedTabs[0].notifications += courseNotifications.newRoom.length;
    // }
    // let roomNtfs = roomNotifications.filter(ntf => ntf._id ===)
    updatedTabs[0].notifications = roomNtfs.length === 0 ? '' : roomNtfs.length;
    this.setState({
      tabs: updatedTabs,
    });
  };

  // Display different content depending on the user's current role
  // setDisplayResources = () => {
  //   return new Promise(resolve => {
  //     let { user, match } = this.props;
  //     let { resource } = match.params;
  //     let myActivities;
  //     if (match.params.resource === "activities") {
  //       myActivities = this.props[resource].allIds.filter(id => {
  //         if (this.props[resource].byId[id].creator === user._id) {
  //           return true;
  //         }
  //         return false;
  //       });
  //       return this.setState({ displayResources: myActivities }, () =>
  //         resolve()
  //       );
  //     }
  //     let displayResources = [];
  //     if (this.props[resource]) {
  //       displayResources = this.props[resource].allIds.filter(id => {
  //         let included = false;
  //         if (this.props[resource].byId[id].members) {
  //           this.props[resource].byId[id].members.forEach(member => {
  //             if (
  //               member.user &&
  //               member.user._id === user._id
  //               // && member.role === this.state.view
  //             ) {
  //               included = true;
  //             }
  //           });
  //           return included;
  //         }
  //         return false;
  //       });
  //     }
  //     this.setState({ displayResources }, () => resolve());
  //   });
  // };

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

    const additionalDetails = {
      courses: user.courses.length,
      rooms: user.rooms.length,
      activities: user.activities.length,
    };
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
        mainContent={
          <ResourceList
            userResources={
              user[resource]
                // eslint-disable-next-line react/destructuring-assignment
                .map(id => this.props[resource].byId[id])
                .sort((a, b) => {
                  return new Date(b.createdAt) - new Date(a.createdAt);
                }) || []
            }
            notifications={
              resource === 'courses'
                ? ntfUtils.getUserNotifications(user, null, 'course')
                : ntfUtils.getUserNotifications(user, null, 'room')
            }
            user={user}
            resource={resource}
          />
        }
        tabs={<TabList routingInfo={match} tabs={tabs} />}
      />
    );
  }
}

MyVMT.propTypes = {
  match: PropTypes.shape({}).isRequired,
  user: PropTypes.shape({}).isRequired,
};

// @NB THE LACK OF CAMEL CASE HERE IS INTENTIONAL AND ALLOWS US TO AVOID LOTS
// OF CONDITIONAL LOGIC CHECKING THE RESOURCE TYPE AND THEN GRABBING DATA BASED
// ON ITS VALUE. INSTEAD, WITH THE CURRENT METHOD WE CAN DO LIKE user[resource] or get[resource]
const mapStateToProps = store => ({
  user: store.user,
  rooms: store.rooms,
  courses: store.courses,
  activities: store.activities,
  loading: store.loading.loading,
});

export default connect(
  mapStateToProps,
  {
    getRooms,
    getActivities,
    getCourses,
    getUser,
    toggleJustLoggedIn,
  }
)(MyVMT);
