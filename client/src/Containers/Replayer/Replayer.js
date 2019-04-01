import React from "react";
import { connect } from "react-redux";
import { populateRoom } from "../../store/actions/";
import SharedReplayer from "./SharedReplayer";
const mapStateToProps = (state, ownProps) => {
  return {
    room: state.rooms.byId[ownProps.match.params.room_id],
    user: state.user,
    loading: state.loading.loading
  };
};

export default connect(
  mapStateToProps,
  { populateRoom }
)(SharedReplayer);
