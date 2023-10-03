import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Script from 'react-load-script';

const DesmosMiniReplayer = ({ startingPoint, currentState }) => {
  const calculatorRef = React.createRef();
  const [calculator, setCalculator] = React.useState();

  const onScriptLoad = () => {
    if (!window.Desmos && !calculator) return;
    const newCalc =
      calculator || window.Desmos.GraphingCalculator(calculatorRef.current);
    setCalculator(newCalc);
    if (currentState) newCalc.setState(JSON.parse(currentState));
    else if (startingPoint) newCalc.setState(JSON.parse(startingPoint));
    else newCalc.setBlank();
  };

  React.useEffect(() => {
    onScriptLoad();
    return () => {
      if (calculator) {
        calculator.destroy();
      }
    };
  }, [startingPoint, currentState]);

  return (
    <Fragment>
      {!window.Desmos ? (
        <Script
          url="https://www.desmos.com/api/v1.5/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"
          onLoad={onScriptLoad}
        />
      ) : null}
      <div
        style={{ height: '100%', width: '100%' }}
        id="calculator"
        ref={calculatorRef}
      />
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
