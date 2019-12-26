// Theres a lot of repetiion between this component and the regular Ggb Graph...for example they both resize @TODO how might we utilize HOCs to cut down on repetition
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Script from 'react-load-script';
import { parseString } from 'xml2js';
import throttle from 'lodash/throttle';
import isFinite from 'lodash/isFinite';
import { Aux } from '../../Components';
import classes from './graph.css';

class GgbActivityGraph extends Component {
  graph = React.createRef();
  isFileLoaded = false;
  constructor(props) {
    super(props);
    this.getGgbState = throttle(
      () => {
        const { role, tab, updateActivityTab, activity } = this.props;
        if (role === 'facilitator' && this.ggbApplet) {
          const base64 = this.ggbApplet.getBase64();
          updateActivityTab(activity._id, tab._id, {
            currentStateBase64: base64,
          });
        } else {
          // eslint-disable-next-line no-alert
          window.alert(
            'You cannot edit this activity because you are not the owner. If you want to make changes, copy it to your list of activities first.'
          );
        }
      },
      1000,
      { leading: false }
    );
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions);
    window.addEventListener('scroll', this.scrollChange);
    if (this.graph.current) {
      this.graph.current.addEventListener('mouseenter', this.lockWindowScroll);

      this.graph.current.addEventListener(
        'mouseleave',
        this.unlockWindowScroll
      );
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
    window.removeEventListener('scroll', this.scrollChange);
    if (this.graph.current) {
      this.graph.current.removeEventListener(
        'mouseenter',
        this.lockWindowScroll
      );

      this.graph.current.removeEventListener(
        'mouseleave',
        this.unlockWindowScroll
      );
    }

    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.loadingTimer) {
      clearInterval(this.loadingTimer);
    }
    if (this.ggbApplet) {
      this.ggbApplet.unregisterAddListener(this.getGgbState);
      this.ggbApplet.unregisterUpdateListener(this.getGgbState);
      this.ggbApplet.unregisterRemoveListener(this.getGgbState);
      this.ggbApplet.unregisterClearListener(this.getGgbState);
      this.ggbApplet.unregisterClientListener(this.clientListener);
    }
    delete window.ggbApplet;
  }

  updateDimensions = async () => {
    const { tab } = this.props;
    if (this.graph.current && this.ggbApplet) {
      const { clientHeight, clientWidth } = this.graph.current.parentElement;
      this.ggbApplet.setSize(clientWidth, clientHeight);
      this.ggbApplet.recalculateEnvironments();
      const appScalar = document.querySelector(`#ggb-element${tab._id}A`)
        .firstChild;
      appScalar.style.width = `${clientWidth}px`;
      this.forceUpdate();
    }
  };

  onScriptLoad = () => {
    const { role, tab, currentTab } = this.props;
    const parameters = {
      id: `ggbApplet${tab._id}A`,
      // customToolBar:
      // "0 39 73 62 | 1 501 67 , 5 19 , 72 75 76 | 2 15 45 , 18 65 , 7 37 | 4 3 8 9 , 13 44 , 58 , 47 | 16 51 64 , 70 | 10 34 53 11 , 24  20 22 , 21 23 | 55 56 57 , 12 | 36 46 , 38 49  50 , 71  14  68 | 30 29 54 32 31 33 | 25 17 26 60 52 61 | 40 41 42 , 27 28 35 , 6",
      showToolBar: role === 'facilitator',
      showMenuBar: role === 'facilitator',
      showAlgebraInput: false,
      language: 'en',
      useBrowserForJS: false,
      borderColor: '#ddd',
      buttonShadows: true,
      errorDialogsActive: false,
      preventFocus: true,
      appletOnLoad: this.initializeGgb,
      appName: tab.appName || 'classic',
    };
    const ggbApp = new window.GGBApplet(parameters, '6.0');
    if (currentTab === tab._id) {
      ggbApp.inject(`ggb-element${tab._id}A`);
    } else {
      this.loadingTimer = setInterval(() => {
        const { isFirstTabLoaded } = this.props;
        if (isFirstTabLoaded) {
          ggbApp.inject(`ggb-element${tab._id}A`);
          clearInterval(this.loadingTimer);
        }
      }, 500);
    }
  };

  initializeGgb = () => {
    const { tab, setFirstTabLoaded, currentTab } = this.props;
    this.ggbApplet = window[`ggbApplet${tab._id}A`];

    const {
      currentState,
      startingPoint,
      ggbFile,
      currentStateBase64,
      startingPointBase64,
    } = tab;

    if (currentStateBase64) {
      if (this.isFileLoaded) {
        this.registerListeners();
        return;
      }
      this.isFileLoaded = true;
      this.ggbApplet.setBase64(currentStateBase64);
    } else if (currentState) {
      this.ggbApplet.setXML(currentState);
    } else if (startingPointBase64) {
      if (this.isFileLoaded) {
        this.registerListeners();
        return;
      }
      this.isFileLoaded = true;
      this.ggbApplet.setBase64(startingPointBase64);
    } else if (startingPoint) {
      this.ggbApplet.setXML(startingPoint);
    } else if (ggbFile && !this.isFileLoaded) {
      this.isFileLoaded = true;
      this.ggbApplet.setBase64(ggbFile);
    }
    this.registerListeners();
    if (currentTab === tab._id) {
      setFirstTabLoaded();
    }
  };

  parseXML = (xml) => {
    return new Promise((resolve, reject) => {
      parseString(xml, (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      });
    });
  };

  scrollChange = () => {
    if (isFinite(this.scrollX) && isFinite(this.scrollY)) {
      window.scrollTo(this.scrollX, this.scrollY);
    }
  };

  lockWindowScroll = () => {
    this.scrollX = window.scrollX;
    this.scrollY = window.scrollY;
  };

  unlockWindowScroll = () => {
    this.scrollX = null;
    this.scrollY = null;
  };

  clientListener = (event) => {
    if (!event) {
      return;
    }

    const { type } = event;
    switch (type) {
      case 'setMode':
        // since we always set the mode to a default value when loading a room or activity,
        // it seems unnecessary to save the activity state to the db when changing the mode
        return;
      default:
        break;
    }

    this.getGgbState();
  };

  registerListeners() {
    this.ggbApplet.unregisterAddListener(this.getGgbState);
    this.ggbApplet.unregisterUpdateListener(this.getGgbState);
    this.ggbApplet.unregisterRemoveListener(this.getGgbState);
    this.ggbApplet.unregisterClearListener(this.getGgbState);
    this.ggbApplet.unregisterClientListener(this.clientListener);

    this.ggbApplet.registerAddListener(this.getGgbState);
    this.ggbApplet.registerUpdateListener(this.getGgbState);
    this.ggbApplet.registerRemoveListener(this.getGgbState);
    this.ggbApplet.registerClearListener(this.getGgbState);
    this.ggbApplet.registerClientListener(this.clientListener);
  }

  render() {
    const { tab } = this.props;
    return (
      <Aux>
        {tab ? (
          <Script
            url="https://cdn.geogebra.org/apps/deployggb.js"
            onLoad={this.onScriptLoad}
          />
        ) : null}
        <div
          className={classes.Graph}
          style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
          id={`ggb-element${tab._id}A`}
          ref={this.graph}
        />
      </Aux>
    );
  }
}

GgbActivityGraph.propTypes = {
  role: PropTypes.string.isRequired,
  currentTab: PropTypes.string.isRequired,
  user: PropTypes.shape({}).isRequired,
  activity: PropTypes.shape({}).isRequired,
  isFirstTabLoaded: PropTypes.bool.isRequired,
  setFirstTabLoaded: PropTypes.func.isRequired,
  tab: PropTypes.shape({}).isRequired,
  updateActivityTab: PropTypes.func.isRequired,
};

export default GgbActivityGraph;
