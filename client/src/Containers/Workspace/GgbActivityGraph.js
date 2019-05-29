// Theres a lot of repetiion between this component and the regular Ggb Graph...for example they both resize @TODO how might we utilize HOCs to cut down on repetition
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Script from 'react-load-script';
import { parseString } from 'xml2js';
import throttle from 'lodash/throttle';
import { Aux } from '../../Components';
import classes from './graph.css';

class GgbActivityGraph extends Component {
  state = {
    // loading: true
  };

  graph = React.createRef();
  isFileLoaded = false;
  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions);
    // if (window.ggbApplet) {
    //   this.initializeGgb();
    // }
  }

  // componentDidUpdate(prevProps, prevState) {
  //   // if (prevProps.currentTab !== this.props.currentTab) {
  //   //   // by wrapping this in a setimteout of 0 I'm attempting to delay all of the event blocking geogebra operations
  //   //   // until after any UI updates////can't quite tell if it working...when switching tab the tab animation should be smoothe
  //   //   setTimeout(() => {
  //   //     let {
  //   //       currentState,
  //   //       startingPoint,
  //   //       ggbFile,
  //   //       perspective
  //   //     } = this.props.tabs[this.props.currentTab];
  //   //     if (perspective) this.ggbApplet.setPerspective(perspective);
  //   //     initPerspectiveListener(document, perspective, this.perspectiveChanged);
  //   //     if (currentState) {
  //   //       this.ggbApplet.setXML(currentState);
  //   //       this.registerListeners();
  //   //     } else if (startingPoint) {
  //   //       this.ggbApplet.setXML(startingPoint);
  //   //       this.registerListeners();
  //   //     } else if (ggbFile) {
  //   //       this.ggbApplet.setBase64(ggbFile, () => {
  //   //         this.getGgbState();
  //   //         if (this.props.user._id === this.props.activity.creator) {
  //   //           this.freezeElements(false);
  //   //         }
  //   //       });
  //   //     } else {
  //   //       // this.ggbApplet.setXML(INITIAL_GGB);
  //   //       this.registerListeners();
  //   //     }
  //   //   }, 0);
  //   //   // Waiting for the tabs to populate if they haven't akready
  //   // } else if (!prevProps.tabs[0].name && this.props.tabs[0].name) {
  //   //   this.initializeGgb();
  //   // }
  // }

  // // shouldComponentUpdate(nextProps) {
  // //   return (
  // //     this.props.tabId === this.props.currentTab ||
  // //     nextProps.tabId === nextProps.currentTab
  // //   );
  // // }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.loadingTimer) {
      clearInterval(this.loadingTimer);
    }
    if (this.ggbApplet && this.ggbApplet.listeners) {
      // delete window.ggbApplet;
      this.ggbApplet.unregisterAddListener(this.addListener);
      this.ggbApplet.unregisterUpdateListener();
      this.ggbApplet.unregisterRemoveListener(this.eventListener);
      this.ggbApplet.unregisterClearListener(this.clearListener);
      this.ggbApplet.unregisterClientListener(this.clientListener);
    }
    delete window.ggbApplet;
  }

  // Save new state to the redux store on each modification to the construction
  // When the user leaves the room we'll update the backend (that way we only do it once)
  getGgbState = throttle(() => {
    const { role, tabs, currentTab, activity, updateActivityTab } = this.props;
    if (role === 'facilitator') {
      const updatedTabs = [...tabs];
      const updatedTab = { ...tabs[currentTab] };
      updatedTab.currentState = this.ggbApplet.getXML();
      updatedTabs[currentTab] = updatedTab;
      updateActivityTab(activity._id, updatedTab._id, {
        currentState: updatedTab.currentState,
      });
      // this.props.updatedActivity(this.props.activity._id, {tabs: updatedTabs})
    } else {
      // eslint-disable-next-line no-alert
      window.alert(
        'You cannot edit this activity because you are not the owner. If you want to make changes, copy it to your list of activities first.'
      );
    }
  }, 1000);

  perspectiveChanged = newPerspectiveCode => {
    const { tabs, currentTab, activity, updateActivityTab } = this.props;
    const updatedTab = { ...tabs[currentTab] };
    updateActivityTab(activity._id, updatedTab._id, {
      perspective: newPerspectiveCode,
    });

    // // REinitialize listener with new perspective
    // initPerspectiveListener(
    //   document,
    //   newPerspectiveCode,
    //   this.perspectiveChanged
    // );
  };

  updateDimensions = () => {
    const { loading } = this.state;
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
    this.resizeTimer = setTimeout(async () => {
      if (this.graph.current && !loading) {
        const { clientHeight, clientWidth } = this.graph.current.parentElement;
        window.ggbApplet.setSize(clientWidth, clientHeight);
        // window.ggbApplet.evalCommand('UpdateConstruction()'
      }
      this.resizeTimer = undefined;
    }, 200);
  };

  getRelativeCoords = element => {
    return new Promise(async resolve => {
      let elX;
      let elY;
      try {
        elX = this.ggbApplet.getXcoord(element);
        elY = this.ggbApplet.getYcoord(element);
      } catch (err) {
        // get the coords of its children
      }
      // Get the element's location relative to the client Window
      // eslint-disable-next-line no-console
      console.log(' GGB activity graph: ', this.graph.current);

      const ggbCoords = this.graph.current.getBoundingClientRect();
      const construction = await this.parseXML(this.ggbApplet.getXML()); // IS THERE ANY WAY TO DO THIS WITHOUT HAVING TO ASYNC PARSE THE XML...
      const euclidianView = construction.geogebra.euclidianView[0];
      const { xZero, yZero, scale } = euclidianView.coordSystem[0].$;
      let { yScale } = euclidianView.coordSystem[0].$;
      if (!yScale) yScale = scale;
      const { width, height } = euclidianView.size[0].$;
      const xOffset =
        ggbCoords.width - width + parseInt(xZero, 10) + elX * scale;
      const yOffset =
        ggbCoords.height - height + parseInt(yZero, 10) - elY * yScale;
      resolve({ left: xOffset, top: yOffset });
    });
  };

  onScriptLoad = () => {
    const { tabId, role, tabs, currentTab, isFirstTabLoaded } = this.props;
    const parameters = {
      id: `ggb-element${tabId}A`,
      // "scaleContainerClasse": "graph",
      // customToolBar:
      // "0 39 73 62 | 1 501 67 , 5 19 , 72 75 76 | 2 15 45 , 18 65 , 7 37 | 4 3 8 9 , 13 44 , 58 , 47 | 16 51 64 , 70 | 10 34 53 11 , 24  20 22 , 21 23 | 55 56 57 , 12 | 36 46 , 38 49  50 , 71  14  68 | 30 29 54 32 31 33 | 25 17 26 60 52 61 | 40 41 42 , 27 28 35 , 6",
      showToolBar: role === 'facilitator',
      showMenuBar: role === 'facilitator',
      showAlgebraInput: true,
      language: 'en',
      useBrowserForJS: false,
      borderColor: '#ddd',
      buttonShadows: true,
      errorDialogsActive: false,
      preventFocus: true,
      // filename: this.props.tabs[this.props.tabId].ggbFile || null,
      appletOnLoad: this.initializeGgb,
      appName: tabs[tabId].appName || 'classic',
    };
    const ggbApp = new window.GGBApplet(parameters, '6.0');
    if (currentTab === tabId) {
      ggbApp.inject(`ggb-element${tabId}A`);
    } else {
      this.loadingTimer = setInterval(() => {
        if (isFirstTabLoaded) {
          ggbApp.inject(`ggb-element${tabId}A`);
          clearInterval(this.loadingTimer);
        }
      }, 500);
    }
  };

  initializeGgb = () => {
    const { tabs, tabId, user, activity, setFirstTabLoaded } = this.props;
    this.ggbApplet = window.ggbApplet;
    // this.setState({ loading: false });
    const { currentState, startingPoint, ggbFile } = tabs[tabId];
    //
    if (currentState) {
      this.ggbApplet.setXML(currentState);
    } else if (startingPoint) {
      this.ggbApplet.setXML(startingPoint);
    } else if (ggbFile && !this.isFileLoaded) {
      this.isFileLoaded = true;
      this.ggbApplet.setBase64(ggbFile);
    }
    //  else if (perspective) {
    //   console.log("[erspecitve");
    //   this.ggbApplet.setPerspective(perspective);
    // }
    if (user._id === activity.creator) {
      this.freezeElements(false);
      // this.freezeElements(true)
    } else {
      this.freezeElements(true);
    }
    this.registerListeners();
    setFirstTabLoaded();
    // put the current construction on the graph, disable everything until the user takes control
  };

  parseXML = xml => {
    return new Promise((resolve, reject) => {
      parseString(xml, (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      });
    });
  };

  freezeElements = freeze => {
    const allElements = this.ggbApplet.getAllObjectNames(); // WARNING ... THIS METHOD IS DEPRECATED
    allElements.forEach(element => {
      // AS THE CONSTRUCTION GETS BIGGER THIS GETS SLOWER...SET_FIXED IS BLOCKING
      this.ggbApplet.setFixed(element, freeze, true); // Unfix/fix all of the elements
    });

    this.ggbApplet.enableRightClick(!freeze);
    this.ggbApplet.showToolBar(!freeze);
    this.ggbApplet.setMode(freeze ? 40 : 0);
  };

  registerListeners() {
    this.ggbApplet.registerAddListener(this.getGgbState);
    this.ggbApplet.registerUpdateListener(this.getGgbState);
    this.ggbApplet.registerRemoveListener(this.getGgbState);
    this.ggbApplet.registerClickListener(this.getGgbState);
  }

  render() {
    const { tabId } = this.props;
    return (
      <Aux>
        <Script
          url="https://cdn.geogebra.org/apps/deployggb.js"
          onLoad={this.onScriptLoad}
        />
        <div
          className={classes.Graph}
          style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
          id={`ggb-element${tabId}A`}
          ref={this.graph}
        />
      </Aux>
    );
  }
}

GgbActivityGraph.propTypes = {
  role: PropTypes.string.isRequired,
  currentTab: PropTypes.number.isRequired,
  tabs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  tabId: PropTypes.number.isRequired,
  user: PropTypes.shape({}).isRequired,
  activity: PropTypes.shape({}).isRequired,
  isFirstTabLoaded: PropTypes.bool.isRequired,
  setFirstTabLoaded: PropTypes.func.isRequired,
  updateActivityTab: PropTypes.func.isRequired,
};

export default GgbActivityGraph;
