import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import ggbIcon from './geogebra.png';
import dsmIcon from './desmos.png';
import dsmActIcon from './desmosActivity.png';
import bothIcon from './desmosandgeogebra.png';
import ToolTip from '../../../ToolTip/ToolTip';
import classes from './icons.css';

const Icons = ({ lock, listType, roomType, image }) => {
  let lockIcon;
  let roomTypeIcon;
  if (lock && listType === 'public') {
    lockIcon = (
      <ToolTip text="private" delay={600}>
        <i className={['fas fa-lock', classes.Locked].join(' ')} />
      </ToolTip>
    );
  } else if (lock && listType === 'private') {
    lockIcon = (
      <ToolTip text="private" delay={600}>
        <i className={['fas fa-unlock-alt', classes.Unlocked].join(' ')} />
      </ToolTip>
    );
  } else {
    lockIcon = (
      <ToolTip text="public" delay={600}>
        <i className={['fas fa-globe-americas', classes.Globe].join(' ')} />
      </ToolTip>
    );
  }

  const desImageAndToolTip = (
    <ToolTip text="Desmos" delay={600}>
      <div className={classes.Icon}>
        <img width={25} src={dsmIcon} alt="dsm" />
      </div>
    </ToolTip>
  );

  const desActImageAndToolTip = (
    <ToolTip text="DesmosActivity" delay={600}>
      <div className={classes.Icon}>
        <img width={25} src={dsmActIcon} alt="dsm" />
      </div>
    </ToolTip>
  );

  const ggbImageAndToolTip = (
    <ToolTip text="GeoGebra" delay={600}>
      <div className={classes.Icon}>
        <img width={28} src={ggbIcon} alt="ggb" />
      </div>
    </ToolTip>
  );
  if (Array.isArray(roomType)) {
    let des = false;
    let ggb = false;
    let act = false;
    roomType.forEach((rmType) => {
      if (rmType === 'desmos') des = true;
      else if (rmType === 'desmosActivity') act = true;
      else ggb = true;
    });
    if (ggb && des) {
      roomTypeIcon = (
        <ToolTip text="GeoGebra/Desmos" delay={600}>
          <div className={classes.Icon}>
            <img width={25} src={bothIcon} alt="ggb" />
          </div>
        </ToolTip>
      );
    } else if (des) {
      roomTypeIcon = desImageAndToolTip;
    } else if (act) {
      roomTypeIcon = desActImageAndToolTip;
    } else {
      roomTypeIcon = ggbImageAndToolTip;
    }
  } else if (roomType === 'desmos') {
    roomTypeIcon = desImageAndToolTip;
  } else if (roomType === 'geogebra') {
    roomTypeIcon = ggbImageAndToolTip;
  }
  return (
    <Fragment>
      <div className={classes.Icon}>
        <img src={image} width={25} alt="" />
      </div>
      <div className={classes.Icon}>{lockIcon}</div>
      {roomTypeIcon}
    </Fragment>
  );
};

Icons.propTypes = {
  image: PropTypes.string,
  lock: PropTypes.bool.isRequired,
  listType: PropTypes.string.isRequired,
  roomType: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
};

Icons.defaultProps = {
  image: null,
  roomType: null,
};
export default Icons;
