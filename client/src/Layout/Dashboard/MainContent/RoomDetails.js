// @TODO THIS SHOULD BE COMBINED WITH ACTIVITY DETAILS IN LAYOUT/DASHBOARD

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './roomDetails.css';
import { EditText, Error, InfoBox } from '../../../Components'; // @TODO consider combining Error and Edit Text into one component

class RoomDetails extends Component {
  render() {
    const { room, editing, updateRoomInfo, instructions, loading } = this.props;
    const { updateFail, updateKeys } = loading;
    return (
      <div className={classes.Container}>
        {/*  Make sure we have all of the room info before letting the user enter */}
        <InfoBox
          icon={<i className="fas fa-info-circle" />}
          title="Instructions"
        >
          <Error error={updateFail && updateKeys.indexOf('instructions') > -1}>
            <EditText
              inputType="text-area"
              name="instructions"
              editing={editing}
              change={updateRoomInfo}
            >
              {instructions || 'No instructions set yet'}
            </EditText>
          </Error>
        </InfoBox>
        <InfoBox title="In The Room Now" icon={<i className="fas fa-users" />}>
          {room.currentMembers ? room.currentMembers.length : 0}
        </InfoBox>
        <InfoBox title="Tabs" icon={<i className="fas fa-folder" />}>
          {room.tabs ? room.tabs.length : 0}
        </InfoBox>
        <InfoBox title="Messages" icon={<i className="fas fa-comments" />}>
          {room.chat ? room.chat.length : 0}
        </InfoBox>
      </div>
    );
  }
}

RoomDetails.propTypes = {
  room: PropTypes.shape({}).isRequired,
  editing: PropTypes.bool.isRequired,
  updateRoomInfo: PropTypes.func.isRequired,
  instructions: PropTypes.string,
  loading: PropTypes.bool.isRequired,
};

RoomDetails.defaultProps = {
  instructions: null,
};
export default RoomDetails;
