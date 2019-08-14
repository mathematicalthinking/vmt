import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  // Button,
  Avatar,
  Aux,
} from '../../../Components';
import classes from './sidePanel.css';

const SidePanel = ({
  image,
  name,
  subTitle,
  alt,
  additionalDetails,
  editButton,
  editing,
  buttons,
  accountType,
  bothRoles,
}) => {
  const details = Object.keys(additionalDetails).map((key) => {
    return (
      <div key={key} className={classes.KeyContainer}>
        <span className={classes.KeyName}>{key} </span>
        <span className={classes.KeyValue}>{additionalDetails[key]}</span>
      </div>
    );
  });
  return (
    <Aux>
      <div className={classes.Top}>
        {image ? (
          <img className={classes.Image} src={image} alt={alt} />
        ) : (
          <Avatar className={classes.Image} size="large" />
        )}
        <div className={classes.Details}>
          <div className={classes.spMain}>{name}</div>
          <div className={classes.spSecondary}>{subTitle}</div>
          <div className={classes.spAdditional}>{details}</div>
          {editButton ? (
            <div className={editing ? classes.EditActive : classes.Edit}>
              {editButton}
            </div>
          ) : null}
        </div>
        <div className={classes.spButtons}>{buttons}</div>
        <div className={classes.ViewOpts} />
      </div>
      <div className={classes.Bottom}>
        {accountType === 'participant' && !bothRoles ? (
          <div className={classes.CreateForParticipant}>
            <Link to="facilitator" data-testid="become-facilitator">
              become a facilitator
            </Link>
          </div>
        ) : null}
      </div>
    </Aux>
  );
};

SidePanel.propTypes = {
  image: PropTypes.string,
  name: PropTypes.oneOfType([
    PropTypes.element.isRequired,
    PropTypes.string.isRequired,
  ]).isRequired,
  subTitle: PropTypes.oneOfType([
    PropTypes.element.isRequired,
    PropTypes.string.isRequired,
  ]).isRequired,
  alt: PropTypes.string,
  additionalDetails: PropTypes.shape({}).isRequired,
  // owner: PropTypes.bool,
  editButton: PropTypes.element,
  editing: PropTypes.bool,
  buttons: PropTypes.shape({}),
  accountType: PropTypes.oneOf(['facilitator', 'participant']),
  bothRoles: PropTypes.bool,
};

SidePanel.defaultProps = {
  image: null,
  alt: null,
  // owner: false,
  editButton: null,
  editing: false,
  accountType: null,
  buttons: null,
  bothRoles: false,
};
export default SidePanel;
