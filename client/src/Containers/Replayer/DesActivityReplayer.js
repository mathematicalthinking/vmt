/* eslint-disable */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  Fragment,
} from 'react';
import PropTypes from 'prop-types';
import classes from './DesActivityReplayer.css';
// import { Aux } from '../../Components';
import { Player } from '../../external/js/api.full.es';
// import API from '../../utils/apiRequests';

const DesActivityReplayer = (props) => {
  // const [playerIndex, setPlayerIndex] = useState();
  // const [activityHistory, setActivityHistory] = useState({});
  // const [activityUpdates, setActivityUpdates] = useState();
  // const [showControlWarning, setShowControlWarning] = useState(false);
  const calculatorRef = useRef();
  const calculatorInst = useRef();
  const didMountRef = useRef(false);

  //   function allowKeypressCheck(event) {
  //     event.preventDefault();
  //   }

  const fetchData = useCallback(async () => {
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
    const data = await result.json();
    // eslint-disable-next-line no-console
    console.log('Data: ', data);
    let playerOptions = {
      activityConfig: data,
      targetElement: calculatorRef.current,
    };
    // @todo loading into different state, is this needed for the replayer?
    // if (props.tab.currentStateBase64) {
    //   const { tab } = props;
    //   let { currentStateBase64 } = tab;
    //   let savedData = JSON.parse(currentStateBase64);
    //   console.log('Prior state data loaded: ');
    //   console.log(savedData);
    //   // for (let prefixedKey of Object.keys(savedData)) {
    //   //   if (!prefixedKey.startsWith(keyPrefix)) continue;
    //   //   let responseDataKey = prefixedKey.slice(keyPrefix.length);
    //   //   responseData[responseDataKey] = savedData[prefixedKey];
    //   // }
    //   // console.log('Initial response data:');
    //   // console.log(responseData);
    //   // updateActivityState(props.tab.currentState);
    //   playerOptions.responseData = savedData;
    // }

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
    props.setTabLoaded(props.tab._id);
  });

  // handles the updates to the player

  useEffect(() => {
    if (didMountRef.current) {
      updatePlayer();
    } else didMountRef.current = true;
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
    fetchData();
    return function cleanup() {
      if (calculatorInst.current) {
        calculatorInst.current.destroy();
      }
      //   window.removeEventListener('keydown', allowKeypressCheck());
      sessionStorage.clear();
    };
  }, []);

  return (
    <Fragment>
      <div className={classes.Activity} id="calculatorParent">
        <div className={classes.Graph} id="calculator" ref={calculatorRef} />
      </div>
    </Fragment>
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
