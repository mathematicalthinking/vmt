import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './graph.css';
// import Aux from '../../Components/HOC/Auxil';
import { Aux, Button } from '../../Components';
import { Player } from '../../external/js/api.es';
// import API from '../../utils/apiRequests';
// import { updatedRoom } from '../../store/actions';
class DesmosActivityGraph extends Component {
  calculatorRef = React.createRef();
  constructor() {
    super();
    this.state = { screenPage: 1 };
  }

  componentDidMount() {
    const { tab, setFirstTabLoaded } = this.props;
    let activityConfig;
    // let window.player;

    // TODO handle existing room state?
    try {
      if (tab.desmosLink) {
        let link = tab.desmosLink;
        link = link.split('/');
        const code = link[link.length - 1];
        const URL = `https://teacher.desmos.com/activitybuilder/export/${code}`;
        console.log('adapted activity url: ', URL);
        fetch(URL, { headers: { Accept: 'application/json' } })
          .then((res) => res.json())
          .then((json) => {
            activityConfig = json;
            window.player = new Player({
              activityConfig,
              targetElement: this.calculatorRef.current,
            });

            if (window.player)
              console.log('Desmos Activity Player Initialized');

            setFirstTabLoaded();
          });
      }
    } catch (err) {
      console.log('Error- could not fetch URL, defaulting activity url: ', err);

      const URL = `https://teacher.desmos.com/activitybuilder/export/5ddbf9ae009cd90bcdeaadd7`;
      fetch(URL, { headers: { Accept: 'application/json' } })
        .then((res) => res.json())
        .then((json) => {
          activityConfig = json;

          window.player = new Player({
            activityConfig,
            targetElement: this.calculatorRef.current,
          });

          if (window.player)
            console.log('BACKUP - Desmos Activity Player Initialized');

          setFirstTabLoaded();
        });
    }
  }

  // this.calculator = window.Desmos.GraphingCalculator(
  //   this.calculatorRef.current
  // );

  componentDidUpdate() {
    // was passed 'prevProps'
    // const { currentTab, role, activity, updateActivityTab } = this.props;
    // if (prevProps.currentTab !== currentTab) {
    //   if (role === 'facilitator') {
    //     const updatedTabs = [...prevProps.activity.tabs];
    //     const updatedTab = updatedTabs[prevProps.currentTab];
    //     updatedTab.currentState = JSON.stringify({
    //       ...this.calculator.getState(),
    //     });
    //     updatedTabs[currentTab] = updatedTab;
    //     updateActivityTab(activity._id, updatedTab._id, {
    //       currentState: updatedTab.currentState,
    //     });
    //   }
    //   this.calculator.setState(activity.tabs[currentTab].currentState);
    // }
  }

  componentWillUnmount() {
    // const { role, activity, tab, updateActivityTab } = this.props;
    // // save on unmount
    // if (role === 'facilitator') {
    //   updateActivityTab(activity._id, tab._id, {
    //     currentState: JSON.stringify({
    //       ...this.calculator.getState(),
    //     }),
    //   });
    // }
    // this.calculator.unobserveEvent('change');
    // this.calculator.destroy();
  }

  // navigateBy(increment) {
  //   window.player.setActiveScreenIndex(
  //     window.player.getActiveScreenIndex() + increment
  //   );
  //   this.setState({ screenPage: window.player.getActiveScreenIndex() + 1 });
  // }

  render() {
    console.log(window);
    const { screenPage } = this.state;
    return (
      <Aux>
        <div id="activityNavigation">
          <Button theme="Small" id="nav-left">
            Prev
          </Button>
          Screen <span id="show-screen">{screenPage}</span>
          <Button theme="Small" id="nav-right">
            Next
          </Button>
        </div>
        <div
          className={classes.Graph}
          id="calculator"
          ref={this.calculatorRef}
        />
      </Aux>
    );
  }
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
