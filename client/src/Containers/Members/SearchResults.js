import React, { Component } from "react";
import { Avatar, Button } from "../../Components/";
import classes from "./members.css";
class SearchResults extends Component {
  state = {
    areResultsExpanded: false
  };

  componentDidUpdate(prevProps) {
    if (prevProps.searchText.length > 0 && this.props.searchText === 0) {
      this.setState({ areResultsExpanded: false });
    }
  }

  render() {
    let toggleExpansion = (
      <div>
        See Suggested Participants{" "}
        <Button
          click={() =>
            this.setState(prevState => ({
              areResultsExpanded: !prevState.areResultsExpanded
            }))
          }
        >
          <i className="fas fa-chevron-down" />
        </Button>
      </div>
    );
    let { usersSearched, inviteMember, searchText } = this.props;
    if (searchText.length > 0 || this.state.areResultsExpanded) {
      return (
        <ul className={classes.SearchResults}>
          <div>
            See Suggested Participants{" "}
            <Button
              click={() =>
                this.setState(prevState => ({
                  areResultsExpanded: !prevState.areResultsExpanded
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
                  <Avatar username={user.username} />{" "}
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
    } else return <ul className={classes.SearchResults}>{toggleExpansion}</ul>;
  }
}

export default SearchResults;
