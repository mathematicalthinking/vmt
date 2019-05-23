// Theres a lot of repetiion between this component and the regular Ggb Graph...for example they both resize @TODO how might we utilize HOCs to cut down on repetition
import React, { Component } from 'react';
import { parseString } from 'xml2js';
import throttle from 'lodash/throttle';
import { Aux, Modal } from '../../Components';
import Script from 'react-load-script';
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

  componentDidUpdate(prevProps, prevState) {
    // if (prevProps.currentTab !== this.props.currentTab) {
    //   // by wrapping this in a setimteout of 0 I'm attempting to delay all of the event blocking geogebra operations
    //   // until after any UI updates////can't quite tell if it working...when switching tab the tab animation should be smoothe
    //   setTimeout(() => {
    //     let {
    //       currentState,
    //       startingPoint,
    //       ggbFile,
    //       perspective
    //     } = this.props.tabs[this.props.currentTab];
    //     if (perspective) this.ggbApplet.setPerspective(perspective);
    //     initPerspectiveListener(document, perspective, this.perspectiveChanged);
    //     if (currentState) {
    //       this.ggbApplet.setXML(currentState);
    //       this.registerListeners();
    //     } else if (startingPoint) {
    //       this.ggbApplet.setXML(startingPoint);
    //       this.registerListeners();
    //     } else if (ggbFile) {
    //       this.ggbApplet.setBase64(ggbFile, () => {
    //         this.getGgbState();
    //         if (this.props.user._id === this.props.activity.creator) {
    //           this.freezeElements(false);
    //         }
    //       });
    //     } else {
    //       // this.ggbApplet.setXML(INITIAL_GGB);
    //       this.registerListeners();
    //     }
    //   }, 0);
    //   // Waiting for the tabs to populate if they haven't akready
    // } else if (!prevProps.tabs[0].name && this.props.tabs[0].name) {
    //   this.initializeGgb();
    // }
  }

  // shouldComponentUpdate(nextProps) {
  //   return (
  //     this.props.tabId === this.props.currentTab ||
  //     nextProps.tabId === nextProps.currentTab
  //   );
  // }

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

  perspectiveChanged = newPerspectiveCode => {
    let updatedTab = { ...this.props.tabs[this.props.currentTab] };
    this.props.updateActivityTab(this.props.activity._id, updatedTab._id, {
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
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
    this.resizeTimer = setTimeout(async () => {
      if (this.graph.current && !this.state.loading) {
        let { clientHeight, clientWidth } = this.graph.current.parentElement;
        window.ggbApplet.setSize(clientWidth, clientHeight);
        // window.ggbApplet.evalCommand('UpdateConstruction()')
        if (
          this.props.showingReference ||
          (this.props.referencing &&
            this.props.referToEl.elmentType !== 'chat_message')
        ) {
          let { element } = this.props.referToEl;
          let position = await this.getRelativeCoords(element);
          this.props.setToElAndCoords(null, position);
        }
      }
      this.resizeTimer = undefined;
    }, 200);
  };

  getRelativeCoords = element => {
    return new Promise(async (resolve, reject) => {
      let elX;
      let elY;
      try {
        elX = this.ggbApplet.getXcoord(element);
        elY = this.ggbApplet.getYcoord(element);
      } catch (err) {
        // get the coords of its children
      }
      // Get the element's location relative to the client Window
      console.log(' GGB activity graph: ', this.graph.current);

      let ggbCoords = this.graph.current.getBoundingClientRect();
      let construction = await this.parseXML(this.ggbApplet.getXML()); // IS THERE ANY WAY TO DO THIS WITHOUT HAVING TO ASYNC PARSE THE XML...
      let euclidianView = construction.geogebra.euclidianView[0];
      let { xZero, yZero, scale, yScale } = euclidianView.coordSystem[0].$;
      if (!yScale) yScale = scale;
      let { width, height } = euclidianView.size[0].$;
      let xOffset = ggbCoords.width - width + parseInt(xZero, 10) + elX * scale;
      let yOffset =
        ggbCoords.height - height + parseInt(yZero, 10) - elY * yScale;
      resolve({ left: xOffset, top: yOffset });
    });
  };

  onScriptLoad = () => {
    const parameters = {
      id: `ggb-element${this.props.tabId}A`,
      // "scaleContainerClasse": "graph",
      // customToolBar:
      // "0 39 73 62 | 1 501 67 , 5 19 , 72 75 76 | 2 15 45 , 18 65 , 7 37 | 4 3 8 9 , 13 44 , 58 , 47 | 16 51 64 , 70 | 10 34 53 11 , 24  20 22 , 21 23 | 55 56 57 , 12 | 36 46 , 38 49  50 , 71  14  68 | 30 29 54 32 31 33 | 25 17 26 60 52 61 | 40 41 42 , 27 28 35 , 6",
      showToolBar: this.props.role === 'facilitator',
      showMenuBar: this.props.role === 'facilitator',
      showAlgebraInput: true,
      language: 'en',
      useBrowserForJS: false,
      borderColor: '#ddd',
      buttonShadows: true,
      errorDialogsActive: false,
      preventFocus: true,
      // filename: this.props.tabs[this.props.tabId].ggbFile || null,
      appletOnLoad: this.initializeGgb,
      appName: this.props.tabs[this.props.tabId].appName || 'classic',
    };
    const ggbApp = new window.GGBApplet(parameters, '6.0');
    if (this.props.currentTab === this.props.tabId) {
      ggbApp.inject(`ggb-element${this.props.tabId}A`);
    } else {
      this.loadingTimer = setInterval(() => {
        if (this.props.isFirstTabLoaded) {
          ggbApp.inject(`ggb-element${this.props.tabId}A`);
          clearInterval(this.loadingTimer);
        }
      }, 500);
    }
  };

  initializeGgb = () => {
    this.ggbApplet = window.ggbApplet;
    // this.setState({ loading: false });
    let { currentState, startingPoint, ggbFile, perspective } = this.props.tabs[
      this.props.tabId
    ];
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
    if (this.props.user._id === this.props.activity.creator) {
      this.freezeElements(false);
      // this.freezeElements(true)
    } else {
      this.freezeElements(true);
    }
    this.registerListeners();
    this.props.setFirstTabLoaded();
    // put the current construction on the graph, disable everything until the user takes control
  };

  // Save new state to the redux store on each modification to the construction
  // When the user leaves the room we'll update the backend (that way we only do it once)
  getGgbState = throttle(() => {
    if (this.props.role === 'facilitator') {
      let updatedTabs = [...this.props.tabs];
      let updatedTab = { ...this.props.tabs[this.props.currentTab] };
      updatedTab.currentState = this.ggbApplet.getXML();
      updatedTabs[this.props.currentTab] = updatedTab;
      this.props.updateActivityTab(this.props.activity._id, updatedTab._id, {
        currentState: updatedTab.currentState,
      });
      // this.props.updatedActivity(this.props.activity._id, {tabs: updatedTabs})
    } else {
      alert(
        'You cannot edit this activity because you are not the owner. If you want to make changes, copy it to your list of activities first.'
      );
    }
  }, 1000);

  registerListeners() {
    this.ggbApplet.registerAddListener(this.getGgbState);
    this.ggbApplet.registerUpdateListener(this.getGgbState);
    this.ggbApplet.registerRemoveListener(this.getGgbState);
    this.ggbApplet.registerClickListener(this.getGgbState);
  }

  parseXML = xml => {
    return new Promise((resolve, reject) => {
      parseString(xml, (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      });
    });
  };

  freezeElements = freeze => {
    let allElements = this.ggbApplet.getAllObjectNames(); // WARNING ... THIS METHOD IS DEPRECATED
    allElements.forEach(element => {
      // AS THE CONSTRUCTION GETS BIGGER THIS GETS SLOWER...SET_FIXED IS BLOCKING
      this.ggbApplet.setFixed(element, freeze, true); // Unfix/fix all of the elements
    });

    this.ggbApplet.enableRightClick(!freeze);
    this.ggbApplet.showToolBar(!freeze);
    this.ggbApplet.setMode(freeze ? 40 : 0);
  };

  render() {
    return (
      <Aux>
        <Script
          url="https://cdn.geogebra.org/apps/deployggb.js"
          onLoad={this.onScriptLoad}
        />
        <div
          className={classes.Graph}
          style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
          id={`ggb-element${this.props.tabId}A`}
          ref={this.graph}
        />
      </Aux>
    );
  }
}

export default GgbActivityGraph;
