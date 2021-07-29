/* eslint-disable no-console */
/* eslint-disable react/no-did-update-set-state */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classes from './makeRooms.css';
import DueDate from '../DueDate';
import { Button, Search } from '../../../Components';
import ParticipantList from './ParticipantList';
import API from '../../../utils/apiRequests';

class Step1 extends Component {
  state = {
    searchResults: [],
    nominatedParticipants: [], // nominated as opposed to selectedParticipants (which we get from props) when we
  };

  componentDidUpdate(prevProps, prevState) {
    const { selectedParticipants } = this.props;
    const { searchResults } = prevState;
    // Add users to the selected list so we can persist them after we start a new a search
    // Perhpas this would be a good time to deriveStateFromProps since...that's what we're doing
    // this seems bad actualy...we're duplicating parent state here...we ashould just rename this local state
    // parent state = paritcipants we're confirmed are being adding to the room. this component's state = staging
    if (prevProps.selectedParticipants.length < selectedParticipants.length) {
      const selectedUser = searchResults.filter((user) =>
        selectedParticipants.find((userId) => user._id.toString() === userId)
      );
      this.setState((previousState) => ({
        nominatedParticipants: previousState.nominatedParticipants.concat(
          selectedUser
        ),
      }));
      // Remove users who have been de-selected
    } else if (
      prevProps.selectedParticipants.length > selectedParticipants.length
    ) {
      this.setState((previousState) => ({
        nominatedParticipants: previousState.nominatedParticipants.filter(
          (user) => {
            return selectedParticipants.find((userId) => user._id === userId);
          }
        ),
      }));
    }
  }

  search = (text) => {
    const { selectedParticipants, userId } = this.props;
    if (text.length > 0) {
      API.search(
        'user',
        text,
        [userId].concat(selectedParticipants.map((p) => p.user._id)) // Exclude myself and already selected members from th search
      )
        .then((res) => {
          const searchResults = res.data.results.filter(
            (user) => user.accountType !== 'temp'
          );
          this.setState({ searchResults });
        })
        .catch((err) => {
          console.log('err: ', err);
        });
    } else {
      this.setState({ searchResults: [] });
    }
  };
  render() {
    const {
      dueDate,
      setDueDate,
      nextStep,
      course,
      selectedParticipants,
      select,
    } = this.props;
    const { nominatedParticipants, searchResults } = this.state;
    const uniqueIds = [];
    const list = nominatedParticipants
      .map((member) => ({ user: member }))
      .concat(searchResults.map((member) => ({ user: member })))
      .filter((member) => {
        if (uniqueIds.find((id) => id === member.user._id)) {
          return false;
        }
        uniqueIds.push(member.user._id);
        return true;
      });

    return (
      <div className={classes.Container}>
        <DueDate dueDate={dueDate} selectDate={setDueDate} />
        {!course && (
          <Fragment>
            <h2 className={classes.Title}>Selected Participants</h2>
            <ParticipantList
              list={selectedParticipants}
              selectedParticipants={selectedParticipants}
              select={select}
            />
          </Fragment>
        )}
        {!course && (
          <Fragment>
            <h2 className={classes.Title}>Add Participants</h2>
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
          </Fragment>
        )}
        <div className={classes.ModalButton}>
          <Button m={5} click={nextStep} data-testid="next-step-assign">
            Next
          </Button>
        </div>
      </div>
    );
  }
}

Step1.propTypes = {
  dueDate: PropTypes.instanceOf(Date),
  setDueDate: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  selectedParticipants: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  select: PropTypes.func.isRequired,
  course: PropTypes.string,
};

Step1.defaultProps = {
  dueDate: null,
  course: null,
};
export default Step1;
