import React from 'react';
import ggbIcon from './geogebra.png';
import dsmIcon from './desmos.png';
import Aux from '../../../HOC/Auxil';
const Icons = props => {
  let lock;
  console.log(props)
  if (props.lock && props.listType === 'public') {
    lock = <div style={{height: 20}}><i className="fas fa-lock"></i></div>
  }
  else if (props.lock && props.listType === 'private') {
    lock = <div style={{height: 20}}><i class="fas fa-unlock-alt"></i></div>
  }

  let roomType
  if ( props.roomType === 'desmos' ) {
    roomType = <img height={20} width={20} src={dsmIcon} alt='dsm'/>
  } else if (props.roomType === 'geogebra') {
    roomType = <img height={20} width={20} src={ggbIcon} alt='ggb'/>
  }
  return (
    <Aux>
      {lock}
      <img src={props.image} height={20} width={20} alt={''}/>
      {roomType}
    </Aux>
  )
}

export default Icons;
