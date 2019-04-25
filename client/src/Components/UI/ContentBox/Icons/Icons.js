import React, { Fragment } from 'react';
import ggbIcon from './geogebra.png';
import dsmIcon from './desmos.png';
import bothIcon from './desmosandgeogebra.png';
import ToolTip from '../../../ToolTip/ToolTip';
import classes from './icons.css';

const Icons = React.memo(props => {
  let lock;
  if (props.lock && props.listType === 'public') {
    lock = (
      <ToolTip text="private" delay={600}>
        <i className={['fas fa-lock', classes.Locked].join(' ')} />
      </ToolTip>
    );
  } else if (props.lock && props.listType === 'private') {
    lock = (
      <ToolTip text="private" delay={600}>
        <i className={['fas fa-unlock-alt', classes.Unlocked].join(' ')} />
      </ToolTip>
    );
  } else {
    lock = (
      <ToolTip text="public" delay={600}>
        <i className={['fas fa-globe-americas', classes.Globe].join(' ')} />
      </ToolTip>
    );
  }

  let roomType;
  let desImageAndToolTip = (
    <ToolTip text={'Desmos'} delay={600}>
      <div className={classes.Icon}>
        <img width={25} src={dsmIcon} alt="dsm" />
      </div>
    </ToolTip>
  );
  let ggbImageAndToolTip = (
    <ToolTip text={'GeoGebra'} delay={600}>
      <div className={classes.Icon}>
        <img width={28} src={ggbIcon} alt="ggb" />
      </div>
    </ToolTip>
  );
  if (Array.isArray(props.roomType)) {
    let des = false;
    let ggb = false;
    props.roomType.forEach(rmType => {
      if (rmType === 'desmos') des = true;
      else ggb = true;
    });
    if (des && ggb) {
      roomType = (
        <ToolTip text={'GeoGebra/Desmos'} delay={600}>
          <div className={classes.Icon}>
            <img width={25} src={bothIcon} alt="ggb" />
          </div>
        </ToolTip>
      );
    } else if (des) {
      roomType = desImageAndToolTip;
    } else {
      roomType = ggbImageAndToolTip;
    }
  } else if (props.roomType === 'desmos') {
    roomType = desImageAndToolTip;
  } else if (props.roomType === 'geogebra') {
    roomType = ggbImageAndToolTip;
  }
  return (
    <Fragment>
      <div className={classes.Icon}>
        <img src={props.image} width={25} alt={''} />
      </div>
      <div className={classes.Icon}>{lock}</div>
      {roomType}
    </Fragment>
  );
});

export default Icons;
