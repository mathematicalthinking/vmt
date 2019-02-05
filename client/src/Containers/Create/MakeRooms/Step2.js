import React, { Component } from "react";
import classes from "./makeRooms.css";
import { Button, Search } from "../../../Components";
import { ParticipantList } from "./";
import API from "../../../utils/apiRequests";
// import SearchResults from "../../Members/SearchResults";
class Step2 extends Component {
  state = {
    searchResults: [],
    selectedParticipants: []
  };

  componentDidUpdate(prevProps) {
    // Add users to the selected list so we can persist them after we start a new a search
    // Perhpas this would be a good time to deriveStateFromProps since...that's what we're doing
    if (
      prevProps.selectedParticipants.length <
      this.props.selectedParticipants.length
    ) {
      let selectedUser = this.state.searchResults.filter(user =>
        this.props.selectedParticipants.find(
          userId => user._id.toString() === userId
        )
      );
      this.setState({
        selectedParticipants: this.state.selectedParticipants.concat(
          selectedUser
        )
      });
      // REmove users who have been de-selected
    } else if (
      prevProps.selectedParticipants.length >
      this.props.selectedParticipants.length
    ) {
      let updatedSelected = this.state.selectedParticipants.filter(user => {
        return this.props.selectedParticipants.find(
          userId => user._id === userId
        );
      });
      this.setState({ selectedParticipants: updatedSelected });
    }
  }

  search = text => {
    if (text.length > 0) {
      API.search(
        "user",
        text,
        [this.props.userId].concat(this.props.selectedParticipants) // Exclude myself and already selected members from th search
      )
        .then(res => {
          let searchResults = res.data.results;
          this.setState({ searchResults });
        })
        .catch(err => {
          console.log("err: ", err);
        });
    } else {
      this.setState({ searchResults: [] });
    }
  };

  render() {
    let { selectedParticipants, select, submit, done } = this.props;
    let uniqueIds = [];
    let list = this.state.selectedParticipants
      .map(member => ({ user: member }))
      .concat(this.state.searchResults.map(member => ({ user: member })))
      .filter(member => {
        if (uniqueIds.find(id => id === member.user._id)) {
          return false;
        } else {
          uniqueIds.push(member.user._id);
          return true;
        }
      });

    return (
      <div className={classes.Container}>
        <h2 className={classes.Title}>Assign To Rooms</h2>
        <div className={classes.SubContainer}>
          <Search
            theme={"Dark"}
            data-testid="member-search"
            _search={this.search}
            placeholder="search by username or email address"
          />
        </div>
        <div className={classes.ParticipantList}>
          <ParticipantList
            list={list}
            selectedParticipants={selectedParticipants}
            select={select}
          />
        </div>
        <div className={classes.Buttons}>
          <Button m={5} click={submit} data-testid="assign-rooms">
            assign
          </Button>
        </div>
      </div>
    );
  }
}

export default Step2;
