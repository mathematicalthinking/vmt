// PROPS:
// show: Boolean
// closeModal: function()
// children: jsx
// message: String (if no children display loading icon with custom message)
//

import React, { Fragment } from "react";
import gif from "./Ripple.gif";
import Backdrop from "../Backdrop/Backdrop";
import classes from "./modal.css";
const modal = props => (
  <Fragment>
    <Backdrop show={props.show} clicked={props.closeModal} />
    <div
      className={classes.Modal}
      style={{
        transform: props.show ? "translateY(-50%)" : "translateY(-150vh)",
        opacity: props.show ? "1" : "0",
        height: props.height || "auto"
      }}
    >
      {props.children ? (
        <Fragment>
          <div
            data-testid="close-modal"
            className={classes.Close}
            onClick={props.closeModal}
          >
            <i className="fas fa-times" />
          </div>
          {props.children}
        </Fragment>
      ) : (
        <Fragment>
          <div className="loader">
            <img src={gif} alt="loading" />
          </div>
          <div className={classes.Message}>{props.message}</div>
        </Fragment>
      )}
    </div>
  </Fragment>
);

export default modal;
