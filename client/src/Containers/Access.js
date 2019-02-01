import { connect } from "react-redux";
import {
  requestAccess,
  grantAccess,
  clearError,
  joinWithCode
} from "../store/actions";
import PrivateAccessModal from "../Components/UI/Modal/PrivateAccess";

const mapStateToProps = (store, ownProps) => ({
  error: store.loading.errorMessage
});

export default connect(
  mapStateToProps,
  { requestAccess, grantAccess, joinWithCode, clearError }
)(PrivateAccessModal);
