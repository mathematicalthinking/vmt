// PROPS:
  // show: Boolean
  // closeModal: function()
  // children: jsx
  // message: String (if no children display loading icon with custom message)
//

import React from 'react';
import gif from './Ripple.gif';
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
        transform: props.show ? 'translateY(-50%)' : 'translateY(-150vh)',
        opacity: props.show ? '1' : '0',
      }}
    >
      {props.children 
        ? <Aux> 
            <div data-testid='close-modal' className={classes.Close} onClick={props.closeModal}><i className="fas fa-times"></i></div>
            {props.children }
          </Aux>
        : <Aux>
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
