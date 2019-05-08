import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

import Button from '../Components/UI/Button/Button';
import SidePanel from '../Layout/Dashboard/SidePanel/SidePanel';
import BreadCrumbs from '../Components/Navigation/BreadCrumbs/BreadCrumbs';
// import MainContent from '../Layout/Dashboard/MainContent/';
import DashboardLayout from '../Layout/Dashboard/Dashboard';
class Profile extends Component {
  state = {
    editing: false,
  };

  toggleEdit = () => {
    this.setState(prevState => ({
      editing: !prevState.editing,
    }));
  };
  render() {
    const { user } = this.props;
    return (
      <DashboardLayout
        breadCrumbs={
          <BreadCrumbs crumbs={[{ title: 'Profile', link: '/profile' }]} />
        }
        sidePanel={
          <SidePanel
            image={user.profilePic}
            name={user.username}
            subTitle={`${user.firstName} ${user.lastName}`}
            additionalDetails={{
              email: user.email,
            }}
            accountType={user.accountType}
            editButton={
              <Fragment>
                <div
                  role="button"
                  style={{
                    display: this.state.editing ? 'none' : 'block',
                  }}
                  data-testid="edit-course"
                  onClick={this.toggleEdit}
                >
                  <span>
                    Edit User Info <i className="fas fa-edit" />
                  </span>
                </div>
                {this.state.editing ? (
                  // @TODO this should be a resuable component
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-around',
                    }}
                  >
                    <Button
                      click={this.updateUser}
                      data-testid="save-course"
                      theme="Small"
                    >
                      Save
                    </Button>
                    <Button click={this.toggleEdit} theme="Cancel">
                      Cancel
                    </Button>
                  </div>
                ) : null}
              </Fragment>
            }
          />
        }
      />
    );
  }
}

const mapStateToProps = store => ({
  user: store.user,
});

export default connect(
  mapStateToProps,
  null
)(Profile);
