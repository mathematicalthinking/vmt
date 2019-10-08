import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Script from 'react-load-script';
import { parseString } from 'xml2js';
import throttle from 'lodash/throttle';
import isFinite from 'lodash/isFinite';
import mongoIdGenerator from '../../utils/createMongoId';
import classes from './graph.css';
import { blankEditorState } from './ggbUtils';
import { Aux } from '../../Components';
import ControlWarningModal from './ControlWarningModal';
import socket from '../../utils/sockets';
import ggbTools from './Tools/GgbIcons';
import API from '../../utils/apiRequests';

// const GgbEventTypes = [
//   'ADD',
//   'BATCH_ADD',
//   'UPDATE',
//   'BATCH_UPDATE',
//   'REMOVE',
//   'UPDATE_STYLE',
//   'REDO',
//   'UNDO',
// ];
class GgbGraph extends Component {
  state = {
    showControlWarning: false,
    redo: false,
  };

  graph = React.createRef();

  outgoingEventQueue = [];
  incomingEventQueue = [];
  firstLabel = null;
  resetting = false; // used to reset the construction when something is done by a user not in control.
  editorState = null; // In the algebra input window,
  receivingData = false;
  batchUpdating = false;
  movingGeos = false;
  pointSelected = null;
  currentDefinition = null; // used to prevent duplicate definitions being sent across the socket...e.g., when using the roots tools (https://help.geogebra.org/en/tool/Roots)
  // it sends the Roots(line, x, y) for each point that is created...we only want to send it once
  shapeSelected = null;
  isFileSet = false; // calling ggb.setBase64 triggers this.initializeGgb(), because we set base 64 inside initializeGgb we use this instance var to track whether we've already set the file. When the ggb tries to load the file twice it breaks everything
  isFaviconNtf = false;
  isWindowVisible = true;
  currentShape = [];
  previousEvent = null; // Prevent repeat events from firing (for example if they keep selecting the same tool)
  previousCommandString = null;
  time = null; // used to time how long an eventQueue is building up, we don't want to build it up for more than two seconds.
  /**
   * @method componentDidMount
   * @description add socket listeners, window resize listener
   */

  componentDidMount() {
    const { tab, currentTabId, addNtfToTabs } = this.props;
    // We need access to a throttled version of sendEvent because of a geogebra bug that causes clientListener to fire twice when setMode is invoked
    this.throttledSendEvent = throttle(this.sendEvent, 500, {
      leading: true,
      trailing: false,
    });
    this.throttledZoomListener = throttle(this.zoomListener, 110, {
      leading: true,
      trailing: true,
    });
    window.addEventListener('resize', this.updateDimensions);
    window.addEventListener('visibilitychange', this.visibilityChange);
    socket.on('RECEIVE_EVENT', (data) => {
      console.log('Receiving event: ', data);
      if (!this.isWindowVisible) {
        this.isFaviconNtf = true;
        this.changeFavicon('/favNtf.ico');
      }
      // If the event is for this room tab (i.e., not browser tab) but this tab is not in view,
      // add a notification to this tab
      if (currentTabId !== tab._id) {
        addNtfToTabs(tab._id);
      }
      // // If this event is for this tab add it to the log
      else if (data.tab === currentTabId) {
        //   // If we're still processing data from the last event
        //   // save this event in a queue...then when processing is done we'll pull
        //   // from this queue in clearSocketQueue()
        if (this.receivingData || this.batchUpdating) {
          this.incomingEventQueue.push(data);
          return;
        }
        this.receivingData = true;
        console.log('Constructing received event');
        this.constructEvent(data);
      }
    });

    socket.on('FORCE_SYNC', (data) => {
      this.receivingData = true;
      data.tabs.forEach((t) => {
        if (t._id === tab._id) {
          this.ggbApplet.setXML(tab.currentState);
          this.registerListeners(); // always reset listeners after calling sextXML (setXML destorys everything)
        }
      });
      this.receivingData = false;
    });
  }

  /**
   * @method componentDidUpdate
   * @description - determines what should happen when props update
   * and initializes socket event listeners
   * @param  {Object} prevProps - props before update
   */

  async componentDidUpdate(prevProps) {
    const {
      currentTab,
      tabId,
      room,
      referencing,
      inControl,
      showingReference,
      referToEl,
      clearReference,
    } = this.props;
    if (currentTab === tabId) {
      if (!this.ggbApplet) return;

      const isInControl = inControl === 'ME';

      // new evnet
      if (prevProps.room.log && prevProps.room.log.length < room.log.length) {
        this.previousEvent = room.log[room.log.length - 1];
      }

      // Creating a reference
      if (!prevProps.referencing && referencing) {
        // prompt if they want reference to automatically turn on when chat is in focus?
        this.ggbApplet.setMode(0); // Set tool to pointer so the user can select elements @question shpuld they have to be in control to reference
      } else if (prevProps.referencing && !referencing) {
        // if they are in control, can keep mode set to move tool
        if (!isInControl) {
          // force resync in case they moved anything while referencing
          this.resyncGgbState();
          this.ggbApplet.setMode(40);
        }
      }
      // Control
      const wasInControl = prevProps.inControl === 'ME';
      if (!wasInControl && isInControl) {
        if (prevProps.referencing) {
          // force resync in case they moved anything while referencing
          this.resyncGgbState();
        }
        if (this.intendedMode) {
          // if they tried to click on a tool while not
          // in control, set mode to that tool
          this.ggbApplet.setMode(this.intendedMode);
          this.intendedMode = null;
        } else {
          this.ggbApplet.setMode(0);
        }
        // when control is taken, the workspace container is setting referencing to false
        // so we should leave the arrow on the graph

        clearReference();
      } else if (wasInControl && !isInControl) {
        // this.updateConstructionState();

        if (referencing) {
          const currentMode = this.ggbApplet.getMode();
          if (currentMode !== 0) {
            this.ggbApplet.setMode(0);
          }
        } else {
          this.ggbApplet.setMode(40);
        }
      }

      // Displaying Reference
      if (
        !prevProps.showingReference &&
        showingReference &&
        referToEl.elementType !== 'chat_message'
      ) {
        // find the coordinates of the point we're referencing

        await this.updateReferToEl(referToEl);
      } else if (
        showingReference &&
        prevProps.referToEl !== referToEl &&
        referToEl.elementType !== 'chat_message'
      ) {
        await this.updateReferToEl(referToEl);
      }

      // switching tab
      if (prevProps.currentTab !== currentTab) {
        this.updateDimensions();
      }

      // releasing control
      if (prevProps.inControl !== inControl && inControl === 'NONE') {
        // this.updateConstructionState();
      }
    }
  }

  componentWillUnmount() {
    // this.updateConstructionState();
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.loadingTimer) {
      clearInterval(this.loadingTimer);
    }
    if (this.ggbApplet) {
      // delete window.ggbApplet;
      this.ggbApplet.unregisterAddListener(this.addListener);
      this.ggbApplet.unregisterUpdateListener(this.updateListener);
      this.ggbApplet.unregisterRemoveListener(this.removeListener);
      this.ggbApplet.unregisterClearListener(this.clearListener);
      this.ggbApplet.unregisterClientListener(this.clientListener);
      this.ggbApplet.unregisterRenameListener(this.renameListener);
      // this.ggbApplet.unregisterStoreUndoListener(this.undoListener);
      this.ggbApplet.unregisterObjectUpdateListener(this.cornerLabel);
      this.ggbApplet.deleteObject(this.cornerLabel);
    }

    if (this.updatingTab) {
      clearTimeout(this.updatingTab);
    }
    window.removeEventListener('visibilitychange', this.visibilityChange);
    socket.removeAllListeners('RECEIVE_EVENT');
    socket.removeAllListeners('FORCE_SYNC');
    window.removeEventListener('resize', this.updateDimensions);
  }

  visibilityChange = () => {
    this.isWindowVisible = !this.isWindowVisible;
    if (this.isWindowVisible && this.isFaviconNtf) {
      this.isFaviconNtf = false;
      this.changeFavicon('/favicon.ico');
    }
  };

  changeFavicon = (href) => {
    const link =
      document.querySelector("link[rel*='icon']") ||
      document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = href;
    document.getElementsByTagName('head')[0].appendChild(link);
  };

  writeToGraph = (event) => {
    if (
      event.commandString &&
      event.objType !== 'point' &&
      event.eventType !== 'DRAG'
    ) {
      this.ggbApplet.evalCommand(event.commandString);
      // if (event.valueString) {
      //   this.ggbApplet.evalCommand(event.valueString);
      // }
    } else if (event.xml) {
      this.ggbApplet.evalXML(event.xml);
    } else if (event.eventType === 'REMOVE') {
      this.ggbApplet.deleteObject(event.label);
    } else if (event.eventType === 'RENAME') {
      this.ggbApplet.evalCommand(event.commandString);
    }
    this.ggbApplet.evalCommand('UpdateConstruction()');
  };

  readFromGraph = (label, eventType) => {
    const objType = this.ggbApplet.getObjectType(label);
    const xml = this.ggbApplet.getXML(label);
    const commandString = this.ggbApplet.getCommandString(label);
    const valueString = this.ggbApplet.getValueString(label);
    const editorState = this.ggbApplet.getEditorState(label);
    let x;
    let y;
    const algXML = this.ggbApplet.getAlgorithmXML(label);
    if (objType === 'point') {
      x = this.ggbApplet.getXcoord(label);
      y = this.ggbApplet.getYcoord(label);
    }
    const event = {
      commandString: commandString === '' ? null : commandString,
      valueString,
      editorState: editorState === blankEditorState ? null : editorState,
      coords: { x, y },
      xml: algXML || xml,
      label,
      objType,
      eventType,
    };

    return event;
  };

  constructEvent = (eventObj) => {
    const { addToLog } = this.props;
    addToLog(eventObj);
    const { ggbEvent, eventArray } = eventObj;
    let readyToClearSocketQueue = true;
    if (eventArray) {
      readyToClearSocketQueue = false;
      this.batchUpdating = true;
      this.recursiveUpdate(eventArray);
    } else if (ggbEvent) {
      this.writeToGraph(ggbEvent);
    }
    if (readyToClearSocketQueue) {
      this.clearSocketQueue();
    }
  };
  // @todo socketQueue should be renamed incomingEventQueue and eventQeue should be renamed outgoingEventQueue
  clearSocketQueue = () => {
    if (this.incomingEventQueue.length > 0) {
      const nextEvent = this.incomingEventQueue.shift();
      this.constructEvent(nextEvent);
    } else {
      this.updatingOn = false;
      this.batchUpdating = false;
      this.receivingData = false;
    }
  };

  /**
   * @method recursiveUpdate
   * @description takes an array of events and updates the construction in batches
   * used to make drag updates and multipoint shape creation more efficient. See ./docs/Geogebra
   * Note that this is copy-pasted in GgbReplayer for now, consider abstracting.
   * When we've reached the bottom of the recursive chain we check if any events came in while
   * making these changes. (See the socket listener if(receviingData))
   * @param  {Array || Object} events - array of ggb xml events
   * @param  { String } updateType - 'ADDING if we want to invoke evalCommand else null to invoke evalXML'
   */
  // eslint-disable-next-line consistent-return
  recursiveUpdate = (events) => {
    let readyToClearSocketQueue = true;
    if (events && events.length > 0 && Array.isArray(events)) {
      const event = events.shift();
      this.writeToGraph(event);
      if (events.length > 0) {
        readyToClearSocketQueue = false;
        // By wrapping calls to recursiveUpdate in a setTimeout we end up with behavior that is closer
        // to a natural dragging motion. If we write events one after the other w/o a timeout
        // the point moves too quickly and looks like its jumping to the final position
        setTimeout(() => this.recursiveUpdate(events), 0);
      }
    }
    if (readyToClearSocketQueue) {
      this.clearSocketQueue();
    }
  };

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

  /**
   * @method onScriptLoad
   * @description defines parameters for the Ggb app.
   * complete list here: https://wiki.geogebra.org/en/Reference:GeoGebra_App_Parameters
   */

  onScriptLoad = () => {
    const { tab, currentTabId } = this.props;
    const parameters = {
      id: `ggbApplet${tab._id}A`,
      // scaleContainerClass: "graph",
      showToolBar: true,
      showMenuBar: true,
      showAlgebraInput: true,
      language: 'en',
      useBrowserForJS: false,
      borderColor: '#ddd',
      buttonShadows: true,
      preventFocus: true,
      showLogging: false,
      errorDialogsActive: false,
      appletOnLoad: this.initializeGgb,
      appName: tab.appName || 'classic',
      enableUndoRedo: false, // undo/redo is problematic; disable for now
    };
    const ggbApp = new window.GGBApplet(parameters, '6.0');
    if (currentTabId === tab._id) {
      ggbApp.inject(`ggb-element${tab._id}A`);
    } else {
      // wait to inject other tabs if they're not in focus
      // i.e. prioritze loading of the current tab
      this.loadingTimer = setInterval(() => {
        // accessing props here instead of top of function so that
        // this value is current on each interval
        const { isFirstTabLoaded } = this.props;
        if (isFirstTabLoaded) {
          ggbApp.inject(`ggb-element${tab._id}A`);
          clearInterval(this.loadingTimer);
        }
      }, 500);
    }
  };

  resyncGgbState = () => {
    const { tab } = this.props;
    return API.getById('tabs', tab._id)
      .then((res) => {
        const { currentState, ggbFile, startingPoint } = res.data.result;

        if (currentState) {
          this.ggbApplet.setXML(currentState);
        } else if (startingPoint) {
          this.ggbApplet.setXML(startingPoint);
        } else if (ggbFile && !this.isFileSet) {
          this.isFileSet = true;
          this.ggbApplet.setBase64(ggbFile);
        }
        this.registerListeners();
      })
      .catch((err) => {
        console.log('ERROR resyncing: ', 'failed to updated', err);
      });
  };

  /**
   * @method initializeGgb
   * @description
   */

  initializeGgb = async () => {
    // Save the coords of the graph element so we know how to restrict reference lines (i.e. prevent from overflowing graph)

    const { tab, setFirstTabLoaded, currentTabId } = this.props;
    this.getInnerGraphCoords();
    this.ggbApplet = window[`ggbApplet${tab._id}A`];
    this.ggbApplet.setMode(40); // Sets the tool to zoom
    // put the current construction on the graph, disable everything until the user takes control
    // if (perspective) this.ggbApplet.setPerspective(perspective);
    try {
      await this.resyncGgbState();
      if (tab._id === currentTabId) {
        setFirstTabLoaded();
      }
    } catch (err) {
      console.log(`Error initializingGgb: `, err);
    }
  };

  /**
   * @method userCanEdit
   * @description - checks if the user is in control and connected to the socket
   *  if they are in control and connected then they can edit
   * @return {Boolean} - can the user edit?
   */

  userCanEdit = () => {
    const { inControl } = this.props;
    if (this.resetting || this.updatingOn) {
      return false;
    }
    if (inControl === 'ME' && !this.receivingData) {
      return true;
    }
    return false;
  };

  showAlert = () => {
    // eslint-disable-next-line no-alert
    window.alert(
      `You are not in control. Click "Take Control" before making changes`
    );
  };

  /**
   * @method clientListener
   * @description client listener fires everytime anything in the geogebra construction is touched
   * we use it to listen for user interaction, and either allow that action and send it over the socket
   * if they're in control, or prevent/undo it if they're not.
   * @param  {Array} event - Ggb array [eventType (e.g. setMode),  String, String]
   */

  clientListener = (event) => {
    console.log('event in clientListener: ', event);
    if (!event) {
      // seems to happen if you click a bunch of points really quickly
      return;
    }

    // modes (https://wiki.geogebra.org/en/Reference:Toolbar)
    // 40 = TRANSLATEVIEW
    // 0 = MOVE

    const { referencing } = this.props;
    if (this.receivingData) {
      return;
    }

    switch (event[0]) {
      case 'setMode':
        // eslint-disable-next-line prefer-destructuring
        // console.log({ referencing });
        if (
          event[2] === '40' ||
          (referencing && event[2] === '0') ||
          (this.previousEvent &&
            this.previousEvent.eventType === 'mode' &&
            this.previousEvent.label === event[2])
        ) {
          return;
        }
        if (this.userCanEdit()) {
          // throttled because of a bug in Geogebra that causes this to fire twice
          this.throttledSendEvent({ eventType: 'MODE', label: event[2] });
          return;
          // if the user is not connected or not in control and they initisted this event (i.e. it didn't come in over the socket)
          // Then don't send this to the other users/=.
        }
        if (event[2] !== '40') {
          // eslint-disable-next-line prefer-destructuring
          this.intendedMode = event[2];
          this.setState({ showControlWarning: true });
        }
        this.receivingData = false;
        break;

      case 'undo':
        // disable for now

        // if (this.resetting) {
        //   this.resetting = false;
        // }
        // if (this.userCanEdit()) {
        //   this.sendEvent({ eventType: 'UNDO' });
        // } else {
        //   this.setState({ showControlWarning: true, redo: true });
        // }
        break;
      case 'redo':
        // disable for now

        // if (this.resetting) {
        //   this.resetting = false;
        //   return;
        // }
        // if (this.userCanEdit()) {
        //   // this.showAlert();
        //   // this.resetting = true;
        //   // this.ggbApplet.undo();
        // } else {
        //   this.setState({ showControlWarning: true });
        // }
        break;
      case 'select':
        if (referencing) {
          return;
        }
        if (this.ggbApplet.getMode() === 0) {
          const selection = this.ggbApplet.getObjectType(event[1]);
          if (selection === 'point') {
            // eslint-disable-next-line prefer-destructuring
            [, this.pointSelected] = event;

            this.shapeSelected = null;
            this.pointSelectedValueString = this.ggbApplet.getValueString(
              event[1]
            );
            this.shapeSelectedType = null;
          } else {
            // eslint-disable-next-line prefer-destructuring
            this.shapeSelected = event[1];
            this.shapeSelectedType = this.ggbApplet.getObjectType(event[1]);
            this.pointSelected = null;
            this.pointSelectedValueString = null;
          }
          if (this.outgoingEventQueue.length > 0) {
            this.sendEventBuffer({
              xml: null,
              objType: selection,
              label: event[1],
              eventType: 'SELECT',
            });

            // ggbObj ???
          } else {
            this.sendEvent({
              xml: null,
              objType: selection,
              label: event[1],
              eventType: 'SELECT',
            });
            // 'ggbObj' ???
          }
        }
        break;
      case 'openMenu':
        if (!this.userCanEdit()) {
          this.setState({ showControlWarning: true });
        }
        break;
      case 'perspectiveChange':
        break;
      case 'updateStyle': {
        if (this.userCanEdit()) {
          const label = event[1];
          const xml = this.ggbApplet.getXML(label);
          const objType = this.ggbApplet.getObjectType(label);
          console.log(`Updating style for ${objType} ${label}`);

          this.sendEventBuffer({
            xml,
            label,
            objType,
            eventType: 'UPDATE_STYLE',
          });
        }
        break;
      }
      case 'renameComplete': {
        console.log('rename details in rc: ', this.renamedDetails);

        if (this.renamedDetails) {
          const [oldLabel, newLabel] = this.renamedDetails;

          if (oldLabel === this.cornerLabel) {
            // update the new name of the cornerZoomAnchor point
            // but do not emit renaming event
            // if user for some reason renamed
            // one of their points cornerZoomAnchor
            this.cornerLabel = newLabel;
            this.renamedDetails = null;
            console.log('new anchor: ', newLabel);
            return;
          }

          if (this.isAutoRenamingCornerLabel) {
            // triggered by registerListeners
            this.isAutoRenamingCornerLabel = false;
            this.renamedDetails = null;
            return;
          }
          const objType = this.ggbApplet.getObjectType(newLabel);
          const commandString = `Rename(${oldLabel},"${newLabel}")`;

          if (this.outgoingEventQueue.length > 0) {
            this.sendEventBuffer({
              label: newLabel,
              objType,
              eventType: 'RENAME',
              oldLabel,
              commandString,
            });
          } else {
            this.sendEvent({
              label: newLabel,
              objType,
              eventType: 'RENAME',
              oldLabel,
              commandString,
            });
          }
        }

        break;
      }
      case 'editorStart':
        // this.ggbApplet.evalCommand("editorStop()");
        // save the state of what's being edited BEFORE they edit it. This way,
        // if they're not in control and cannot edit, we can reset to this state
        this.editorState = this.ggbApplet.getEditorState();
        break;
      case 'editorKeyTyped':
        if (this.userCanEdit()) {
          return;
        }
        // If they weren't allowed to type here undo to the previous state
        this.ggbApplet.setEditorState(this.editorState);
        this.setState({ showControlWarning: true });
        break;
      case 'movingGeos':
        this.movingGeos = true; // turn off updating so the updateListener does not send events
        break;
      case 'movedGeos': {
        this.movingGeos = true;
        // combine xml into one event
        let xml = '';
        for (let i = 1; i < event.length; i++) {
          xml += this.ggbApplet.getXML(event[i]);
        }
        console.log('shape selected movedGeos: ', this.shapeSelected);
        this.sendEventBuffer({
          xml,
          label: this.shapeSelected,
          eventType: 'DRAG',
          objType: this.ggbApplet.getObjectType(this.shapeSelected),
        });
        break;
      }

      case 'dragEnd': {
        if (this.isDraggingPoint) {
          this.isDraggingPoint = false;
        }
        break;
      }
      // case 'deselect': {
      //   this.lastPointSelected = this.pointSelected;

      //   if (this.pointSelected) {
      //     this.lastPointSelected = this.pointSelected;
      //     this.lastPointSelectedValueStr = this.ggbApplet.getValueString(
      //       this.lastPointSelected
      //     );

      //     this.pointSelected = null;
      //   }

      //   if (this.lastShapeSelected) {
      //     this.lastShapeSelected = this.shapeSelected;
      //     this.lastShapeSelectedValueStr = this.ggbApplet.getValueString(
      //       this.lastShapeSelected
      //     );

      //     this.shapeSelected = null;
      //   }

      //   break;
      // }
      case 'mouseDown': {
        let hits = '';
        for (let i = 0; i < event.hits.length; i++) {
          hits += event.hits[i];
          hits += ' ';
        }
        if (!hits) {
          hits = '(none)';
        }
        console.log(
          `${event[0]} in view ${event.viewNo} at (${event.x}, ${
            event.y
          }) hitting objects: ${hits}`
        );
        this.mouseDownCoords = [event.x, event.y];
        break;
      }
      case 'viewChanged2D': {
        const props = JSON.parse(this.ggbApplet.getViewProperties());
        const { xMin, yMin, width, height, invXscale, invYscale } = props;
        const xMax = xMin + width * invXscale;
        const yMax = yMin + height * invYscale;
        console.log(xMin, yMin, xMax, yMax);
        break;
      }

      default:
        break;
    }
  };

  /**
   * @method addListener
   * @description listener for add events. First checks if this event was initiated
   * by the current user or by a socket event. If Initiated by a socket event we let the update happen,
   * If this was a user initiated event we first check if the user is able to make
   * this addition (i.e. are they in control?) and calls sendEvent() if they can. Else it undoes their change.
   * @param  {String} label - label of the point, segment, shape etc added
   */

  addListener = (label) => {
    if (
      this.batchUpdating ||
      this.receivingData ||
      this.ggbApplet.getMode() === 40
    ) {
      return;
    }
    if (this.resetting) {
      this.resetting = false;
      return;
    }
    if (!this.userCanEdit()) {
      this.setState({ showControlWarning: true });
      return;
    }
    if (!this.receivingData) {
      const event = this.readFromGraph(label, 'ADD');
      if (event.commandString) {
        if (event.commandString === this.previousCommandString) {
          return;
        }
        this.previousCommandString = event.commandString;
      }
      if (event.objType === 'point') {
        console.log('sending point add listener', event);
        this.sendEvent(event);
      } else {
        this.sendEventBuffer(event);
      }
    }
  };

  /**
   * @method removeListener
   * @description See add (but for removing)
   */

  removeListener = (label) => {
    console.log({ removeListener: label });
    if (this.receivingData && !this.updatingOn) {
      console.log(
        `receivingData & !updatingOn in removeListener for label: ${label}. NOT removing`
      );
      return;
    }
    if (this.resetting) {
      this.resetting = false;
      console.log(
        `resetting in removeListener for label: ${label}. NOT removing`
      );

      return;
    }

    if (label === this.cornerLabel && this.isAutoRemovingCornerAnchor) {
      console.log('auto removing corner anchor');
      this.isAutoRemovingCornerAnchor = false;
      return;
    }
    if (!this.userCanEdit()) {
      this.setState({ showControlWarning: true });
      return;
    }
    if (!this.receivingData) {
      this.previousCommandString = null;
      console.log(`sending REMOVE eventBuffer for label: ${label}.`);

      const data = { label, eventType: 'REMOVE' };

      if (this.pointSelected === label) {
        data.objType = 'point';
      } else if (this.shapeSelected === label) {
        data.objType = this.shapeSelectedType;
      }

      this.sendEventBuffer(data);
    }
  };

  /**
   * @method removeListener
   * @description See add (but for updating), we don't check if the user can edit
   * because they would have first had to change their tool (or mode) which we only
   * allow if they're already in control
   */

  updateListener = (label) => {
    if (this.batchUpdating || this.movingGeos || this.renamedDetails) {
      return;
    }
    if (this.receivingData && !this.updatingOn) {
      console.log(
        `was receiving data or updatingOn in update listener for ${label}; returning`
      );

      return;
    }

    if (!this.userCanEdit()) {
      return;
    }
    const isUpdateForSelectedPoint = label === this.pointSelected;
    console.log({ isUpdateForSelectedPoint });

    if (isUpdateForSelectedPoint) {
      // check if is drag event
      let doSendDragEvent = false;
      if (this.isDraggingPoint) {
        doSendDragEvent = true;
      } else {
        const valueString = this.ggbApplet.getValueString(label);

        if (valueString !== this.pointSelectedValueString) {
          doSendDragEvent = true;
          this.isDraggingPoint = true;
        }
      }
      // if (this.isDraggingPoint) {
      //   // in the middle of a drag
      //   // once dragEnds, this.isDraggingPoint will be set to false
      //   // from the clientListener (dragEnd event)
      //   doSendDragEvent = true;
      // } else {
      //   // check if this is the beginning of a dragEvent
      //   // i.e. the coords of the selectedPoint are not the same as when they
      //   // were selected

      //   let y;

      //   if (x !== originalCoords[0]) {
      //     doSendDragEvent = true;
      //     this.isDraggingPoint = true;
      //     console.log('starting to drag point: ', label);
      //   } else {
      //     y = this.ggbApplet.getYcoord(label);
      //     if (y !== originalCoords[1]) {
      //       doSendDragEvent = true;
      //       this.isDraggingPoint = true;
      //       console.log('starting to drag point: ', label);
      //     }
      //   }
      // }

      // coords are different
      // update
      if (doSendDragEvent) {
        const xml = this.ggbApplet.getXML(label);
        console.log(`Sending DRAG eventBuffer for label :${label}`);
        this.sendEventBuffer({
          // coords: { x, y },
          xml,
          label,
          objType: 'point',
          eventType: 'DRAG',
        });
      }
    }

    // else if (
    //   label === this.lastPointSelected ||
    //   label === this.lastShapeSelected
    // ) {
    //   // object was updated and it is the current selected point
    //   // was not renamed and not being dragged
    //   // could have been redefined
    //   // are there other possibilities?
    //   // check if coordinates changed
    //   console.log('object possibly redefined', label);

    //   const objType = this.ggbApplet.getObjectType(label);

    //   const valueString = this.ggbApplet.getValueString(label);

    //   console.log({ valueString });
    //   if (objType === 'point') {
    //     // if coords changed, must be redefinition?
    //     const didChange = valueString !== this.lastPointSelectedValueStr;

    //     if (didChange) {
    //       const xml = this.ggbApplet.getXML(label);
    //       this.lastPointSelectedValueStr = valueString;
    //       console.log(`Sending redefine event for point: ${label}`);

    //       this.sendEvent({
    //         eventType: 'REDEFINE',
    //         objType: 'point',
    //         label,
    //         valueString,
    //         xml,
    //       });
    //     }
    //   }
    // }
  };

  /**
   * @param  {String} element - ggb label for what has been clicked
   * @description used to get reference positions
   */

  clickListener = async (element) => {
    const { referencing, setToElAndCoords } = this.props;
    if (referencing) {
      const elementType = this.ggbApplet.getObjectType(element);

      const { renamedElementType, position } = await this.getReferenceCoords(
        element,
        elementType,
        this.mouseDownCoords
      );

      setToElAndCoords(
        {
          element,
          elementType: renamedElementType,
          mouseDownCoords: this.mouseDownCoords,
        },
        position
      );
    }
  };

  clearListener = (element) => {
    console.log({ clearListener: element });
  };

  zoomListener = async () => {
    const { referencing, showingReference, referToEl } = this.props;
    if ((referencing && referToEl) || showingReference) {
      this.getInnerGraphCoords();
      this.updateReferToEl(referToEl);
    }
  };

  renameListener = (oldLabel, newLabel) => {
    if (this.isAutoRenamingCornerLabel) {
      this.isAutoRenamingCornerLabel = false;
      return;
    }

    this.renamedDetails = [oldLabel, newLabel];
    console.log(
      `renameListener: Element ${oldLabel} was renamed to ${newLabel}`
    );
  };

  /**
   * @method registerListens
   *  rs - register the even listeners with geogebra
   */

  registerListeners = () => {
    this.ggbApplet.unregisterClientListener(this.clientListener);
    this.ggbApplet.unregisterAddListener(this.addListener);
    this.ggbApplet.unregisterUpdateListener(this.updateListener);
    this.ggbApplet.unregisterRemoveListener(this.RemoveListener);
    this.ggbApplet.unregisterClearListener(this.clearListener);
    this.ggbApplet.unregisterRenameListener(this.renameListener);

    // Set corner object to listen for zooming/moving of graph

    const cornerLabel = 'cornerZoomAnchor';
    this.cornerLabel = cornerLabel;

    const hasAnchor = this.ggbApplet.exists(cornerLabel);
    if (hasAnchor) {
      this.isAutoRemovingCornerAnchor = true;
      this.ggbApplet.deleteObject(cornerLabel);
    }

    this.zoomObj = this.ggbApplet.evalCommandGetLabels('Corner(1)');
    this.ggbApplet.setAuxiliary(this.zoomObj, true);
    this.ggbApplet.registerObjectUpdateListener(
      this.zoomObj,
      this.throttledZoomListener
    );

    this.isAutoRenamingCornerLabel = true;

    this.ggbApplet.renameObject(this.zoomObj, cornerLabel);

    this.ggbApplet.registerClientListener(this.clientListener);
    this.ggbApplet.registerAddListener(this.addListener);
    this.ggbApplet.registerClickListener(this.clickListener);
    this.ggbApplet.registerUpdateListener(this.updateListener);
    this.ggbApplet.registerRemoveListener(this.removeListener);
    this.ggbApplet.registerClearListener(this.clearListener);
    this.ggbApplet.registerRenameListener(this.renameListener);
  };

  /**
   * @method sendEventBuffer
   * @description --- creates a buffer for sending events across the websocket.
   *  Because dragging a shape or point causes the update handler to fire every 10 to 20 ms, the
   *  constant sending of events across the network starts to slow things down. Instead of sending each
   *  event as it comes in, we concatanate them into one event and then send them all roughly once every 1500 ms.
   * @param {Object} event
   * @param  {String} event.xml - ggb generated xml of the even
   * @param  {String} event.definition - ggb multipoint definition (e.g. "Polygon(D, E, F, G)")
   * @param  {String} event.label - ggb label. ggbApplet.evalXML(label) yields xml representation of this label
   * @param  {String} event.eventType - ["ADD", "REMOVE", "UPDATE", "CHANGE_PERSPECTIVE", "NEW_TAB", "BATCH", etc.] see ./models/event
   * @param  {String} event.action - ggb action ["addedd", "removed", "clicked", "updated"]
   * @param {Object} event.coords
   * @param {Number} event.coords.x
   * @param {Number} event.coords.y
   */

  sendEventBuffer = (event) => {
    const { referencing, showingReference, clearReference } = this.props;
    let sendEventFromTimer = true;

    // this is redundant...but maybe good.
    if (!this.userCanEdit()) {
      // this.setState({ showControlWarning: true });
      return;
    }
    if (referencing || showingReference) {
      clearReference();
    }
    this.outgoingEventQueue.push(event);
    if (this.timer) {
      // cancel the last sendEvent function
      clearTimeout(this.timer);
      this.timer = null;
      // Don't build up the queue for more than 1.5 seconds. If A user starts dragging,
      // we'll combine all of those events into one and then send them after 1.5 seconds,
      // if the user is still dragging we build up a new queue. This way, if they drag for several seconds,
      // there is not a several second delay before the other users in the room see the event
      if (this.time && Date.now() - this.time > 1500) {
        this.sendEvent([...this.outgoingEventQueue], { isMultiPart: true }); // copy the event queue because we're going to clear it right now
        sendEventFromTimer = false;
        this.outgoingEventQueue = [];
        this.time = null;
        this.timer = null;
      }
    } else {
      this.time = Date.now();
    }

    if (sendEventFromTimer) {
      this.timer = setTimeout(() => {
        this.sendEvent([...this.outgoingEventQueue]);
        this.outgoingEventQueue = [];
        this.time = null;
        this.timer = null;
      }, 210);
    }
  };

  /**
   * @method sendEvent
   * @description emits the geogebra event over the socket and updates the room in the redux store.
   * @param {Object} ggbEvent
   * @param {}
   * */
  sendEvent = (event, options) => {
    if (
      !this.userCanEdit() ||
      !event ||
      (Array.isArray(event) && event.length === 0)
    ) {
      return;
    }
    console.log('send event', { event, options });
    const {
      room,
      tab,
      user,
      myColor,
      addToLog,
      resetControlTimer,
    } = this.props;
    // console.log({ coords });
    const eventData = {
      _id: mongoIdGenerator(),
      room: room._id,
      tab: tab._id,
      color: myColor,
      user: { _id: user._id, username: user.username },
      timestamp: new Date().getTime(),
      // currentState: this.ggbApplet.getXML(), // @TODO could we get away with not doing this? just do it when someone leaves?
      // mode: this.ggbApplet.getMode() // all ggbApplet get methods are too slow for dragging...right?
    };
    if (options) {
      Object.keys(options).forEach((key) => {
        eventData[key] = options[key];
      });
    }
    if (Array.isArray(event)) {
      eventData.eventArray = event;
    } else {
      eventData.ggbEvent = event;
    }

    eventData.description = this.buildDescription(event);
    addToLog(eventData);

    if (this.updatingTab) {
      clearTimeout(this.updatingTab);
      this.updatingTab = null;
    }
    socket.emit('SEND_EVENT', eventData);

    this.updatingTab = setTimeout(this.updateConstructionState, 3000);
    this.timer = null;
    this.movingGeos = false;
    resetControlTimer();
  };
  /**
   * @method buildDescription - takes information passed to send event and builds
   *  a description of the event that occured
   * @param  {Object} ggbEvent
   * */
  buildDescription = (event) => {
    if (Array.isArray(event)) {
      if (event.length === 0) {
        return '';
      }
      // eventTypes should always all be the same
      const { eventType } = event[0];

      if (eventType === 'ADD') {
        [event] = event;
      } else {
        event = event[event.length - 1];
      }
    }

    console.log('event build desc', event);
    const { user } = this.props;
    const { label, eventType, objType = 'object', oldLabel } = event;
    let description = `${user.username} `;

    if (eventType === 'UPDATE_STYLE') {
      description += `updated the style of ${objType} ${label}`;
    } else if (eventType === 'DRAG') {
      description += `dragged ${objType} ${label}`;
    } else if (eventType === 'ADD') {
      description += `added ${objType} ${label}`;
    } else if (eventType === 'MODE') {
      description += `selected the ${ggbTools[label].name.toLowerCase()} tool`;
    } else if (eventType === 'SELECT') {
      description += `selected ${objType} ${label}`;
    } else if (eventType === 'REMOVE') {
      description += `removed ${objType} ${label}`;
    } else if (eventType === 'RENAME') {
      description += `renamed ${objType} ${oldLabel} to ${label}`;
      delete event.oldLabel;
      this.renamedDetails = null;
    } else if (eventType === 'REDEFINE') {
      description += `redefined ${objType} ${label}`;
    }
    console.log(`Description for event ${event}: ${description}`);
    return description;
  };

  updateConstructionState = () => {
    if (!this.userCanEdit()) {
      return;
    }
    const { tab } = this.props;
    if (this.ggbApplet) {
      const currentState = this.ggbApplet.getXML();
      const { _id } = tab;
      API.put('tabs', _id, { currentState })
        .then(() => {})
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
        });
    }
  };

  getReferenceCoords = async (element, elementType, mouseDownCoords) => {
    let position;

    if (Array.isArray(mouseDownCoords)) {
      position = await this.getRelativeCoords(null, mouseDownCoords);
      return {
        renamedElementType: elementType,
        position,
      };
    }
    let renamedElementType = elementType;
    // find center point of circle
    if (elementType === 'circle') {
      const commandString = this.ggbApplet.getCommandString(element);
      const point = commandString.slice(
        commandString.indexOf('(') + 1,
        commandString.indexOf(',')
      );
      try {
        position = await this.getRelativeCoords(point);
        return { renamedElementType, position };
      } catch (err) {
        return null;
      }
    }
    if (elementType !== 'point') {
      // Find centroid of polygon
      renamedElementType = elementType === 'segment' ? 'segment' : 'poly';
      const commandString = this.ggbApplet.getCommandString(element);
      const pointsOfShape = commandString
        .slice(commandString.indexOf('(') + 1, commandString.indexOf(')'))
        .split(',')
        .map((point) => point.trim())
        // filter out any non-points (e.g. regular polygons are defined like (A,B,4) for a square)
        .filter((str) => str.match(/[a-z]/i));
      if (elementType === 'segment') {
        // only take the first two points if its a segment
        // selecting segment of a poly will mess this up because the poly is the 3rd argument and passing that getRelativeCoords will fail because its not a point
        pointsOfShape.splice(2, pointsOfShape.length - 2);
      }
      try {
        const coordsArr = await Promise.all(
          pointsOfShape.map((point) => this.getRelativeCoords(point))
        );
        let leftTotal = 0;
        let topTotal = 0;
        coordsArr.forEach((coords) => {
          leftTotal += coords.left;
          topTotal += coords.top;
        });
        const leftAvg = leftTotal / coordsArr.length;
        const topAvg = topTotal / coordsArr.length;
        position = { left: leftAvg, top: topAvg };
        return { renamedElementType, position };
      } catch (err) {
        return null;
      }
    }
    // regular point
    try {
      position = await this.getRelativeCoords(element);
      return { renamedElementType, position };
    } catch (err) {
      return null;
    }
  };

  /**
   * @method getRelativeCoords - converts x,y coordinates of ggb point and converts them to the pizel location on the screen
   * @param  {String} element - ggb defined Label. MUST be a point
   * @param {Array} coords - [x,y]
   * @return {Promise Object} - because parseXML is async
   */
  getRelativeCoords = (element, coords) => {
    return new Promise(async (resolve, reject) => {
      let elX;
      let elY;

      if (Array.isArray(coords)) {
        [elX, elY] = coords;
      } else {
        try {
          elX = this.ggbApplet.getXcoord(element);
          elY = this.ggbApplet.getYcoord(element);
        } catch (err) {
          // this will happen if we pass something other than a point
          reject(err);
        }
      }
      // Get the element's location relative to the client Window
      // Check if the Algebra input window is positioned left or bottom
      const vertical = document.getElementsByClassName(
        'gwt-SplitLayoutPanel-VDragger'
      );
      let bottomMenuHeight;
      if (vertical.length > 0) {
        bottomMenuHeight = document
          .getElementsByClassName('ggbdockpanelhack')[1]
          .getBoundingClientRect().height;
      }
      const ggbCoords = this.graph.current.getBoundingClientRect();
      const construction = await this.parseXML(this.ggbApplet.getXML()); // IS THERE ANY WAY TO DO THIS WITHOUT HAVING TO ASYNC PARSE THE XML...
      try {
        const euclidianView = construction.geogebra.euclidianView[0];
        const { xZero, yZero, scale } = euclidianView.coordSystem[0].$;
        let { yScale } = euclidianView.coordSystem[0].$;
        if (!yScale) yScale = scale;
        const { width, height } = euclidianView.size[0].$;
        const xOffset =
          ggbCoords.width - width + parseInt(xZero, 10) + elX * scale;
        let yOffset =
          ggbCoords.height - height + parseInt(yZero, 10) - elY * yScale;
        if (bottomMenuHeight) {
          yOffset -= bottomMenuHeight;
        }
        resolve({ left: xOffset, top: yOffset });
      } catch (err) {
        // an error will occur if the euclidianView doesn't exists...probably because its hidden behind the algebra window
        reject(err);
      }
    });
  };

  getInnerGraphCoords = () => {
    const { setGraphCoords } = this.props;
    const graphEl = document.querySelector('[aria-label="Graphics View 1"]');
    const topBarHeight = document
      .getElementsByClassName('ggbtoolbarpanel')[0]
      .getBoundingClientRect().height;
    const innerGraphCoords = graphEl.getBoundingClientRect();
    setGraphCoords({
      left: innerGraphCoords.left - 17,
      right: innerGraphCoords.right - 17,
      height: innerGraphCoords.height + topBarHeight,
      top: topBarHeight,
    });
  };

  parseXML = (xml) => {
    return new Promise((resolve, reject) => {
      parseString(xml, (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      });
    });
  };

  updateReferToEl = async (referToElDetails) => {
    const { setToElAndCoords } = this.props;

    const { element, elementType, x, y } = referToElDetails;
    const mouseDownCoords = isFinite(x) && isFinite(y) ? [x, y] : null;

    const { position } = await this.getReferenceCoords(
      element,
      elementType,
      mouseDownCoords
    );
    setToElAndCoords(referToElDetails, position);
  };

  render() {
    const { tab, toggleControl, inControl } = this.props;
    const { showControlWarning, redo } = this.state;
    return (
      <Aux>
        <Script
          url="https://cdn.geogebra.org/apps/deployggb.js"
          onLoad={this.onScriptLoad}
        />
        <div
          className={classes.Graph}
          id={`ggb-element${tab._id}A`}
          ref={this.graph}
        />
        <ControlWarningModal
          showControlWarning={showControlWarning}
          toggleControlWarning={() => {
            if (redo) {
              this.ggbApplet.redo();
            } else {
              this.ggbApplet.undo();
            }
            this.ggbApplet.setMode(40);
            this.setState({ showControlWarning: false, redo: false });
          }}
          takeControl={() => {
            this.resyncGgbState();
            if (inControl !== 'NONE') {
              this.ggbApplet.setMode(40);
            }
            toggleControl();
            this.setState({ showControlWarning: false, redo: false });
          }}
          inControl={inControl}
          cancel={() => {
            this.resyncGgbState();
            this.ggbApplet.setMode(40);
            this.setState({ showControlWarning: false, redo: false });
          }}
        />
        {/* <div className={classes.ReferenceLine} style={{left: this.state.referencedElementPosition.left, top: this.state.referencedElementPosition.top}}></div> */}
        {/* {this.state.showControlWarning ? <div className={classes.ControlWarning} style={{left: this.state.warningPosition.x, top: this.state.warningPosition.y}}>
          You don't have control!
        </div> : null} */}
      </Aux>
    );
  }
}
GgbGraph.defaultProps = {
  myColor: 'blue',
  referToEl: {},
};
GgbGraph.propTypes = {
  room: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    log: PropTypes.arrayOf(PropTypes.object),
    controlledBy: PropTypes.string,
  }).isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    connected: PropTypes.bool.isRequired,
  }).isRequired,
  tab: PropTypes.shape({}).isRequired,
  myColor: PropTypes.string,
  addToLog: PropTypes.func.isRequired,
  // updateRoomTab: PropTypes.func.isRequired,
  toggleControl: PropTypes.func.isRequired,
  resetControlTimer: PropTypes.func.isRequired,
  inControl: PropTypes.string.isRequired,
  currentTabId: PropTypes.string.isRequired,
  addNtfToTabs: PropTypes.func.isRequired,
  isFirstTabLoaded: PropTypes.bool.isRequired,
  referToEl: PropTypes.shape({}),
  showingReference: PropTypes.bool.isRequired,
  referencing: PropTypes.bool.isRequired,
  clearReference: PropTypes.func.isRequired,
  setToElAndCoords: PropTypes.func.isRequired,
  setFirstTabLoaded: PropTypes.func.isRequired,
  setGraphCoords: PropTypes.func.isRequired,
};

export default GgbGraph;
