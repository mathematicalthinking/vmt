import React from 'react';
import PropTypes from 'prop-types';
import classes from './avatar.css';
// import { Link } from 'react-router-dom';
const Avatar = props => {
  const { size, color, username } = props;
  let fontSize = 15;
  let padding = 7;
  let border = '1px solid black';
  if (size === 'small') fontSize = 10;
  else if (size === 'medium') fontSize = 25;
  else if (size === 'large') {
    padding = 28;
    fontSize = 80;
    border = '3px solid white';
  }
  return (
    <div className={classes.UserInfo}>
      {/* <Link to='/#'> eventually a link to their profile page */}
      <span className={size === 'large' ? classes.AvatarContainer : null}>
        <i
          className={['fas fa-user', classes.Avatar].join(' ')}
          style={{ fontSize, padding, border, backgroundColor: color }}
        />
        {size === 'large' ? (
          <div className={classes.AvatarOverlay}>
            <i className={['fas fa-upload', classes.CameraIcon].join(' ')} />
            <i className={['fas fa-camera', classes.CameraIcon].join(' ')} />
          </div>
        ) : null}
      </span>
      <span data-testid="avatar-name" className={classes.Username}>
        {username}
      </span>
      {/* </Link> */}
    </div>
  );
};

Avatar.propTypes = {
  size: PropTypes.string,
  color: PropTypes.string,
  username: PropTypes.string.isRequired,
};

Avatar.defaultProps = {
  size: null,
  color: null,
};
export default Avatar;
