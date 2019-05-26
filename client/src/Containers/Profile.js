/* eslint-disable no-console */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '../Components/UI/Button/Button';
import SidePanel from '../Layout/Dashboard/SidePanel/SidePanel';
import BreadCrumbs from '../Components/Navigation/BreadCrumbs/BreadCrumbs';
import SearchResults from './Members/SearchResults';
import { Search, Member, EditText, ToolTip } from '../Components';
import API from '../utils/apiRequests';
import { updateUser } from '../store/actions';
// import MainContent from '../Layout/Dashboard/MainContent/';
import DashboardLayout from '../Layout/Dashboard/Dashboard';

class Profile extends Component {
  state = {
    editing: false,
    searchText: '',
    searchResults: [],
    admins: [],
  };

  componentDidMount() {
    API.get('user', { isAdmin: true }).then(res => {
      this.setState({
        admins: res.data.results.map(user => ({
          username: user.username,
          _id: user._id,
        })),
      });
    });
  }

  toggleEdit = () => {
    this.setState(prevState => ({
      editing: !prevState.editing,
    }));
  };

  search = text => {
    const { user } = this.props;
    const { admins } = this.state;
    if (text.length > 0) {
      API.search('user', text, [user._id], admins)
        .then(res => {
          const searchResults = res.data.results;
          this.setState({
            searchResults,
            searchText: text,
          });
        })
        .catch(err => {
          console.log('err: ', err);
        });
    } else {
      this.setState({ searchResults: [], searchText: text });
    }
  };

  makeAdmin = userId => {
    const { admins } = this.state;
    API.put('user', userId, { isAdmin: true })
      .then(res => {
        const { username, _id } = res.data;
        this.setState({ admins: [...admins, { username, _id }] });
      })
      .catch(err => {
        console.log('err making admin: ', err);
      });
  };

  render() {
    const { user, connectUpdateUser } = this.props;
    const { admins, searchResults, searchText, editing } = this.state;
    const mainContent = (
      <div>
        {user.isAdmin ? (
          <Fragment>
            <h3>Admins</h3>
            <div data-testid="admin-list">
              {admins.map(admin => (
                <Member info={admin} key={admin} />
              ))}
            </div>
            <h3>Create Admins</h3>
            <Search
              data-testid="member-search"
              _search={this.search}
              placeholder="search by username or email address"
            />
            {searchResults.length > 0 ? (
              <SearchResults
                searchText={searchText}
                usersSearched={searchResults}
                inviteMember={this.makeAdmin}
              />
            ) : null}
          </Fragment>
        ) : null}
      </div>
    );

    const additionalDetails = {
      email: user.email,
    };

    if (user.isAdmin) {
      additionalDetails['Admin Mode'] = (
        <ToolTip
          text="admin mode allows you to enter rooms anonymously"
          delay={1000}
        >
          <EditText
            inputType="radio"
            editing
            change={() =>
              connectUpdateUser({
                inAdminMode: !user.inAdminMode,
              })
            }
            options={['On', 'Off']}
            name="adminMode"
          >
            {user.inAdminMode ? 'On' : 'Off'}
          </EditText>
        </ToolTip>
      );
    }
    return (
      <DashboardLayout
        mainContent={mainContent}
        breadCrumbs={
          <BreadCrumbs crumbs={[{ title: 'Profile', link: '/profile' }]} />
        }
        sidePanel={
          <SidePanel
            image={user.profilePic}
            name={user.username}
            subTitle={`${user.firstName} ${user.lastName}`}
            additionalDetails={additionalDetails}
            accountType={user.accountType}
            editButton={
              <Fragment>
                <div
                  role="button"
                  style={{
                    display: editing ? 'none' : 'block',
                  }}
                  data-testid="edit-course"
                  onClick={this.toggleEdit}
                  onKeyPress={this.toggleEdit}
                  tabIndex="-1"
                >
                  <span>
                    Edit User Info <i className="fas fa-edit" />
                  </span>
                </div>
                {editing ? (
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

Profile.propTypes = {
  user: PropTypes.shape({}).isRequired,
  connectUpdateUser: PropTypes.func.isRequired,
};

const mapStateToProps = store => ({
  user: store.user,
});

export default connect(
  mapStateToProps,
  { connectUpdateUser: updateUser }
)(Profile);
