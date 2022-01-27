/* eslint-disable no-console */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '../Components/UI/Button/Button';
import SidePanel from '../Layout/Dashboard/SidePanel/SidePanel';
import BreadCrumbs from '../Components/Navigation/BreadCrumbs/BreadCrumbs';
import SearchResults from './Members/SearchResults';
import { Search, Member, EditText, ToolTip, Error } from '../Components';
import API from '../utils/apiRequests';
import { updateUser, updateUserSettings } from '../store/actions';
import { suggestUniqueUsername } from '../utils/validators';
// import MainContent from '../Layout/Dashboard/MainContent/';
import DashboardLayout from '../Layout/Dashboard/Dashboard';

class Profile extends Component {
  constructor(props) {
    super(props);
    const { user } = this.props;
    this.state = {
      username: user.username || null,
      name: user.name || null,
      // email: user.email || null,
      editing: false,
      searchText: '',
      searchResults: [],
      admins: [],
      editError: '',
    };
  }

  componentDidMount() {
    API.get('user', { isAdmin: true })
      .then((res) => {
        this.setState({
          admins: res.data.results.map((user) => ({
            username: user.username,
            _id: user._id,
          })),
        });
      })
      .catch(() => {});
  }

  toggleEdit = () => {
    const { user } = this.props;
    const { editing } = this.state;
    if (editing) {
      this.setState(() => ({
        username: user.username,
        editError: '',
      }));
    }
    this.setState((prevState) => ({
      editing: !prevState.editing,
    }));
  };

  search = (text) => {
    const { user } = this.props;
    const { admins } = this.state;
    if (text.length > 0) {
      API.search('user', text, [user._id], admins)
        .then((res) => {
          const searchResults = res.data.results;
          this.setState({
            searchResults,
            searchText: text,
          });
        })
        .catch((err) => {
          console.log('err: ', err);
        });
    } else {
      this.setState({ searchResults: [], searchText: text });
    }
  };

  updateUserInfo = (event, option) => {
    const { value, name } = event.target;
    this.setState({ [name]: option || value });
  };

  updateUser = async () => {
    const { connectUpdateUserInfo, user } = this.props;
    const { username } = this.state;
    // code to conditionally restrict username changes from email only
    // if (user.username !== username && user.email === user.username) {
    const emailRegex = /\S+@\S+\.\S+/;
    if (user.username === username) {
      this.toggleEdit();
    } else if (emailRegex.test(username)) {
      this.setState({ editError: 'New username cannot be an email' });
    } else {
      const newUsername = await suggestUniqueUsername(username);
      console.log('New: ', username, ' ... Suggested: ', newUsername);
      if (newUsername !== username) {
        this.setState({
          editError: `Username not available, available suggestion: ${newUsername}`,
        });
      } else {
        connectUpdateUserInfo(user._id, { username });
        this.setState({
          editing: false,
          editError: '',
        });
      }
    }
    // }
  };

  makeAdmin = (userId) => {
    const { admins } = this.state;
    API.put('user', userId, { isAdmin: true })
      .then((res) => {
        const { username, _id } = res.data;
        this.setState({ admins: [...admins, { username, _id }] });
      })
      .catch((err) => {
        console.log('err making admin: ', err);
      });
  };

  render() {
    const { user, connectUpdateUser, loading } = this.props;
    const { updateFail, updateKeys } = loading;
    const {
      admins,
      searchResults,
      searchText,
      editing,
      username,
      name,
      editError,
      // email,
    } = this.state;
    const mainContent = (
      <div>
        {user.isAdmin ? (
          <Fragment>
            <h3>Admins</h3>
            <div data-testid="admin-list">
              {admins.map((admin) => (
                <Member
                  info={admin}
                  key={admin._id}
                  resourceName="application"
                />
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
      username: (
        <Error error={updateFail && updateKeys.indexOf('username') > -1}>
          <EditText
            change={this.updateUserInfo}
            inputType="text"
            name="username"
            editing={user.email === user.username && editing}
            // editing={editing}
          >
            {username}
          </EditText>
        </Error>
      ),
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
        tabs={<span />}
        mainContent={mainContent}
        breadCrumbs={
          <BreadCrumbs crumbs={[{ title: 'Profile', link: '/profile' }]} />
        }
        sidePanel={
          <SidePanel
            image={user.profilePic}
            name={
              <Error error={updateFail && updateKeys.indexOf('name') > -1}>
                <EditText
                  name="name"
                  editing={false}
                  inputType="title"
                  change={() => {}}
                >
                  {name}
                </EditText>
              </Error>
            }
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
                  data-testid="edit-user"
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
                  <Fragment>
                    {editError && <p>{editError}</p>}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                      }}
                    >
                      <Button
                        click={this.updateUser}
                        data-testid="save-user"
                        theme="Small"
                      >
                        Save
                      </Button>
                      <Button click={this.toggleEdit} theme="Cancel">
                        Cancel
                      </Button>
                    </div>
                  </Fragment>
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
  loading: PropTypes.shape({}).isRequired,
  connectUpdateUser: PropTypes.func.isRequired,
  connectUpdateUserInfo: PropTypes.func.isRequired,
};

const mapStateToProps = (store) => ({
  user: store.user,
  loading: store.loading,
});

export default connect(
  mapStateToProps,
  { connectUpdateUser: updateUser, connectUpdateUserInfo: updateUserSettings }
)(Profile);
