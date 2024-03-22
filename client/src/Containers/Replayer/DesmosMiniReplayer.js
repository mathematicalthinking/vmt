import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

const DesmosMiniReplayer = ({ startingPoint, currentState }) => {
  const calculator = React.createRef();

  const _initialize = (el) => {
    if (!calculator.current)
      calculator.current = window.Desmos.GraphingCalculator(el);
  };

  const _update = () => {
    if (calculator.current)
      if (currentState) {
        calculator.current.setState(JSON.parse(currentState));
      } else if (startingPoint) {
        calculator.current.setState(JSON.parse(startingPoint));
      } else {
        calculator.current.setBlank();
      }
  };

  React.useEffect(() => {
    return () => {
      if (calculator.current) {
        calculator.current.destroy();
      }
    };
  }, []);

  React.useEffect(() => {
    _update();
  }, [startingPoint, currentState, calculator.current]);

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
      }}
      id="calculator"
      ref={_initialize}
    />
  );
};

DesmosMiniReplayer.propTypes = {
  startingPoint: PropTypes.string,
  currentState: PropTypes.string,
};

DesmosMiniReplayer.defaultProps = {
  startingPoint: '',
  currentState: '',
};

export default DesmosMiniReplayer;
