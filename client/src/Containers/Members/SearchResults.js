import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Button } from '../../Components';
import classes from './members.css';

class SearchResults extends Component {
  state = {
    areResultsExpanded: false,
  };

  componentDidUpdate(prevProps) {
    const { searchText } = this.props;
    if (prevProps.searchText.length > 0 && searchText === 0) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ areResultsExpanded: false });
    }
  }

  render() {
    const { usersSearched, inviteMember, searchText } = this.props;
    const { areResultsExpanded } = this.state;
    const toggleExpansion = (
      <div>
        See Suggested Participants{' '}
        <Button
          click={() =>
            this.setState(prevState => ({
              areResultsExpanded: !prevState.areResultsExpanded,
            }))
          }
        >
          <i className="fas fa-chevron-down" />
        </Button>
      </div>
    );
    if (searchText.length > 0 || areResultsExpanded) {
      return (
        <ul className={classes.SearchResults}>
          <div>
            See Suggested Participants{' '}
            <Button
              click={() =>
                this.setState(prevState => ({
                  areResultsExpanded: !prevState.areResultsExpanded,
                }))
              }
            >
              <i className="fas fa-chevron-down" />
            </Button>
          </div>
          {usersSearched.map(user => {
            return (
              <li className={classes.SearchResItem} key={user._id}>
                <div className={classes.FlexRow}>
                  <Avatar username={user.username} />{' '}
                  <span className={classes.Email}>{user.email}</span>
                </div>
                <Button
                  data-testid={`invite-member-${user.username}`}
                  click={() => {
                    inviteMember(user._id, user.username);
                  }}
                >
                  Add
                </Button>
              </li>
            );
          })}
        </ul>
      );
    }
    return <ul className={classes.SearchResults}>{toggleExpansion}</ul>;
  }
}

SearchResults.propTypes = {
  usersSearched: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  inviteMember: PropTypes.func.isRequired,
  searchText: PropTypes.string.isRequired,
};
export default SearchResults;
