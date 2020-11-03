import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './graph.css';
import Aux from '../../Components/HOC/Auxil';
// import { Player } from '../../utils/desmos/api.js';
// import API from '../../utils/apiRequests';
// import { updatedRoom } from '../../store/actions';
class DesmosActivityGraph extends Component {
  // state = {
  //   loading: window.Desmos ? false : true,
  // };
  calculatorRef = React.createRef();

  componentDidMount() {
    const { setFirstTabLoaded } = this.props;

    const URL =
      'https://teacher.desmos.com/activitybuilder/export/5ddbf9ae009cd90bcdeaadd7';

    // let activityConfig;

    fetch(URL, { headers: { Accept: 'application/json' } })
      .then((res) => res.json())
      .then((json) => {
        const activityConfig = json;

        const player = new window.PlayerAPI.Player({
          activityConfig,
          targetElement: this.calculatorRef.current,
        });

        if (player) console.log('Desmos Activity Player Initialized');

        setFirstTabLoaded();
      });

    // this.calculator = window.Desmos.GraphingCalculator(
    //   this.calculatorRef.current
    // );
  }

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
    const { role, activity, tab, updateActivityTab } = this.props;
    // save on unmount
    if (role === 'facilitator') {
      updateActivityTab(activity._id, tab._id, {
        currentState: JSON.stringify({
          ...this.calculator.getState(),
        }),
      });
    }
    // this.calculator.unobserveEvent('change');
    // this.calculator.destroy();
  }

  render() {
    return (
      <Aux>
        <div>Welcome to Desmos Activities!</div>
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
  activity: PropTypes.shape({}).isRequired,
  // currentTab: PropTypes.string.isRequired,
  tab: PropTypes.shape({}).isRequired,
  role: PropTypes.string.isRequired,
  setFirstTabLoaded: PropTypes.func.isRequired,
  updateActivityTab: PropTypes.func.isRequired,
};

export default DesmosActivityGraph;
