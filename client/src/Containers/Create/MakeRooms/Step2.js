import React, { Component } from "react";
import classes from "./makeRooms.css";
import { Button, Search } from "../../../Components";
import API from "../../../utils/apiRequests";
// import SearchResults from "../../Members/SearchResults";
class Step2 extends Component {
  state = {
    searchResults: []
  };

  search = text => {
    if (text.length > 0) {
      API.search("user", text, [this.props.userId])
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
    console.log(this.state.searchResults);
    let { participantList, nextStep } = this.props;
    return (
      <div className={classes.Container}>
        <h2 className={classes.Title}>Assign To Rooms</h2>
        <Search
          data-testid="member-search"
          _search={this.search}
          placeholder="search by username or email address"
        />
        <div className={classes.SubContainer}>
          <div className={classes.ParticipantList}>
            {/* {this.state.searchResults} */}
          </div>
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
