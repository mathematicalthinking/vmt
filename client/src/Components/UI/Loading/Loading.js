import React from 'react';
import gif from './Ripple-2.3s-200px.gif';
import Aux from '../../HOC/Auxil';
import Backdrop from '../Backdrop/Backdrop';
import classes from './loading.css';
const loading = props => (
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
      <div className='loader'>
        <img src={gif} alt='loading' />
      </div>
      <div className={classes.Message}>
        {props.message}
      </div>
    </div>
  </Aux>
)


export default loading;
