import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import classes from 'Containers/Replayer/DesActivityReplayer.css';

const DesActivityMiniReplayer = ({
  startingPoint,
  currentState,
  currentScreen,
}) => {
  const defaultOption = { label: 'Screen recently changed', value: -1 };
  const [screenSelection, setScreenSelection] = React.useState(defaultOption);
  const [_, setLoaded] = React.useState(false); // a hack so that we can see screen options once player loads

  const calculatorRef = useRef();
  const calculatorInst = useRef();

  const initCalc = async () => {
    const { Player } = await import('../../external/js/api.full.es');
    const playerOptions = { targetElement: calculatorRef.current };
    try {
      playerOptions.activityConfig = JSON.parse(startingPoint);
      if (currentState) {
        const newState = JSON.parse(currentState);
        playerOptions.responseData = newState;
      }
      if (currentScreen && calculatorInst.current)
        calculatorInst.current.setActiveScreenIndex(currentScreen);
    } catch (e) {
      console.log('parse error', e);
    }

    calculatorInst.current = new Player(playerOptions);
    if (currentScreen)
      calculatorInst.current.setActiveScreenIndex(currentScreen);
  };

  const _screenOptions = () => {
    if (!calculatorInst.current) return [defaultOption];
    const screens = Array.from(
      { length: calculatorInst.current.getScreenCount() },
      (_, i) => ({ label: `Screen ${i + 1}`, value: i })
    );
    return [defaultOption, ...screens];
  };

  useEffect(async () => {
    if (startingPoint) await initCalc();
    setLoaded(true);
  }, []);

  useEffect(() => {
    try {
      if (currentState && calculatorInst.current) {
        const update = JSON.parse(currentState);
        calculatorInst.current.dangerouslySetResponses(update);
      }
    } catch (e) {
      console.log('updating error', e);
    }
    return () => {
      if (calculatorInst.current) {
        calculatorInst.current.destroy();
      }
    };
  }, [currentState]);

  useEffect(() => {
    if (!calculatorInst.current) return;
    const screen =
      screenSelection.value === -1 ? currentScreen : screenSelection.value;
    calculatorInst.current.setActiveScreenIndex(screen);
  }, [screenSelection, currentScreen]);

  return (
    <div>
      {calculatorInst.current &&
        calculatorInst.current.getScreenCount() > 1 && (
          <Select
            options={_screenOptions()}
            value={screenSelection}
            onChange={setScreenSelection}
            placeholder="Select a Screen..."
            isSearchable={false}
          />
        )}
      <div className={classes.Activity} id="calculatorParent">
        <div
          className={classes.Graph}
          style={{ position: 'absolute', pointerEvents: 'none' }}
          id="calculator"
          ref={calculatorRef}
        />
      </div>
    </div>
  );
};

DesActivityMiniReplayer.propTypes = {
  currentState: PropTypes.string,
  startingPoint: PropTypes.string,
  currentScreen: PropTypes.number,
};

DesActivityMiniReplayer.defaultProps = {
  currentState: '',
  startingPoint: '',
  currentScreen: 0,
};

export default DesActivityMiniReplayer;
