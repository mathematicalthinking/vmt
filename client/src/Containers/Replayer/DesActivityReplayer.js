import React, { useRef, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import classes from './DesActivityReplayer.css';
import { fetchConfigData } from '../Workspace/Tools/DesActivityHelpers';

const DesActivityReplayer = (props) => {
  const { index, inView, setTabLoaded } = props;
  const calculatorRef = useRef();
  const calculatorInst = useRef();

  const initCalc = async (tab) => {
    const { config } = await fetchConfigData(tab);

    const { Player } = await import('../../external/js/api.full.es');
    const playerOptions = {
      activityConfig: config,
      targetElement: calculatorRef.current,
    };

    calculatorInst.current = new Player(playerOptions);

    setTabLoaded(tab._id);
  };

  // handles the updates to the player

  useEffect(() => {
    if (calculatorInst.current && inView) {
      updatePlayer();
    }
  }, [index, inView]);

  function updatePlayer() {
    const { log } = props;
    // Take updated player data with new Player state to update
    let newData = log[index] ? log[index].currentState : null;
    if (newData) {
      newData = JSON.parse(newData);
      if (newData.desmosState && !newData.transient) {
        calculatorInst.current.dangerouslySetResponses(newData.desmosState);
      }
      if (newData.desmosState && newData.transient) {
        calculatorInst.current.handleSyncEvent(newData.desmosState);
      }
      if (newData.screen !== calculatorInst.current.getActiveScreenIndex()) {
        calculatorInst.current.setActiveScreenIndex(newData.screen);
      }
    }
  }

  function getCurrentScreen() {
    if (calculatorInst.current) {
      return calculatorInst.current.getActiveScreenIndex();
    }
    return 0;
  }

  function getScreenCount() {
    if (calculatorInst.current) {
      return calculatorInst.current.getScreenCount();
    }
    return 0;
  }

  useEffect(() => {
    const { tab } = props;
    initCalc(tab);

    return () => {
      if (calculatorInst.current) {
        calculatorInst.current.destroy();
      }
    };
  }, []);

  return (
    <Fragment>
      <div id="activityNavigation" className={classes.ActivityNav}>
        <span
          title="Navigation buttons only seen when in control in an Activity"
          id="show-screen"
          className={classes.Title}
        >
          <div>Screen {getCurrentScreen() + 1}</div>
          <div id="screen-count" className={classes.Screens}>
            of {getScreenCount()}
          </div>
        </span>
      </div>
      <div className={classes.Activity} id="calculatorParent">
        <div className={classes.Graph} id="calculator" ref={calculatorRef} />
      </div>
    </Fragment>
  );
};

DesActivityReplayer.propTypes = {
  log: PropTypes.arrayOf(PropTypes.shape({ currentState: PropTypes.string }))
    .isRequired,
  index: PropTypes.number.isRequired,
  tab: PropTypes.shape({}).isRequired,
  setTabLoaded: PropTypes.func.isRequired,
  inView: PropTypes.bool.isRequired,
};

export default DesActivityReplayer;
