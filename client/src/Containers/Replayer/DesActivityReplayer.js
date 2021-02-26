/* eslint-disable */

import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classes from './DesActivityReplayer.css';
import { Player } from '../../external/js/api.full.es';

const DesActivityReplayer = (props) => {
  const calculatorRef = useRef();
  const calculatorInst = useRef();

  //   function allowKeypressCheck(event) {
  //     event.preventDefault();
  //   }
  const initCalc = (data) => {
    // eslint-disable-next-line no-console
    console.log('Data: ', data);
    let playerOptions = {
      activityConfig: data,
      targetElement: calculatorRef.current,
    };

    calculatorInst.current = new Player(playerOptions);

    // console.log('player', player);
    // setActivityPlayer(player);
    // eslint-disable-next-line no-console
    console.log(
      'Desmos Activity Player initialized Version: ',
      Player.version(),
      'Player instance: ',
      calculatorInst.current
    );
  };

  const fetchData = async () => {
    // window.addEventListener('keydown', allowKeypressCheck());
    let code =
      props.tab.desmosLink ||
      // fallback to turtle time trials, used for demo
      '5da9e2174769ea65a6413c93';
    const URL = `https://teacher.desmos.com/activitybuilder/export/${code}`;
    // eslint-disable-next-line no-console
    console.log('adapted activity url: ', URL);
    // calling Desmos to get activity config
    const result = await fetch(URL, {
      headers: { Accept: 'application/json' },
    });
    return result.json();
  };

  // handles the updates to the player

  useEffect(() => {
    if (calculatorInst.current) {
      updatePlayer();
    }
  }, [props.index]);

  function updatePlayer() {
    const { index, log } = props;
    // Take updated player data with new Player state to update
    let newData = log[index].currentState;
    if (newData) {
      newData = JSON.parse(newData);
      // eslint-disable-next-line no-console
      console.log('log-index, Index: ', index, 'State data: ', newData);
      if (newData.desmosState && newData.desmosState.studentResponses) {
        calculatorInst.current.dangerouslySetResponses(
          newData.desmosState.studentResponses,
          {
            timestampEpochMs: newData.desmosState.timestampEpochMs,
          }
        );
      }
      if (newData.screen !== calculatorInst.current.getActiveScreenIndex()) {
        calculatorInst.current.setActiveScreenIndex(newData.screen);
      }
    }
  }

  useEffect(() => {
    fetchData().then((data) => {
      initCalc(data);
      props.setTabLoaded(props.tab._id);
    });

    return function() {
      if (calculatorInst.current) {
        calculatorInst.current.destroy();
      }
      //   window.removeEventListener('keydown', allowKeypressCheck());
      sessionStorage.clear();
    };
  }, []);

  return (
    <div className={classes.Activity} id="calculatorParent">
      <div className={classes.Graph} id="calculator" ref={calculatorRef} />
    </div>
  );
};

DesActivityReplayer.propTypes = {
  inView: PropTypes.bool.isRequired,
  log: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  index: PropTypes.number.isRequired,
  tab: PropTypes.shape({}).isRequired,
  setTabLoaded: PropTypes.func.isRequired,
};

export default DesActivityReplayer;
