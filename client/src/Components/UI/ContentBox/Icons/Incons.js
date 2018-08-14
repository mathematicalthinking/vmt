import React from 'react';
import ggbIcon from './ggb.png';
import dsmIcon from './desmos.png';
import Aux from '../../../HOC/Auxil';
const Icons = props => {
  const lock = props.lock ? <i className="fas fa-lock"></i> : null; // consider using unlock icon
  const roomType = ( props.roomType === 'desmos' ) ? <img src={dsmIcon} alt='dsm'/> : <img src={ggbIcon} alt='ggb'/>
  return (
    <Aux>
      {lock}
      {roomType}
    </Aux>
  )
}

export default Icons;
