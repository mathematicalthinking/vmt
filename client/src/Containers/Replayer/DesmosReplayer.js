import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Script from 'react-load-script';
import API from '../../utils/apiRequests';

class DesmosReplayer extends Component {
  state = {
    // tabStates: {},
  };

  calculatorRef = React.createRef();

  componentDidMount() {
    if (window.Desmos) {
      this.onScriptLoad();
      // let { inView, tab } = this.props;
      // this.calculator = window.Desmos.GraphingCalculator(
      //   this.calculatorRef.current
      // );
      // if (inView && tab.desmosLink) {
      //   API.getDesmos(tab.desmosLink)
      //     .then(res => {
      //       this.calculator.setState(res.data.result.state);
      //       this.props.setTabLoaded(tab._id);
      //     })
      //     .catch(err => console.log(err));
      // } else {
      //   this.props.setTabLoaded(tab._id);
      // }
    }
  }

  // shouldComponentUpdate(nextProps) {
  //   if (this.props.inView && this.props.index !== nextProps.index) {
  //     return true;
  //   } else if (this.props.loading && !nextProps.loading) {
  //     return true;
  //   } else return false;
  // }

  componentDidUpdate(prevProps) {
    const { inView, index, log } = this.props;
    if (inView) {
      if (prevProps.index !== index && log[index].currentState) {
        this.calculator.setState(log[index].currentState);
      }
    }
  }
  componentWillUnmount() {
    if (this.calculator) {
      this.calculator.unobserveEvent('change');
      this.calculator.destroy();
    }
  }

  onScriptLoad = () => {
    const { tab, setTabLoaded } = this.props;
    this.calculator = window.Desmos.GraphingCalculator(
      this.calculatorRef.current
    );
    if (tab.startingPoint.length) {
      this.calculator.setState(tab.startingPoint);
      setTabLoaded(tab._id);
    } else if (tab.desmosLink) {
      API.getDesmos(tab.desmosLink)
        .then((res) => {
          this.calculator.setState(res.data.result.state);
          setTabLoaded(tab._id);
        })
        // eslint-disable-next-line no-console
        .catch((err) => console.log(err));
    } else {
      this.calculator.setBlank();
      setTabLoaded(tab._id);
    }
  };

  render() {
    return (
      <Fragment>
        {!window.Desmos ? (
          <Script
            url="https://www.desmos.com/api/v1.1/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"
            onLoad={this.onScriptLoad}
          />
        ) : null}
        <div
          style={{ height: '100%', width: '100%' }}
          id="calculator"
          ref={this.calculatorRef}
        />
      </Fragment>
    );
  }
}

DesmosReplayer.propTypes = {
  inView: PropTypes.bool.isRequired,
  log: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  index: PropTypes.func.isRequired,
  tab: PropTypes.shape({}).isRequired,
  setTabLoaded: PropTypes.func.isRequired,
};

export default DesmosReplayer;
