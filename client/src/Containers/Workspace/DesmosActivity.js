import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Script from 'react-load-script';
import classes from './graph.css';
import Aux from '../../Components/HOC/Auxil';
import API from '../../utils/apiRequests';
// import { SVGRenderer } from '../../utils/Desmos';
// import { RichTextView } from '../../utils/Desmos';
// import { Player } from '../../utils/Desmos';
// import { AnalysisContext } from '../../utils/Desmos';
// import { updatedRoom } from '../../store/actions';
class DesmosActivity extends Component {
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
  //     const svgRenderer = new SVGRenderer();

  //     let currentStep = 0;
  //     /** List of responseData objects emitted by the Player API in the order they were received */
  //     let responses = [];
  //     window.responses = responses;
  //     let studentAnalysis;

  //     (async function run() {
  //       const URL =
  //         'https://teacher.desmos.com/activitybuilder/export/5f4fef971a5f552ac10e39f7';

  //       const res = await fetch(URL, { headers: { Accept: 'application/json' } });
  //       const activityConfig = await res.json();

  //       const analysisContext = new AnalysisContext(activityConfig);

  //       //Analysis with student data can be used to query both student responses, CL-driven changes in the activity
  //       studentAnalysis = analysisContext.getStudentAnalysis();

  //       //Create a player API so that we have student data to analyze
  //       const player = new Player({
  //         activityConfig,
  //         targetElement: this.calculator,
  //         /** When responses are received, store them in a list to be replayed one by one */
  //         onResponseDataUpdated: (studentResponses) => {
  //           responses.push(studentResponses);
  //           _updateStepCountText();

  //           // Auto-play the initial step
  //           if (responses.length === 1) {
  //             step();
  //           }
  //         },
  //       });
  //       _addButtonHandlers(activityConfig);
  //     })();
  //   }

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
            url="https://teacher.desmos.com/activitybuilder/export/5f4fef971a5f552ac10e39f7"
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

DesmosActivity.propTypes = {
  activity: PropTypes.shape({}).isRequired,
  currentTab: PropTypes.string.isRequired,
  tab: PropTypes.shape({}).isRequired,
  role: PropTypes.string.isRequired,
  setFirstTabLoaded: PropTypes.func.isRequired,
  updateActivityTab: PropTypes.func.isRequired,
};

export default DesmosActivity;
