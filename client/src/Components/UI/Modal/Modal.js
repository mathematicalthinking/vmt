// PROPS:
  // show: Boolean
  // closeModal: function()
  // children: jsx
  // message: String (if no children display loading icon with custom message)
//

import React from 'react';
import gif from './Ripple-2.3s-200px.gif';
import Aux from '../../HOC/Auxil';
import Backdrop from '../Backdrop/Backdrop';
import classes from './modal.css';
const modal = props => (
  <Aux>
    <Backdrop
      show={props.show}
      clicked={props.closeModal}
    />
    <div
      className={classes.Modal}
      style={{
        transform: props.show ? 'translateY(0)' : 'translateY(-100vh)',
        opacity: props.show ? '1' : '0'
      }}
    >
      {props.children ? props.children :
      <Aux>
        <div className='loader'>
          <img src={gif} alt='loading' />
        </div>
        <div className={classes.Message}>
          {props.message}
        </div>
      </Aux>
      }
    </div>
  </Aux>
)


export default modal;
