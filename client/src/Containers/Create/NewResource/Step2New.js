import React from 'react';
import PropTypes from 'prop-types';
import { RadioBtn, Aux } from '../../../Components';
import classes from '../create.css';

const Step2New = (props) => {
  const { roomType, setRoomType } = props;
  return (
    <Aux>
      <p style={{ marginBottom: 10 }}>Select a workspace type</p>
      <div className={classes.RadioButtons}>
        <RadioBtn
          name="desmosActivity"
          checked={roomType === 'desmosActivity'}
          check={setRoomType}
        >
          Desmos Activity
        </RadioBtn>
        <RadioBtn
          name="geogebra"
          checked={roomType === 'geogebra'}
          check={setRoomType}
        >
          GeoGebra
        </RadioBtn>
        <RadioBtn
          name="desmos"
          checked={roomType === 'desmos'}
          check={setRoomType}
        >
          Desmos
        </RadioBtn>
        {window.env.REACT_APP_WSP_MODE &&
        window.env.REACT_APP_WSP_MODE.toLowerCase() === 'yes' ? (
          <RadioBtn name="wsp" checked={roomType === 'wsp'} check={setRoomType}>
            Web Skeetchpad
          </RadioBtn>
        ) : null}
        {window.env.REACT_APP_PYRET_MODE &&
        window.env.REACT_APP_PYRET_MODE.toLowerCase() === 'yes' ? (
          <RadioBtn
            name="pyret"
            checked={roomType === 'pyret'}
            check={setRoomType}
          >
            Pyret Activity
          </RadioBtn>
        ) : null}
      </div>
    </Aux>
  );
};

Step2New.propTypes = {
  roomType: PropTypes.string.isRequired,
  setRoomType: PropTypes.func.isRequired,
};

export default Step2New;
