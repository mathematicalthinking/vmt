/* eslint-disable no-console */
/* eslint-disable react/no-did-update-set-state */
// @TODO: this component is in desperate need ofa refacotr. It
// seems to be unnecessarily duplicating its parent's state
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './makeRooms.css';
import { Button, Search } from '../../../Components';
import { ParticipantList } from '.';
import API from '../../../utils/apiRequests';
// import SearchResults from "../../Members/SearchResults";
class Step2 extends Component {
  state = {
    searchResults: [],
    nominatedParticipants: [], // nominated as opposed to selectedParticipants (which we get from props) when we
  };

  componentDidUpdate(prevProps) {
    const { selectedParticipants } = this.props;
    const { searchResults, nominatedParticipants } = this.state;
    // Add users to the selected list so we can persist them after we start a new a search
    // Perhpas this would be a good time to deriveStateFromProps since...that's what we're doing
    // this seems bad actualy...we're duplicating parent state here...we ashould just rename this local state
    // parent state = paritcipants we're confirmed are being adding to the room. this component's state = staging
    if (prevProps.selectedParticipants.length < selectedParticipants.length) {
      const selectedUser = searchResults.filter(user =>
        selectedParticipants.find(userId => user._id.toString() === userId)
      );
      this.setState({
        nominatedParticipants: nominatedParticipants.concat(selectedUser),
      });
      // REmove users who have been de-selected
    } else if (
      prevProps.selectedParticipants.length > selectedParticipants.length
    ) {
      const updatedNominated = nominatedParticipants.filter(user => {
        return selectedParticipants.find(userId => user._id === userId);
      });
      this.setState({ nominatedParticipants: updatedNominated });
    }
  }

  search = text => {
    const { selectedParticipants, userId } = this.props;
    if (text.length > 0) {
      API.search(
        'user',
        text,
        [userId].concat(selectedParticipants) // Exclude myself and already selected members from th search
      )
        .then(res => {
          const searchResults = res.data.results;
          this.setState({ searchResults });
        })
        .catch(err => {
          console.log('err: ', err);
        });
    } else {
      this.setState({ searchResults: [] });
    }
  };

  render() {
    const { selectedParticipants, select, submit } = this.props;
    const { nominatedParticipants, searchResults } = this.state;
    const uniqueIds = [];
    const list = nominatedParticipants
      .map(member => ({ user: member }))
      .concat(searchResults.map(member => ({ user: member })))
      .filter(member => {
        if (uniqueIds.find(id => id === member.user._id)) {
          return false;
        }
        uniqueIds.push(member.user._id);
        return true;
      });

    return (
      <div className={classes.Container}>
        <h2 className={classes.Title}>Assign To Rooms</h2>
        <div className={classes.SubContainer}>
          <Search
            theme="Dark"
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

Step2.propTypes = {
  userId: PropTypes.string.isRequired,
  selectedParticipants: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  select: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
};

export default Step2;
