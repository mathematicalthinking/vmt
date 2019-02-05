import React, { Component } from "react";
import classes from "./makeRooms.css";
import { Checkbox } from "../../../Components";
class ParticipantList extends Component {
  render() {
    let { list, selectedParticipants, select } = this.props;
    return list.map((participant, i) => {
      let rowClass =
        i % 2 === 0
          ? [classes.EvenParticipant, classes.Participant].join(" ")
          : classes.Participant;
      rowClass = selectedParticipants.includes(participant.user._id)
        ? [rowClass, classes.Selected].join(" ")
        : rowClass;
      return (
        <div
          className={rowClass}
          key={participant.user._id}
          id={participant.user._id}
        >
          <Checkbox
            label={`${i + 1}. ${participant.user.username}`}
            change={select}
            dataId={participant.user._id}
            checked={selectedParticipants.indexOf(participant.user._id) > -1}
          >
            {`${i + 1}. ${participant.user.username}`}
          </Checkbox>
        </div>
      );
    });
  }
}

export default ParticipantList;
