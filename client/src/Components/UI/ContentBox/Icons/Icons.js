import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { TabTypes } from 'Components';
import getResourceTabTypes from 'utils/getResourceTabTypes';
import ggbIcon from './geogebra.png';
import dsmIcon from './desmos.png';
import dsmActIcon from './desmosActivity.png';
import pyretIcon from './pyretlogo.png';
import wspIcon from './gsp_app.png';
import bothIcon from './desmosandgeogebra.png';
import ToolTip from '../../../ToolTip/ToolTip';
import classes from './icons.css';

const Icons = ({ lock, listType, roomType, image }) => {
  const [lockIcon, setLockIcon] = React.useState();
  const [roomTypeIcon, setRoomTypeIcon] = React.useState();

  React.useEffect(() => {
    if (listType) setLockIcon(getLockIcon());
  }, [lock, listType]);

  React.useEffect(() => {
    if (roomType) setRoomTypeIcon(getRoomTypeIcon());
  }, [roomType]);

  const getLockIcon = () => {
    if (lock && listType === 'public') {
      return (
        <ToolTip text="private" delay={600}>
          <i className={['fas fa-lock', classes.Locked].join(' ')} />
        </ToolTip>
      );
    }
    if (lock && listType === 'private') {
      return (
        <ToolTip text="private" delay={600}>
          <i className={['fas fa-unlock-alt', classes.Unlocked].join(' ')} />
        </ToolTip>
      );
    }
    return (
      <ToolTip text="public" delay={600}>
        <i className={['fas fa-globe-americas', classes.Globe].join(' ')} />
      </ToolTip>
    );
  };

  const getRoomTypeIcon = () => {
    if (
      roomType.includes(TabTypes.GEOGEBRA) &&
      roomType.includes(TabTypes.DESMOS)
    )
      return TabTypes.getCombinedIcon(roomType);
    const typeToDisplay = getFirstMatching(TabTypes.activeTabTypes, roomType);
    return typeToDisplay ? TabTypes.getIcon(typeToDisplay) : null;
  };

  const getFirstMatching = (values, arr) => {
    const result = values.find((val) => arr.includes(val));
    return result || null;
  };

  const { tabTypes: toolTipText } = getResourceTabTypes(roomType);

  const desImageAndToolTip = (
    <ToolTip text={toolTipText} delay={600}>
      <div className={classes.Icon}>
        <img width={25} src={dsmIcon} alt="dsm" />
      </div>
    </ToolTip>
  );

  const desActImageAndToolTip = (
    <ToolTip text={toolTipText} delay={600}>
      <div className={classes.Icon}>
        <img width={25} src={dsmActIcon} alt="dsm" />
      </div>
    </ToolTip>
  );

  const ggbImageAndToolTip = (
    <ToolTip text={toolTipText} delay={600}>
      <div className={classes.Icon}>
        <img width={28} src={ggbIcon} alt="ggb" />
      </div>
    </ToolTip>
  );

  const pyretImageAndToolTip = (
    <ToolTip text={toolTipText} delay={600}>
      <div className={classes.Icon}>
        <img width={28} src={pyretIcon} alt="pyret" />
      </div>
    </ToolTip>
  );

  const wspImageAndToolTip = (
    <ToolTip text="WSP" delay={600}>
      <div className={classes.Icon}>
        <img width={28} src={wspIcon} alt="Web Sketchpad" />
      </div>
    </ToolTip>
  );

  if (Array.isArray(roomType)) {
    let des = false;
    let ggb = false;
    let act = false;
    let pyrt = false;
    let wsp = false;
    roomType.forEach((rmType) => {
      if (rmType === 'desmos') des = true;
      else if (rmType === 'desmosActivity') act = true;
      else if (rmType === 'pyret') pyrt = true;
      else if (rmType === 'wsp') wsp = true;
      else ggb = true;
    });
    if (ggb && des) {
      roomTypeIcon = (
        <ToolTip text={toolTipText} delay={600}>
          <div className={classes.Icon}>
            <img width={25} src={bothIcon} alt="ggb" />
          </div>
        </ToolTip>
      );
    } else if (des) {
      roomTypeIcon = desImageAndToolTip;
    } else if (act) {
      roomTypeIcon = desActImageAndToolTip;
    } else if (pyrt) {
      roomTypeIcon = pyretImageAndToolTip;
    } else if (wsp) {
      roomTypeIcon = wspImageAndToolTip;
    } else {
      roomTypeIcon = ggbImageAndToolTip;
    }
  } else if (roomType === 'desmos') {
    roomTypeIcon = desImageAndToolTip;
  } else if (roomType === 'geogebra') {
    roomTypeIcon = ggbImageAndToolTip;
  } else if (roomType === 'pyret') {
    roomTypeIcon = pyretImageAndToolTip;
  }
  return (
    <Fragment>
      {image && (
        <div className={classes.Icon}>
          <img src={image} width={25} alt="" />
        </div>
      )}
      <div className={classes.Icon}>{lockIcon}</div>
      <ToolTip text={toolTipText} delay={600}>
        <div className={classes.Icon}>{roomTypeIcon}</div>
      </ToolTip>
    </Fragment>
  );
};

Icons.propTypes = {
  image: PropTypes.string,
  lock: PropTypes.bool.isRequired,
  listType: PropTypes.string.isRequired,
  roomType: PropTypes.arrayOf(PropTypes.string), // Testing to see whether roomType is ever a string (if so, we get a warning)
};

Icons.defaultProps = {
  image: null,
  roomType: null,
};
export default Icons;
