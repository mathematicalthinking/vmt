import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

import Button from '../Components/UI/Button/Button';
import SidePanel from '../Layout/Dashboard/SidePanel/SidePanel';
import BreadCrumbs from '../Components/Navigation/BreadCrumbs/BreadCrumbs';
import SearchResults from '../Containers/Members/SearchResults';
import Search from '../Components/Search/Search';
import Member from '../Components/UI/Member/Member';
import API from '../utils/apiRequests';
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
    if (text.length > 0) {
      API.search('user', text, [this.props.user._id], this.state.admins)
        .then(res => {
          let searchResults = res.data.results;
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
    console.log('user id: ', userId);

    API.put('user', userId, { isAdmin: true }).then(res => {
      let { username, _id } = res.data;
      this.setState({ admins: [...this.state.admins, { username, _id }] });
    });
  };

  render() {
    const { user } = this.props;

    const mainContent = (
      <div>
        {this.props.user.isAdmin ? (
          <Fragment>
            <h3>Admins</h3>
            <div data-testid="admin-list">
              {this.state.admins.map(admin => (
                <Member info={admin} />
              ))}
            </div>
            <h3>Create Admins</h3>
            <Search
              data-testid="member-search"
              _search={this.search}
              placeholder="search by username or email address"
            />
            {this.state.searchResults.length > 0 ? (
              <SearchResults
                searchText={this.state.searchText}
                usersSearched={this.state.searchResults}
                inviteMember={this.makeAdmin}
              />
            ) : null}
          </Fragment>
        ) : null}
      </div>
    );
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
