import React, { useRef, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import classes from './DesActivityReplayer.css';
// import { Player } from '../../external/js/api.full.es';
import { fetchConfigData } from '../Workspace/Tools/DesActivityHelpers.es';

const DesActivityReplayer = (props) => {
  const { index } = props;
  const calculatorRef = useRef();
  const calculatorInst = useRef();

  //   function allowKeypressCheck(event) {
  //     event.preventDefault();
  //   }
  const initCalc = async (tab) => {
    const { config, status } = await fetchConfigData(tab);

    const { Player } = await import('../../external/js/api.full.es');
    const playerOptions = {
      activityConfig: config,
      targetElement: calculatorRef.current,
    };

    calculatorInst.current = new Player(playerOptions);
    // eslint-disable-next-line no-console
    console.log(
      'Desmos Activity Player initialized Version: ',
      Player.version(),
      'Player instance: ',
      calculatorInst.current,
      ' Config status: ',
      status
    );
    props.setTabLoaded(tab._id);
  };

  // handles the updates to the player

  useEffect(() => {
    if (calculatorInst.current) {
      updatePlayer();
    }
  }, [index]);

  function updatePlayer() {
    const { log } = props;
    // Take updated player data with new Player state to update
    let newData = log[index] ? log[index].currentState : null;
    if (newData) {
      newData = JSON.parse(newData);
      // eslint-disable-next-line no-console
      // console.log('log-index, Index: ', index, 'State data: ', newData);
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

    return function() {
      if (calculatorInst.current) {
        calculatorInst.current.destroy();
      }
      //   window.removeEventListener('keydown', allowKeypressCheck());
    };
  }, []);

  return (
    <Fragment>
      <div
        id="activityNavigation"
        className={classes.ActivityNav}
        // onClickCapture={_checkForControl}
        // style={{
        //   pointerEvents: !_hasControl() ? 'none' : 'auto',
        // }}
      >
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
  log: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  index: PropTypes.number.isRequired,
  tab: PropTypes.shape({}).isRequired,
  setTabLoaded: PropTypes.func.isRequired,
};

export default DesActivityReplayer;
