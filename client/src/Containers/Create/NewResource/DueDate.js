import React, { Component } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker-cssmodules.css";
import classes from "../create.css";

class DueDate extends Component {
  datePicker = React.createRef();

  componentDidMount() {
    // this.datePicker.current.focus()
  }

  render() {
    return (
      <div className={classes.DateContainer}>
        <h3>Select a Due Date (optional)</h3>
        <DatePicker
          startOpen
          autoFocus
          selected={this.props.dueDate}
          onChange={this.props.selectDate}
          popperPlacement="bottom-left"
          shouldCloseOnSelect={false}
        />
      </div>
    );
  }
}
export default DueDate;
