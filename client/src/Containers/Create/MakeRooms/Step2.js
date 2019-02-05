import React, { Component } from "react";
import classes from "./makeRooms.css";
import { Button, Search } from "../../../Components";
import { ParticipantList } from "./";
import API from "../../../utils/apiRequests";
// import SearchResults from "../../Members/SearchResults";
class Step2 extends Component {
  state = {
    searchResults: []
  };

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
    let { nextStep, selectedParticipants, select } = this.props;
    console.log(selectedParticipants);
    console.log(this.state.searchResults);
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
            list={this.state.searchResults.map(member => ({ user: member }))}
            selectedParticipants={selectedParticipants}
            select={select}
          />
        </div>
        <div className={classes.Button}>
          <Button m={5} click={nextStep} data-testid="assign-rooms">
            submit
          </Button>
        </div>
      </div>
    );
  }
}

export default Step2;
