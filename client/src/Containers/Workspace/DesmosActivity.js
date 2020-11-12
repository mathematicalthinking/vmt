/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classes from './graph.css';
// import Aux from '../../Components/HOC/Auxil';
import { Aux, Button } from '../../Components';
import { Player } from '../../external/js/api.es';
// import API from '../../utils/apiRequests';
// import { updatedRoom } from '../../store/actions';

function DesmosActivityGraph(props) {
  const [screenPage, setScreenPage] = useState(1);
  const [activityPlayer, setActivityPlayer] = useState();
  const calculatorRef = useRef(null);
  //   async function getInitialState() {
  //     const URL = `https://teacher.desmos.com/activitybuilder/export/5ddbf9ae009cd90bcdeaadd7`;
  //     const result = await fetch(URL, {
  //       headers: { Accept: 'application/json' },
  //     })
  //       .then((res) => res.json())
  //       .then((json) => {
  //         console.log('Result: ', json);
  //         return json;
  //       });
  //   }
  // );

  useEffect(async () => {
    // tab
    // let activityConfig;
    // // let window.player;

    // // TODO handle existing room state?
    // try {
    //   if (tab.desmosLink) {
    //     let link = tab.desmosLink;
    //     link = link.split('/');
    //     const code = link[link.length - 1];
    //     const URL = `https://teacher.desmos.com/activitybuilder/export/${code}`;
    //     console.log('adapted activity url: ', URL);
    //     fetch(URL, { headers: { Accept: 'application/json' } })
    //       .then((res) => res.json())
    //       .then((json) => {
    //         activityConfig = json;
    //         window.player = new Player({
    //           activityConfig,
    //           targetElement: this.calculatorRef.current,
    //         });

    //         if (window.player)
    //           console.log('Desmos Activity Player Initialized');

    //         setFirstTabLoaded();
    //       });
    //   }
    // } catch (err) {
    //   console.log('Error- could not fetch URL, defaulting activity url: ', err);

    const URL = `https://teacher.desmos.com/activitybuilder/export/5ddbf9ae009cd90bcdeaadd7`;
    const result = await fetch(URL, {
      headers: { Accept: 'application/json' },
    });
    const data = await result.json();
    console.log('Data: ', data);
    const player = new Player({
      activityConfig: data,
      targetElement: calculatorRef.current,
    });
    console.log('player', player);
    setActivityPlayer(player);

    //     });
    // }

    // console.log(window);
    // console.log(screenPage);
    props.setFirstTabLoaded();
  }, []);

  function navigateBy(increment) {
    console.log('Hey!');
    activityPlayer.setActiveScreenIndex(
      activityPlayer.getActiveScreenIndex() + increment
    );
  }

  return (
    <Aux>
      <div id="activityNavigation" className={classes.ActivityNav}>
        <Button theme="Small" id="nav-left" click={() => navigateBy(-1)}>
          Prev
        </Button>
        <span id="show-screen" className={classes.Title}>
          Screen {screenPage}
        </span>
        <Button theme="Small" id="nav-right" click={() => navigateBy(1)}>
          Next
        </Button>
      </div>
      <div className={classes.Activity} id="calculatorParent">
        <div className={classes.Graph} id="calculator" ref={calculatorRef} />
      </div>
    </Aux>
  );
}

DesmosActivityGraph.propTypes = {
  // activity: PropTypes.shape({}).isRequired,
  // currentTab: PropTypes.string.isRequired,
  tab: PropTypes.shape({}).isRequired,
  // role: PropTypes.string.isRequired,
  setFirstTabLoaded: PropTypes.func.isRequired,
  // updateActivityTab: PropTypes.func.isRequired,
};

export default DesmosActivityGraph;
