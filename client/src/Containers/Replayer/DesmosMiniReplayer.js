import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Script from 'react-load-script';

const DesmosMiniReplayer = ({ startingPoint, currentState }) => {
  const calculatorRef = React.createRef();
  const calculator = React.createRef();
  const [loading, setLoading] = React.useState(true);

  const _initialize = () => {
    if (!calculator.current)
      calculator.current = window.Desmos.GraphingCalculator(
        calculatorRef.current
      );
    setLoading(false);
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
  }, [startingPoint, currentState]);

  React.useEffect(() => {
    if (calculatorRef.current && window.Desmos) {
      _initialize();
      _update();
    }
  }, [calculatorRef.current, window.Desmos]);

  return (
    <Fragment>
      {!window.Desmos && (
        <Script url="https://www.desmos.com/api/v1.5/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6" />
      )}
      <div
        style={{
          height: '100%',
          width: '100%',
          display: loading ? 'none' : 'inherit',
        }}
        id="calculator"
        ref={calculatorRef}
      />
      <div style={{ margin: '10px', display: loading ? 'inherit' : 'none' }}>
        Loading the Desmos Graph...
      </div>
    </Fragment>
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
