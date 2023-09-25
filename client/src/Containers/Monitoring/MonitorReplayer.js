import React, { useRef, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import classes from 'Containers/Replayer/DesActivityReplayer.css';
// import { Player } from '../../external/js/api.full.es';
import { fetchConfigData } from 'Containers/Workspace/Tools/DesActivityHelpers';

const MonitorReplayer = (props) => {
  //   const { index } = props;
  const calculatorRef = useRef();
  const calculatorInst = useRef();

  const initCalc = async (tab) => {
    const { config, status } = await fetchConfigData(tab, true);

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
    // props.setTabLoaded(tab._id);
  };

  // handles the updates to the player

  //   useEffect(() => {
  //     if (calculatorInst.current) {
  //       updatePlayer();
  //     }
  //   }, [index]);

  //   function updatePlayer() {
  //     const { log } = props;
  //     // Take updated player data with new Player state to update
  //     let newData = log[index] ? log[index].currentState : null;
  //     if (newData) {
  //       newData = JSON.parse(newData);
  //       // eslint-disable-next-line no-console
  //       // console.log('log-index, Index: ', index, 'State data: ', newData);
  //       if (newData.desmosState && !newData.transient) {
  //         calculatorInst.current.dangerouslySetResponses(newData.desmosState);
  //       }
  //       if (newData.desmosState && newData.transient) {
  //         calculatorInst.current.handleSyncEvent(newData.desmosState);
  //       }
  //       if (newData.screen !== calculatorInst.current.getActiveScreenIndex()) {
  //         calculatorInst.current.setActiveScreenIndex(newData.screen);
  //       }
  //     }
  //   }

  //   function getCurrentScreen() {
  //     if (calculatorInst.current) {
  //       return calculatorInst.current.getActiveScreenIndex();
  //     }
  //     return 0;
  //   }

  //   function getScreenCount() {
  //     if (calculatorInst.current) {
  //       return calculatorInst.current.getScreenCount();
  //     }
  //     return 0;
  //   }

  useEffect(() => {
    const { populatedRoom } = props;
    const tab = populatedRoom.tabs[0];
    initCalc(tab);

    return function() {
      if (calculatorInst.current) {
        calculatorInst.current.destroy();
      }
      //   window.removeEventListener('keydown', allowKeypressCheck());
    };
  }, []);

  return (
    <div className={classes.Activity} id="calculatorParent">
      <div className={classes.Graph} id="calculator" ref={calculatorRef} />
    </div>
  );
};

MonitorReplayer.propTypes = {
  populatedRoom: PropTypes.shape({}).isRequired,
};

export default MonitorReplayer;
