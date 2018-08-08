// CONSIDER RENAMING THIS WHOLE COMPONENT TO DASHBOARD
// WE WOULD WANT TO RENAME THE LAYOUT CONTAINER DASHBOARD
import React, { Component } from 'react';
import DashboardLayout from '../../Layout/Dashboard/Dashboard';
// import BoxList from '../../Layout/BoxList/BoxList';
import Courses from '../Courses/Courses';
import Rooms from '../Rooms/Rooms';
// import Templates from '../../Layout/Dashboard/Templates/Templates'
// import NewResource from '../Create/NewResource/NewResource';
// import NewTemplate from '../Create/NewTemplate/NewTemplate';
// import { getUserResources } from '../../store/reducers';
import { connect } from 'react-redux';

class Profile extends Component {
  state = {
    tabs: [
      {name: 'Courses'},
      {name: 'Rooms'},
      {name: 'Templates'},
      {name: 'Settings'},
    ],
  }
  render() {
    console.log('profile rendered')
    const resource = this.props.match.params.resource;
    let content;
    console.log(resource)
    // Load content based on
    switch (resource) {
      case 'courses' : content = <Courses />; break;
      case 'rooms' : content = <Rooms />; break;
      default:
    }

    return (
      <DashboardLayout
        routingInfo={this.props.match}
        title='Profile'
        crumbs={[{title: 'Profile', link: '/profile/courses'}]}
        // sidePanelTitle={this.props.username}
        content={content}
        tabs={this.state.tabs}
      />
    )
  }
}

const mapStateToProps = store => ({
  username: store.user.username,
})
const mapDispatchToProps = dispatch => ({})


export default connect(mapStateToProps, mapDispatchToProps)(Profile);
