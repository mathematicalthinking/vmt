import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Script from 'react-load-script';
import classes from './graph.css';
import Aux from '../../Components/HOC/Auxil';
import API from '../../utils/apiRequests';
// import { updatedRoom } from '../../store/actions';
class DesmosActivityGraph extends Component {
  // state = {
  //   loading: window.Desmos ? false : true,
  // };
  calculatorRef = React.createRef();

  componentDidMount() {
    const { tab, setFirstTabLoaded } = this.props;
    if (window.Desmos) {
      this.calculator = window.Desmos.GraphingCalculator(
        this.calculatorRef.current
      );
      // this.setState({ loading: false });
      if (tab.currentState) {
        this.calculator.setState(tab.currentState);
      } else if (tab.desmosLink) {
        API.getDesmos(tab.desmosLink)
          .then((res) => {
            this.calculator.setState(res.data.result.state);
          })
          // eslint-disable-next-line no-console
          .catch((err) => console.log(err));
      }
      setFirstTabLoaded();
    }
  }

  componentDidUpdate(prevProps) {
    const { currentTab, role, activity, updateActivityTab } = this.props;
    if (prevProps.currentTab !== currentTab) {
      if (role === 'facilitator') {
        const updatedTabs = [...prevProps.activity.tabs];
        const updatedTab = updatedTabs[prevProps.currentTab];
        updatedTab.currentState = JSON.stringify({
          ...this.calculator.getState(),
        });
        updatedTabs[currentTab] = updatedTab;
        updateActivityTab(activity._id, updatedTab._id, {
          currentState: updatedTab.currentState,
        });
      }
      this.calculator.setState(activity.tabs[currentTab].currentState);
    }
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
    this.calculator.unobserveEvent('change');
    this.calculator.destroy();
  }

  onScriptLoad = () => {
    const { tab, setFirstTabLoaded } = this.props;
    const { desmosLink } = tab;
    this.calculator = window.Desmos.GraphingCalculator(
      this.calculatorRef.current
    );
    if (tab.currentState) {
      this.calculator.setState(tab.currentState);
      // this.setState({ loading: false });
    } else if (desmosLink) {
      API.getDesmos(desmosLink)
        .then((res) => {
          this.calculator.setState(res.data.result.state);
          // this.setState({ loading: false });
          // this.initializeListeners();
        })
        // eslint-disable-next-line no-console
        .catch((err) => console.log(err));
    } else {
      // this.setState({ loading: false });
    }
    setFirstTabLoaded();
  };

  render() {
    return (
      <Aux>
        {!window.Desmos ? (
          <Script
            url="https://www.desmos.com/api/v1.2/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"
            onLoad={this.onScriptLoad}
          />
        ) : null}
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
  currentTab: PropTypes.string.isRequired,
  tab: PropTypes.shape({}).isRequired,
  role: PropTypes.string.isRequired,
  setFirstTabLoaded: PropTypes.func.isRequired,
  updateActivityTab: PropTypes.func.isRequired,
};

export default DesmosActivityGraph;
