import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { TabTypes } from 'Components';
import classes from '../create.css';

const Step2New = (props) => {
  const { roomType, setRoomType } = props;
  return (
    <Fragment>
      <p style={{ marginBottom: 10 }}>Select a workspace type</p>
      <div className={classes.RadioButtons}>
        <TabTypes.RadioButtons onClick={setRoomType} checked={roomType} />
      </div>
    </Fragment>
  );
};

Step2New.propTypes = {
  roomType: PropTypes.string.isRequired,
  setRoomType: PropTypes.func.isRequired,
};

export default Step2New;
