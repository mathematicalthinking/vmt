import React, { Component } from "react";
import classes from "./graph.css";
import { Aux, Modal } from "../../Components";
import INITIAL_GGB from "./blankGgb";
import Script from "react-load-script";
import throttle from "lodash/throttle";
import socket from "../../utils/sockets";

import { initPerspectiveListener } from "./ggbUtils";
// import { eventNames } from 'cluster';
// THINK ABOUT GETTING RID OF ALL XML PARSING...THERE ARE PROBABLY NATIVE GGB METHODS THAT CAN ACCOMPLISH EVERYTHING WE NEEDd
const THROTTLE_FIDELITY = 60;
/**
 * @props:
 *  room,
 *  updateRoom()
 */

class GgbGraph extends Component {
  state = {
    receivingData: false,
    loadingWorkspace: true,
    loading: true,
    selectedElement: "",
    showControlWarning: false,
    warningPosition: { x: 0, y: 0 },
    switchingControl: false
  };

  graph = React.createRef();

  // For batching events
  eventQueue = [];
  firstLabel;
  pointCounter = 1;
  noOfPoints;
  updatingOn = true;
  resetting = false; // used to reset the construction when something is done by a user not in control.

  componentDidMount() {
    // window.addEventListener('click', this.clickListener)
    window.addEventListener("resize", this.updateDimensions);
    socket.removeAllListeners("RECEIVE_EVENT");
    socket.on("RECEIVE_EVENT", data => {
      let updatedTabs = this.props.room.tabs.map(tab => {
        if (tab._id === data.tab) {
          tab.currentState = data.currentState;
        }
        return tab;
      });
      this.props.updatedRoom(this.props.room._id, { tabs: updatedTabs });
      this.setState({ receivingData: true }, () => {
        // If this happend on the current tab
        if (this.props.room.tabs[this.props.currentTab]._id === data.tab) {
          // @TODO consider abstracting out...resued in the GgbReplayer
          switch (data.eventType) {
            case "ADD":
              if (data.definition) {
                this.ggbApplet.evalCommand(`${data.label}:${data.definition}`);
              }
              this.ggbApplet.evalXML(data.event);
              this.ggbApplet.evalCommand("UpdateConstruction()");
              break;
            case "REMOVE":
              this.ggbApplet.deleteObject(data.label);
              break;
            case "UPDATE":
              this.ggbApplet.evalXML(data.event);
              this.ggbApplet.evalCommand("UpdateConstruction()");
              break;
            case "CHANGE_PERSPECTIVE":
              this.ggbApplet.setPerspective(data.event);
              this.ggbApplet.showAlgebraInput(true);
              // this.ggbApplet.evalXML(data.event);
              // this.ggbApplet.evalCommand("UpdateConstruction()");
              break;
            case "BATCH_UPDATE":
              this.ggbApplet.evalXML(data.event);
              this.ggbApplet.evalCommand("UpdateConstruction()");
              // this.recursiveUpdate(data.event, data.noOfPoints);
              break;
            case "BATCH_ADD":
              if (data.definition) {
                this.recursiveUpdate(data.event, 1, true);
              }
              break;
            default:
              break;
          }
        }
        // show a notificaiton if its on a different tab
        else {
          this.props.addNtfToTabs(data.tab);
        }
      });
    });
  }

  /**
   * @method componentDidUpdate
   * @description - determines what should happen when props update
   * and initializes socket event listeners
   * @param  {Object} prevProps - previous props before update
   */
  async componentDidUpdate(prevProps) {
    if (!this.ggbApplet) return;
    let { room, role } = this.props;
    let wasInControl = prevProps.room.controlledBy === this.props.user._id;
    let isInControl = this.props.room.controlledBy === this.props.user._id;
    let isSomeoneElseInControl = this.props.room.controlledBy && !isInControl;

    if (!wasInControl && isInControl) {
      this.setState({ switchingControl: true }, () => {
        console.log("SWITRHICNG CONTROL???");
        if (this.ggbApplet) {
          // this.ggbApplet.setMode(0);
          // im not really sure what this does we seem to get the same menu whether we specify all these numbers or not...but it was breaking the hamburger menu to do so
          // this.ggbApplet.showToolBar("0 39 73 62 | 1 501 67 , 5 19 , 72 75 76 | 2 15 45 , 18 65 , 7 37 | 4 3 8 9 , 13 44 , 58 , 47 | 16 51 64 , 70 | 10 34 53 11 , 24  20 22 , 21 23 | 55 56 57 , 12 | 36 46 , 38 49  50 , 71  14  68 | 30 29 54 32 31 33 | 25 17 26 60 52 61 | 40 41 42 , 27 28 35 , 6")
          // this.ggbApplet.showMenuBar(triue);
          console.log("showing tool bar");
          // this.ggbApplet.showToolBar(true);
          // this.ggbApplet.showMenuBar(true);
        }
        // setTimeout(() => {
        this.setState({ switchingControl: false }, () => {
          this.freezeElements(false);
        });
        if (
          room.settings.participantsCanChangePerspective ||
          role === "facilitator"
        ) {
          initPerspectiveListener(
            document,
            this.props.room.tabs[this.props.currentTab].perspective,
            this.perspectiveChanged
          );
        }
      });
    } else if (
      (wasInControl && !isInControl) ||
      (wasInControl && isSomeoneElseInControl)
    ) {
      console.log("ceding control");
      this.setState({ inControl: false });
    } else if (!prevProps.referencing && this.props.referencing) {
      this.ggbApplet.setMode(0); // Set tool to pointer so the user can select elements @question shpuld they have to be in control to reference
    } else if (prevProps.referencing && !this.props.referencing) {
      this.ggbApplet.setMode(40);
    }
    if (
      !prevProps.showingReference &&
      this.props.showingReference &&
      this.props.referToEl.elementType !== "chat_message"
    ) {
      // find the coordinates of the point we're referencing
      let position = await this.getRelativeCoords(this.props.referToEl.element);
      this.props.setToElAndCoords(null, position);
    } else if (
      this.props.showingReference &&
      prevProps.referToEl !== this.props.referToEl &&
      this.props.referToEl.elementType !== "chat_message"
    ) {
      let position = await this.getRelativeCoords(this.props.referToEl.element);
      this.props.setToElAndCoords(null, position);
    } else if (prevProps.currentTab !== this.props.currentTab) {
      let {
        currentState,
        startingPoint,
        ggbFile,
        perspective
      } = this.props.room.tabs[this.props.currentTab];
      // initPerspectiveListener(document, perspective, this.changePerspective);
      if (currentState) {
        this.ggbApplet.setXML(currentState);
        this.registerListeners();
      } else if (startingPoint) {
        this.ggbApplet.setXML(startingPoint);
        this.registerListeners();
      } else if (ggbFile) {
        this.ggbApplet.setBase64(ggbFile, () => {
          let updatedTabs = [...this.props.room.tabs];
          let updatedTab = { ...this.props.room.tabs[this.props.currentTab] };
          updatedTab.currentState = this.ggbApplet.getXML();
          updatedTabs[this.props.currentTab] = updatedTab;

          this.props.updatedRoom(this.props.room._id, { tabs: updatedTabs });
        });
      } else {
        // this.ggbApplet.setXML(INITIAL_GGB);
        this.registerListeners();
      }
      // if (perspective) {
      //   this.ggbApplet.setPerspective(perspective);
      // }
    }
  }

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
            this.props.referToEl.elmentType !== "chat_message")
        ) {
          let { element } = this.props.referToEl;
          let position = await this.getRelativeCoords(element);
          this.props.setToElAndCoords(null, position);
        }
      }
      this.resizeTimer = undefined;
    }, 200);
  };

  onScriptLoad = () => {
    // NOTE: complete list here: https://wiki.geogebra.org/en/Reference:GeoGebra_App_Parameters
    const parameters = {
      id: "ggbApplet",
      // "scaleContainerClasse": "graph",
      customToolBar:
        "0 39 73 62 | 1 501 67 , 5 19 , 72 75 76 | 2 15 45 , 18 65 , 7 37 | 4 3 8 9 , 13 44 , 58 , 47 | 16 51 64 , 70 | 10 34 53 11 , 24  20 22 , 21 23 | 55 56 57 , 12 | 36 46 , 38 49  50 , 71  14  68 | 30 29 54 32 31 33 | 25 17 26 60 52 61 | 40 41 42 , 27 28 35 , 6",
      showToolBar: true,
      showMenuBar: true,
      showAlgebraInput: true,
      language: "en",
      useBrowserForJS: false,
      borderColor: "#ddd",
      buttonShadows: true,
      preventFocus: true,
      showLogging: false,
      setErrorDialogsActive: false,
      appletOnLoad: this.initializeGgb,
      appName: this.props.room.tabs[0].appName || "classic"
    };

    const ggbApp = new window.GGBApplet(parameters, "6.0");
    ggbApp.inject("ggb-element");
  };

  componentWillUnmount() {
    if (this.ggbApplet && this.ggbApplet.listeners) {
      delete window.ggbApplet;
      this.ggbApplet.unregisterAddListener(this.addListener);
      this.ggbApplet.unregisterUpdateListener();
      this.ggbApplet.unregisterRemoveListener(this.eventListener);
      this.ggbApplet.unregisterClearListener(this.clearListener);
      this.ggbApplet.unregisterClientListener(this.clientListener);
      // this.ggbApplet.unregisterStoreUndoListener(this.undoListener);
    }
    // if (!this.props.tempRoom) {
    //   let canvas = document.querySelector('[aria-label="Graphics View 1"]');
    //   this.props.updateRoom(this.props.room._id, {graphImage: {imageData: canvas.toDataURL()}})
    // }
    window.removeEventListener("resize", this.updateDimensions);
  }

  initializeGgb = () => {
    this.ggbApplet = window.ggbApplet;
    this.setState({ loading: false });
    this.ggbApplet.setMode(40); // Sets the tool to zoom
    let { room, currentTab } = this.props;
    let { currentState, startingPoint, ggbFile, perspective } = room.tabs[
      currentTab
    ];
    // put the current construction on the graph, disable everything until the user takes control
    // if (perspective) this.ggbApplet.setPerspective(perspective);
    if (room.settings.participantsCanChangePerspective) {
      initPerspectiveListener(document, perspective, this.perspectiveChanged);
    }
    if (currentState) {
      this.ggbApplet.setXML(currentState);
    } else if (startingPoint) {
      this.ggbApplet.setXML(startingPoint);
    } else if (ggbFile) {
      this.ggbApplet.setBase64(ggbFile);
    }
    // attach this listeners to the ggbApplet
    this.freezeElements(true);
    this.registerListeners();
  };

  userCanEdit = () => {
    if (this.resetting) {
      return true;
    }
    if (
      (!this.props.user.connected ||
        this.props.room.controlledBy !== this.props.user._id) &&
      !this.state.recievingData
    ) {
      return false;
    } else return true;
  };
  showAlert() {
    alert(`You are not in control. Click "Take Control" before making changes`);
  }
  /**
   * @method clientListener
   * @description client listener ffires everytime anything in the geogebra construction is touched
   * @param  {Array} event - Ggb array [eventType (e.g. setMode),  ]
   */
  clientListener = event => {
    switch (event[0]) {
      case "setMode":
        // if (event[2] === "40" || this.userCanEdit()) {
        //   return;
        //   // if the user is not connected or not in control and they initisted this event (i.e. it didn't come in over the socket)
        //   // Then don't send this to the other users/=.
        // } else {
        //   this.ggbApplet.setMode(40);
        // }
        break;
      case "undo":
        if (this.resetting || this.userCanEdit()) {
          this.resetting = false;
          return;
        } else {
          this.showAlert();
          this.resetting = true;
          this.ggbApplet.redo();
        }
        break;
      case "redo":
        if (this.resetting || this.userCanEdit()) {
          this.resetting = false;
          return;
        } else {
          this.showAlert();
          this.resetting = true;
          this.ggbApplet.undo();
        }
        break;
      case "select":
        break;
      case "openMenu":
        break;
      case "perspectiveChange":
        break;
      case "movingGeos":
        this.updatingOn = false; // turn of updating so the updateListener does not send events
        break;

      case "movedGeos":
        this.updatingOn = false;

        // combine xml into one event
        let xml = "";

        for (var i = 1; i < event.length; i++) {
          xml += this.ggbApplet.getXML(event[i]);
        }

        this.sendEvent(xml, null, null, "UPDATE", "moved");
        this.updatingOn = true;
        break;

      default:
        break;
    }
  };

  addListener = label => {
    if (!this.state.receivingData) {
      let xml = this.ggbApplet.getXML(label);
      let definition = this.ggbApplet.getCommandString(label);
      this.sendEvent(xml, definition, label, "ADD", "added");
    }
    this.setState({ receivingData: false });
  };

  removeListener = label => {
    if (!this.state.receivingData) {
      this.sendEvent(null, null, label, "REMOVE", "removed");
    }
    this.setState({ receivingData: false });
  };

  updateListener = label => {
    let independent = this.ggbApplet.isIndependent(label);
    let moveable = this.ggbApplet.isMoveable(label);
    let isInControl = this.props.room.controlledBy === this.props.user._id;

    if ((!independent && !moveable) || !this.updatingOn || !isInControl) {
      return;
    } else if (!this.state.receivingData) {
      let xml = this.ggbApplet.getXML(label);
      this.sendEvent(xml, null, label, "UPDATE", "updated");
    }

    this.setState({ receivingData: false });
  };

  // Used to capture object when referencing
  clickListener = async element => {
    // console.log("CLICKED", this.ggbApplet.getXML())
    if (this.props.referencing) {
      // let xmlObj = await this.parseXML(this.ggbApplet.getXML(event));
      let elementType = this.ggbApplet.getObjectType(element);
      let position;
      if (elementType !== "point") {
        let commandString = this.ggbApplet.getCommandString(element);
        element = commandString.slice(
          commandString.indexOf("(") + 1,
          commandString.indexOf("(") + 2
        );
      }
      position = await this.getRelativeCoords(element);
      this.props.setToElAndCoords({ element, elementType: "point" }, position);
    }
  };

  registerListeners = () => {
    if (this.ggbApplet.listeners.length > 0) {
      this.ggbApplet.unregisterAddListener(this.addListener);
      this.ggbApplet.unregisterUpdateListener(this.updateListener);
      this.ggbApplet.unregisterRemoveListener(this.eventListener);
      this.ggbApplet.unregisterClearListener(this.clearListener);
      this.ggbApplet.unregisterClientListener(this.clientListener);
    }
    this.ggbApplet.registerClientListener(this.clientListener);
    this.ggbApplet.registerAddListener(this.addListener);
    this.ggbApplet.registerClickListener(this.clickListener);
    this.ggbApplet.registerUpdateListener(this.updateListener);
    this.ggbApplet.registerRemoveListener(this.removeListener);
  };
  /**
   * @method sendEvnet
   * @description emits the geogebra event over the socket. Creates a buffer for multi-part events
   * @param  {String} xml - ggb generated xml of the even
   * @param  {String} definition - ggb multipoint definition (e.g. "Polygon(D, E, F, G)")
   * @param  {String} label - ggb label. ggbApplet.evalXML(label) yields xml representation of this label
   * @param  {String} eventType - ["ADD", "REMOVE", "UPDATE", "CHANGE_PERSPECTIVE", "NEW_TAB", "BATCH"] see ./models/event
   * @param  {String} action - ggb action ["addedd", "removed", "clicked", "updated"]
   */

  sendEvent = (xml, definition, label, eventType, action) => {
    // if (
    //   !this.props.user.connected ||
    //   this.props.room.controlledBy !== this.props.user._id
    // ) {
    //   this.ggbApplet.undo();
    //   alert(
    //     "You are not in control. The update you just made will not be saved"
    //   );
    //   return;
    // }

    let newData = {
      definition,
      label,
      eventType,
      action,
      room: this.props.room._id,
      tab: this.props.room.tabs[this.props.currentTab]._id,
      event: xml,
      user: { _id: this.props.user._id, username: this.props.user.username },
      timestamp: new Date().getTime(),
      currentState: this.ggbApplet.getXML(), // @TODO could we get away with not doing this? just do it when someone leaves?
      mode: this.ggbApplet.getMode()
    };

    let updatedTabs = [...this.props.room.tabs];
    let updatedTab = { ...this.props.room.tabs[this.props.currentTab] };

    if (eventType === "CHANGE_PERSPECTIVE") {
      updatedTab.perspective = xml;
    }

    updatedTab.currentState = newData.currentState;
    updatedTabs[this.props.currentTab] = updatedTab;
    this.props.updatedRoom(this.props.room._id, { tabs: updatedTabs });

    if (this.eventQueue.length > 1) {
      newData.event = this.eventQueue;
      newData.eventType = action === "updated" ? "BATCH_UPDATE" : "BATCH_ADD";
      newData.noOfPoints = this.noOfPoints;
    }

    this.firstLabel = null;
    this.pointCounter = 1;
    this.noOfPoints = null;
    this.eventQueue = [];
    this.timer = null;

    socket.emit("SEND_EVENT", newData);
  };

  /**
   * @method freezeElements
   * @description toggle whether the construction can be manipulated.
   *
   * @todo we need to find a way to do this all at once. setFixed() is blocking and this effects the repainting of the screen when the user takes or releases control
   * @param  {Boolean} freeze - true = freeze, false = unfreeze
   */

  freezeElements = freeze => {
    // let allElements = this.ggbApplet.getAllObjectNames(); // WARNING ... THIS METHOD IS DEPRECATED
    // allElements.forEach(element => {
    //   // AS THE CONSTRUCTION GETS BIGGER THIS GETS SLOWER...SET_FIXED IS BLOCKING
    //   this.ggbApplet.setFixed(element, freeze, true); // Unfix/fix all of the elements
    // });
  };

  /**
   * @method getRelativeCoords - converts x,y coordinates of ggb point and converts them to the pizel location on the screen
   * @param  {String} element - ggb defined Label. MUST be a point
   */

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

  render() {
    return (
      <Aux>
        <Script
          url="https://cdn.geogebra.org/apps/deployggb.js"
          onLoad={this.onScriptLoad}
        />
        <div className={classes.Graph} id="ggb-element" ref={this.graph} />
        {/* <div className={classes.ReferenceLine} style={{left: this.state.referencedElementPosition.left, top: this.state.referencedElementPosition.top}}></div> */}
        {/* {this.state.showControlWarning ? <div className={classes.ControlWarning} style={{left: this.state.warningPosition.x, top: this.state.warningPosition.y}}>
          You don't have control!
        </div> : null} */}
        <Modal show={this.state.loading} message="Loading..." />
      </Aux>
    );
  }
}

export default GgbGraph;
