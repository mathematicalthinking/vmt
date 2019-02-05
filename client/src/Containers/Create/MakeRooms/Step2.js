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
    if (
      prevProps.selectedParticipants.length <
      this.props.selectedParticipants.length
    ) {
      console.log(this.props.selectedParticipants);
      console.log(this.state.searchResults);
      let selectedUser = this.state.searchResults.filter(user =>
        this.props.selectedParticipants.find(
          userId => user._id.toString() === userId
        )
      );

      let updatedSearchResults = this.state.searchResults.filter(
        user => user._id !== selectedUser[0]._id
      );
      this.setState({
        selectedParticipants: this.state.selectedParticipants.concat(
          selectedUser
        ),
        searchResults: updatedSearchResults
      });
    }
  }

  search = text => {
    if (text.length > 0) {
      API.search(
        "user",
        text,
        [this.props.userId].concat(
          this.props.selectedParticipants.map(member => member._id) // Exclude myself and already selected members from th search
        )
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
    console.log(selectedParticipants);
    console.log(this.state.selectedParticipants);
    return (
      <div className={classes.Container}>
        <h2 className={classes.Title}>Assign To Rooms</h2>
        <div className={classes.SubContainer}>
          <Search
            data-testid="member-search"
            _search={this.search}
            placeholder="search by username or email address"
          />
        </div>
        <div className={classes.ParticipantList}>
          <ParticipantList
            list={this.state.selectedParticipants
              .map(member => ({ user: member }))
              .concat(
                this.state.searchResults.map(member => ({ user: member }))
              )}
            selectedParticipants={selectedParticipants}
            select={select}
          />
        </div>
        <div className={classes.Button}>
          <Button m={5} click={submit} data-testid="assign-rooms">
            assign
          </Button>
        </div>
        <div className={classes.Button}>
          <Button m={5} click={done} data-testid="complete-assign">
            done
          </Button>
        </div>
      </div>
    );
  }
}

export default Step2;
