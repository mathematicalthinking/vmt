import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker-cssmodules.css';
import classes from './create.css';

class DueDate extends Component {
  datePicker = React.createRef();

  componentDidMount() {
    // this.datePicker.current.focus()
  }

  render() {
    const { dueDate, selectDate } = this.props;
    return (
      <div className={classes.DateContainer}>
        <h3>Select a Due Date (optional)</h3>
        <DatePicker
          startOpen
          autoFocus
          selected={dueDate}
          onChange={selectDate}
          popperPlacement="bottom"
          shouldCloseOnSelect={false}
        />
      </div>
    );
  }
}

DueDate.propTypes = {
  dueDate: PropTypes.instanceOf(Date),
  selectDate: PropTypes.func.isRequired,
};

DueDate.defaultProps = {
  dueDate: null,
};
export default DueDate;
