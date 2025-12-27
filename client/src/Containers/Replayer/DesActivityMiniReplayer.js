import React, { useRef, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import classes from 'Containers/Replayer/DesActivityReplayer.css';

const DesActivityMiniReplayer = ({
  startingPoint = '',
  currentState = '',
  currentScreen = 0,
}) => {
  const defaultOption = { label: 'Screen recently changed', value: -1 };
  const [screenSelection, setScreenSelection] = React.useState(defaultOption);
  const [loaded, setLoaded] = React.useState(false); // a hack so that we can see screen options once player loads

  const calculatorRef = useRef();
  const calculatorInst = useRef();

  const initCalc = async () => {
    const { Player } = await import('../../external/js/api.full.es');
    const playerOptions = { targetElement: calculatorRef.current };
    try {
      if (startingPoint)
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

  const _isShowable = () => {
    if (!calculatorInst.current) return false;
    if (!startingPoint || startingPoint === '{}') return false;
    if (!currentState || currentState === '{}') return false;
    return true;
  };

  useEffect(() => {
    const init = async () => {
      if (startingPoint) await initCalc();
      setLoaded(true);
    };
    init();
    return () => {
      if (calculatorInst.current) {
        calculatorInst.current.destroy();
      }
    };
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
  }, [currentState]);

  useEffect(() => {
    if (!calculatorInst.current) return;
    const screen =
      screenSelection.value === -1 ? currentScreen : screenSelection.value;
    calculatorInst.current.setActiveScreenIndex(screen);
  }, [screenSelection, currentScreen]);

  return (
    <Fragment>
      <div style={{ display: _isShowable() ? 'inherit' : 'none' }}>
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
      <div
        style={{ margin: '10px', display: !_isShowable() ? 'inherit' : 'none' }}
      >
        {!loaded ? 'Activity loading...' : 'No activity to show'}
      </div>
    </Fragment>
  );
};

DesActivityMiniReplayer.propTypes = {
  currentState: PropTypes.string,
  startingPoint: PropTypes.string,
  currentScreen: PropTypes.number,
};

export default DesActivityMiniReplayer;
