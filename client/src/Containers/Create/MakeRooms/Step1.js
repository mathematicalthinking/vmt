/* eslint-disable no-console */
/* eslint-disable react/no-did-update-set-state */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import SearchResults from 'Containers/Members/SearchResults';
import API from 'utils/apiRequests';
import { Button, InfoBox, Search, Member } from 'Components';
import DueDate from '../DueDate';
import classes from './makeRooms.css';

class Step1 extends Component {
  state = {
    searchResults: [],
    searchText: '',
    currentParticipants: [...this.props.participants],
  };

  search = (text) => {
    const { userId } = this.props;
    const { currentParticipants } = this.state;
    if (text.length > 0) {
      API.search(
        'user',
        text,
        [userId].concat(currentParticipants.map((p) => p.user._id)) // Exclude myself and already selected members from th search
      )
        .then((res) => {
          const searchResults = res.data.results.filter(
            (user) => user.accountType !== 'temp'
          );
          this.setState({ searchResults, searchText: text });
        })
        .catch((err) => {
          console.log('err: ', err);
        });
    } else {
      this.setState({ searchResults: [], searchText: text });
    }
  };

  addParticipant = (_id, username) => {
    this.setState((prevState) => ({
      searchResults: prevState.searchResults.filter((user) => user._id !== _id),
      currentParticipants: [
        ...prevState.currentParticipants,
        { user: { _id, username } },
      ],
    }));
  };

  goNext = () => {
    const { setParticipants, nextStep } = this.props;
    const { currentParticipants } = this.state;
    setParticipants(currentParticipants);
    nextStep();
  };

  render() {
    const { dueDate, setDueDate, course } = this.props;
    const { currentParticipants, searchText, searchResults } = this.state;

    return (
      <div className={classes.Container}>
        <DueDate dueDate={dueDate} selectDate={setDueDate} />
        {!course && (
          <InfoBox
            title="Add Participants"
            icon={<i className="fas fa-user-plus" />}
          >
            <Fragment>
              <Search
                data-testid="member-search"
                _search={this.search}
                placeholder="search existing VMT users by username or email address"
              />
              {searchResults.length > 0 ? (
                <SearchResults
                  searchText={searchText}
                  usersSearched={searchResults}
                  inviteMember={this.addParticipant}
                />
              ) : null}
            </Fragment>
          </InfoBox>
        )}
        <InfoBox title="Participants" icon={<i className="fas fa-users" />}>
          <div
            data-testid="members"
            style={{ overflowY: 'scroll', maxHeight: '300px' }}
          >
            {currentParticipants.map((member) => (
              <Member
                info={member}
                key={member.user._id}
                resourceName="template"
              />
            ))}
          </div>
        </InfoBox>
        <div className={classes.ModalButton}>
          <Button m={5} click={this.goNext} data-testid="next-step-assign">
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
  course: PropTypes.string,
  participants: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setParticipants: PropTypes.func.isRequired,
};

Step1.defaultProps = {
  dueDate: null,
  course: null,
};
export default Step1;
