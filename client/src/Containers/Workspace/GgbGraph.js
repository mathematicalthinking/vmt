import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Script from 'react-load-script';
import { parseString } from 'xml2js';
import throttle from 'lodash/throttle';
import mongoIdGenerator from '../../utils/createMongoId';
import classes from './graph.css';
import { Aux } from '../../Components';
import ControlWarningModal from './ControlWarningModal';
import socket from '../../utils/sockets';
import ggbTools from './Tools/GgbIcons';

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

  eventQueue = [];
  firstLabel = null;
  resetting = false; // used to reset the construction when something is done by a user not in control.
  editorState = null; // In the algebra input window,
  receivingData = false;
  batchUpdating = false;
  movingGeos = false;
  pointSelected = null;
  shapeSelected = null;
  isFileSet = false; // calling ggb.setBase64 triggers this.initializeGgb(), because we set base 64 inside initializeGgb we use this instance var to track whether we've already set the file. When the ggb tries to load the file twice it breaks everything
  socketQueue = [];
  isFaviconNtf = false;
  isWindowVisible = true;
  previousEvent = null; // Prevent repeat events from firing (for example if they keep selecting the same tool)
  time = null; // used to time how long an eventQueue is building up, we don't want to build it up for more than two seconds.
  /**
   * @method componentDidMount
   * @description add socket listeners, window resize listener
   */

  componentDidMount() {
    const { room, tabId, currentTab, addToLog, addNtfToTabs } = this.props;
    // We need access to a throttled version of sendEvent because of a geogebra bug that causes clientListener to fire twice when setMode is invoked
    this.throttledSendEvent = throttle(this.sendEvent, 500, {
      leading: true,
      trailing: false,
    });
    window.addEventListener('resize', this.updateDimensions);
    window.addEventListener('visibilitychange', this.visibilityChange);
    // socket.removeAllListeners("RECEIVE_EVENT");
    socket.on('RECEIVE_EVENT', data => {
      // console.log('receivied data: ', data);
      // console.log('recievingData: ', this.receivingData);
      // console.log('batchUpdating, ', this.batchUpdating);
      // console.log('received event: ', data);
      if (!this.isWindowVisible) {
        this.isFaviconNtf = true;
        this.changeFavicon('/favNtf.ico');
      }
      // callback('success');
      // If this event is for this tab add it to the log
      if (data.tab === room.tabs[tabId]._id) {
        addToLog(room._id, data);
        // If the event is for this tab but this tab is not in view,
        // add a notification to this tab
        if (currentTab !== tabId) {
          addNtfToTabs(room.tabs[tabId]._id);
        }

        // If we're still processing data from the last event
        // save this event in a queue...then when processing is done we'll pull
        // from this queue in clearSocketQueue()
        if (
          this.receivingData ||
          this.batchUpdating
          // &&
          // GgbEventTypes.indexOf(data.eventType) > -1
        ) {
          // console.log('adding to socket queue');
          this.socketQueue.push(data);
          return;
        }
        this.receivingData = true;
        this.constructEvent(data);
      }
    });

    socket.on('FORCE_SYNC', data => {
      this.receivingData = true;
      data.tabs.forEach((tab, i) => {
        if (i === tabId) {
          this.ggbApplet.setXML(tab.currentState);
          this.registerListeners(); // always reset listeners after calling sextXML (setXML destorys everything)
        }
      });
      this.receivingData = false;
    });
  }

  shouldComponentUpdate(nextProps) {
    const { tabId, currentTab } = this.props;
    return tabId === currentTab || nextProps.tabId === nextProps.currentTab;
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
      user,
      showingReference,
      referToEl,
      setToElAndCoords,
    } = this.props;
    if (currentTab === tabId) {
      // console.log("component updated");
      if (!this.ggbApplet) return;

      // new evnet
      if (prevProps.room.log && prevProps.room.log.length < room.log.length) {
        this.previousEvent = room.log[room.log.length - 1];
      }

      // Creating a reference
      if (!prevProps.referencing && referencing) {
        this.ggbApplet.setMode(0); // Set tool to pointer so the user can select elements @question shpuld they have to be in control to reference
      } else if (prevProps.referencing && !referencing) {
        this.ggbApplet.setMode(40);
      }
      // Control
      const wasInControl = prevProps.room.controlledBy === user._id;
      const isInControl = room.controlledBy === user._id;
      if (!wasInControl && isInControl) {
        this.ggbApplet.setMode(0);
      } else if (wasInControl && !isInControl) {
        this.ggbApplet.setMode(40);
      }

      // Displaying Reference
      if (
        !prevProps.showingReference &&
        showingReference &&
        referToEl.elementType !== 'chat_message'
      ) {
        // find the coordinates of the point we're referencing
        const position = await this.getRelativeCoords(referToEl.element);
        setToElAndCoords(null, position);
      } else if (
        showingReference &&
        prevProps.referToEl !== referToEl &&
        referToEl.elementType !== 'chat_message'
      ) {
        const position = await this.getRelativeCoords(referToEl.element);
        setToElAndCoords(null, position);
      }

      // switching tab
      if (prevProps.currentTab !== currentTab) {
        this.updateDimensions();
      }

      // releasing control
      if (
        prevProps.room.controlledBy !== room.controlledBy &&
        room.controlledBY === null
      ) {
        this.updateConstructionState();
      }
    }
  }

  componentWillUnmount() {
    this.updateConstructionState();
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
      // this.ggbApplet.unregisterStoreUndoListener(this.undoListener);
    }

    if (this.updatingTab) {
      clearTimeout(this.updatingTab);
    }
    window.removeEventListener('visibilitychange', this.visibilityChange);
    socket.removeAllListeners('RECEIVE_EVENT');
    socket.removeAllListeners('FORCE_SYNC');
    // if (!this.props.tempRoom) {
    //   let canvas = document.querySelector('[aria-label="Graphics View 1"]');
    //   this.props.updateRoom(this.props.room._id, {graphImage: {imageData: canvas.toDataURL()}})
    // }
    window.removeEventListener('resize', this.updateDimensions);
  }

  visibilityChange = () => {
    this.isWindowVisible = !this.isWindowVisible;
    if (this.isWindowVisible && this.isFaviconNtf) {
      this.isFaviconNtf = false;
      this.changeFavicon('/favicon.ico');
    }
  };

  changeFavicon = href => {
    const link =
      document.querySelector("link[rel*='icon']") ||
      document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = href;
    document.getElementsByTagName('head')[0].appendChild(link);
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

  constructEvent = data => {
    let readyToClearSocketQueue = true;
    switch (data.eventType) {
      case 'ADD':
        if (data.definition && data.definition.length > 0) {
          this.ggbApplet.evalCommand(`${data.label}:${data.definition}`);
        }
        this.ggbApplet.evalXML(data.event);
        this.ggbApplet.evalCommand('UpdateConstruction()');
        break;
      case 'REMOVE':
        if (data.eventArray) {
          this.updatingOn = true;
          data.eventArray.forEach(label => {
            this.ggbApplet.deleteObject(label);
          });
        } else {
          this.ggbApplet.deleteObject(data.label);
        }
        break;
      case 'UPDATE':
        this.ggbApplet.evalXML(data.event);
        this.ggbApplet.evalCommand('UpdateConstruction()');
        break;
      case 'CHANGE_PERSPECTIVE':
        this.ggbApplet.setPerspective(data.event);
        this.ggbApplet.showAlgebraInput(true);
        break;
      case 'BATCH_UPDATE':
        // this.updatingOn = true;
        readyToClearSocketQueue = false;
        this.batchUpdating = true;
        this.recursiveUpdate(data.eventArray);
        break;
      case 'BATCH_ADD':
        readyToClearSocketQueue = false;
        this.batchUpdating = true;
        if (data.definition) {
          this.recursiveUpdate(data.eventArray, 'ADDING');
        }
        break;
      case 'UPDATE_STYLE': {
        if (data.eventArray) {
          readyToClearSocketQueue = false;
          this.recursiveUpdate(data.eventArray);
        }
        break;
      }
      case 'UNDO': {
        this.ggbApplet.undo(); // @TODO this is not working...undo only undoes USER actions
        break;
      }
      case 'REDO': {
        this.ggbApplet.redo();
        break;
      }
      default:
        break;
    }
    if (readyToClearSocketQueue) {
      // console.log('checking socket qeueue from CONSTRUCT_EVENT');
      this.clearSocketQueue();
    }
  };

  clearSocketQueue = () => {
    // console.log('this.clearSocketQueue');
    if (this.socketQueue.length > 0) {
      // console.log('more event in socket queue');
      const nextEvent = this.socketQueue.shift();
      // console.log(nextEvent);
      this.constructEvent(nextEvent);
    } else {
      // console.log('all done');
      this.updatingOn = false;
      this.batchUpdating = false;
      this.receivingData = false;
    }
  };

  // eslint-disable-next-line consistent-return
  recursiveUpdate = (events, updateType) => {
    // console.log('recursive update: ', events, updateType);
    let readyToClearSocketQueue = true;
    if (events && events.length > 0 && Array.isArray(events)) {
      if (updateType === 'ADDING') {
        for (let i = 0; i < events.length; i++) {
          this.ggbApplet.evalCommand(events[i]);
        }
      } else {
        // If the socket queue is getting long skip some events to speed it up
        // if (
        //   this.socketQueue.length > 1 &&
        //   events.length > 2 &&
        //   events[0].eventType === 'BATCH_UPDATE'
        // ) {
        //   if (Array.isArray(events)) {
        //     // this should probably never happen...we should only have arrays in here
        //     events.shift();
        //   }
        // }
        this.ggbApplet.evalXML(events.shift());
        this.ggbApplet.evalCommand('UpdateConstruction()');
        if (events.length > 0) {
          readyToClearSocketQueue = false;
          return setTimeout(() => {
            this.recursiveUpdate(events);
          }, 0);
        }
      }
    } else if (events) {
      this.ggbApplet.evalXML(events);
      this.ggbApplet.evalCommand('UpdateConstruction()');
      // After we've finished applying all of the events check the socketQueue to see if more
      // events came over the socket while we were painting those updates
    }
    if (readyToClearSocketQueue) {
      // console.log('checking socket queue from RECURSIVE_UPDAYE');
      this.clearSocketQueue();
    }
  };

  updateDimensions = async () => {
    const {
      showingReference,
      referencing,
      referToEl,
      setToElAndCoords,
    } = this.props;
    if (this.graph.current) {
      const { clientHeight, clientWidth } = this.graph.current.parentElement;
      this.ggbApplet.setSize(clientWidth, clientHeight);
      this.ggbApplet.recalculateEnvironments();
      // window.ggbApplet.evalCommand('UpdateConstruction()')
      if (
        showingReference ||
        (referencing && referToEl.elmentType !== 'chat_message')
      ) {
        const { element } = referToEl;
        const position = await this.getRelativeCoords(element);
        setToElAndCoords(null, position);

        // @TODO SET A CANCELABLE TIMER TO SHOW THE REFERENCE AFTER RESIZING IS DONE
      }
    }
  };

  /**
   * @method onScriptLoad
   * @description defines parameters for the Ggb app.
   * complete list here: https://wiki.geogebra.org/en/Reference:GeoGebra_App_Parameters
   */

  onScriptLoad = () => {
    const { tabId, room, currentTab, isFirstTabLoaded } = this.props;
    const parameters = {
      id: `ggbApplet${tabId}A`,
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
      appName: room.tabs[tabId].appName || 'classic',
    };

    const ggbApp = new window.GGBApplet(parameters, '6.0');
    if (currentTab === tabId) {
      ggbApp.inject(`ggb-element${tabId}A`);
    } else {
      // wait to inject other tabs if they're not in focus
      // i.e. prioritze loading of the current tab
      this.loadingTimer = setInterval(() => {
        if (isFirstTabLoaded) {
          ggbApp.inject(`ggb-element${tabId}A`);
          clearInterval(this.loadingTimer);
        }
      }, 500);
    }
  };

  /**
   * @method initializeGgb
   * @description
   */

  initializeGgb = () => {
    const { room, tabId, setFirstTabLoaded } = this.props;
    const { currentState, startingPoint, ggbFile } = room.tabs[tabId];
    this.ggbApplet = window[`ggbApplet${tabId}A`];
    this.ggbApplet.setMode(40); // Sets the tool to zoom
    // put the current construction on the graph, disable everything until the user takes control
    // if (perspective) this.ggbApplet.setPerspective(perspective);
    if (currentState) {
      this.ggbApplet.setXML(currentState);
    } else if (startingPoint) {
      this.ggbApplet.setXML(startingPoint);
    } else if (ggbFile && !this.isFileSet) {
      this.isFileSet = true;
      this.ggbApplet.setBase64(ggbFile);
    }
    this.registerListeners();
    setFirstTabLoaded();
  };

  /**
   * @method userCanEdit
   * @description - checks if the user is in control and connected to the socket
   *  if they are in control and connected then they can edit
   * @return {Boolean} - can the user edit?
   */

  userCanEdit = () => {
    const { user, room } = this.props;
    if (this.resetting || this.updatingOn) {
      // console.log('edit allowed because reset or updatingon');
      return true;
    }
    if (
      (!user.connected || room.controlledBy !== user._id) &&
      !this.receivingData
    ) {
      return false;
    }
    return true;
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

  clientListener = event => {
    // console.log('client listener');
    // eslint-disable-next-line no-unused-vars
    const { referencing, resetControlTimer } = this.props;
    if (this.receivingData) {
      return;
    }
    // if (this.userCanEdit()) {
    //   resetControlTimer();
    // }
    switch (event[0]) {
      case 'setMode':
        // ignore this event if its the same as the last one or the user is selecting
        // zoom tool or the user is referencing and only using the pointer tool
        if (
          event[2] === '40' ||
          (referencing && event[2] === '0') ||
          (this.previousEvent.action === 'mode' &&
            this.previousEvent.label === event[2])
        ) {
          return;
        }
        if (this.userCanEdit()) {
          // throttled because of a bug in Geogebra that causes this to fire twice
          this.throttledSendEvent(null, null, event[2], 'SELECT', 'mode');
          return;
          // if the user is not connected or not in control and they initisted this event (i.e. it didn't come in over the socket)
          // Then don't send this to the other users/=.
        }
        if (event[2] !== '0') {
          // console.log(
          //   'showing control warning from client listener -- set mode'
          // );
          // this.showAlert();
          // this.ggbApplet.setMode(40);

          this.setState({ showControlWarning: true });
        }
        this.receivingData = false;
        break;

      case 'undo':
        if (this.resetting) {
          this.resetting = false;
          return;
        }
        if (this.userCanEdit()) {
          this.sendEvent(null, null, null, 'UNDO', null);
        } else {
          this.setState({ showControlWarning: true, redo: true });
        }
        break;
      case 'redo':
        if (this.resetting) {
          this.resetting = false;
          return;
        }
        if (this.userCanEdit()) {
          // this.showAlert();
          // this.resetting = true;
          // this.ggbApplet.undo();
        } else {
          this.setState({ showControlWarning: true });
        }
        break;
      case 'select':
        if (referencing) {
          return;
        }
        if (this.ggbApplet.getMode() === 0) {
          const selection = this.ggbApplet.getObjectType(event[1]);
          if (selection === 'point') {
            // How do you destructure when saving to a property of an object in this case `this`
            // eslint-disable-next-line prefer-destructuring
            this.pointSelected = event[1];
            this.shapeSelected = null;
          } else {
            // eslint-disable-next-line prefer-destructuring
            this.shapeSelected = event[1];
            this.pointSelected = null;
          }
          // console.log('mode: ', this.ggbApplet.getMode());
          this.sendEvent(null, selection, event[1], 'SELECT', 'ggbObj');
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
        const label = event[1];
        const xml = this.ggbApplet.getXML(label);
        if (this.userCanEdit()) {
          this.sendEventBuffer(xml, null, label, 'UPDATE_STYLE', 'updated');
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
        // If they weren't allowed to tupe here undo to the previous state
        // this.ggbApplet.setEditorState(this.editorState);
        this.setState({ showControlWarning: true });
        break;

      // ARE WE ACTUALLY USING THE BLCOKS BELOW??
      case 'movingGeos':
        this.movingGeos = true; // turn of updating so the updateListener does not send events
        break;
      case 'movedGeos': {
        this.movingGeos = true;
        // combine xml into one event
        let xml = '';
        let label = '';
        for (let i = 1; i < event.length; i++) {
          xml += this.ggbApplet.getXML(event[i]);
        }
        label = event[event.length - 1];
        this.sendEventBuffer(xml, null, label, 'UPDATE', 'updated');
        // this.movingGeos = false;
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
   * this addition and calls sendEvent() if they can. Else it undoes their change.
   * @param  {String} label - label of the point, segment, shape etc added
   */

  addListener = label => {
    if (this.batchUpdating || this.receivingData) {
      return;
    }
    if (this.resetting) {
      this.resetting = false;
      return;
    }
    if (!this.userCanEdit()) {
      // this.resetting = true;
      // this.ggbApplet.deleteObject(label);
      // Let the Ggb UI updates happen first...then when the stack is clear show an alert
      // setTimeout(() => this.showAlert(), 0);
      this.setState({ showControlWarning: true });
      return;
    }
    if (!this.receivingData) {
      const xml = this.ggbApplet.getXML(label);
      const objType = this.ggbApplet.getObjectType(label);
      const definition = this.ggbApplet.getCommandString(label);
      if (objType === 'point') {
        this.sendEvent(xml, null, label, 'ADD', 'added');
      } else {
        this.sendEventBuffer(xml, definition, label, 'ADD', 'added');
      }
    }
  };

  /**
   * @method removeListener
   * @description See add (but for removing)
   */

  removeListener = label => {
    // const { room, currentTab } = this.props;
    if (this.receivingData && !this.updatingOn) {
      return;
    }
    if (this.resetting) {
      this.resetting = false;
      return;
    }
    if (!this.userCanEdit()) {
      // this.showAlert();
      this.setState({ showControlWarning: true });
      // this.ggbApplet.setXML(room.tabs[currentTab].currentState);
      // Reregister the listeners because setXML clears everything
      // this.registerListeners();
      return;
    }
    if (!this.receivingData) {
      this.sendEventBuffer(null, null, label, 'REMOVE', 'removed');
    }
  };

  /**
   * @method removeListener
   * @description See add (but for updating), we don't check if the user can edit
   * because they would have first had to change their tool (or mode) which we only
   * allow if they're already in control
   */

  updateListener = label => {
    if (this.batchUpdating || this.movingGeos) return;
    if (this.receivingData && !this.updatingOn) {
      return;
    }
    // let independent = this.ggbApplet.isIndependent(label);
    // let moveable = this.ggbApplet.isMoveable(label);
    // let isInControl = this.props.room.controlledBy === this.props.user._id;

    if (
      this.userCanEdit &&
      !this.receivingData &&
      label === this.pointSelected
    ) {
      const xml = this.ggbApplet.getXML(label);
      this.sendEventBuffer(xml, null, label, 'UPDATE', 'updated');
    }
  };

  /**
   * @param  {String} element - ggb label for what has been clicked
   * @description used to get reference positions
   */

  clickListener = async element => {
    const { referencing, setToElAndCoords } = this.props;
    if (referencing) {
      const elementType = this.ggbApplet.getObjectType(element);
      let renamedElement;
      if (elementType !== 'point') {
        const commandString = this.ggbApplet.getCommandString(element);
        renamedElement = commandString.slice(
          commandString.indexOf('(') + 1,
          commandString.indexOf('(') + 2
        );
      }
      const position = await this.getRelativeCoords(renamedElement);
      setToElAndCoords({ element, elementType: 'point' }, position);
    }
  };

  /**
   * @method registerListens
   *  rs - register the even listeners with geogebra
   */

  registerListeners = () => {
    if (this.ggbApplet.listeners.length > 0) {
      // return;
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
   * @method sendEventBuffer
   * @description --- creates a buffer for sending events across the websocket.
   *  Because dragging a shape or point causes the update handler to fire every 10 to 20 ms, the
   *  constant sending of events across the network starts to slow things down. Instead of sending each
   *  event as it comes in we concatanate them into one event and then send them all roughly once every 1500 ms.
   * @param  {String} xml - ggb generated xml of the even
   * @param  {String} definition - ggb multipoint definition (e.g. "Polygon(D, E, F, G)")
   * @param  {String} label - ggb label. ggbApplet.evalXML(label) yields xml representation of this label
   * @param  {String} eventType - ["ADD", "REMOVE", "UPDATE", "CHANGE_PERSPECTIVE", "NEW_TAB", "BATCH", etc.] see ./models/event
   * @param  {String} action - ggb action ["addedd", "removed", "clicked", "updated"]
   */

  sendEventBuffer = (xml, definition, label, eventType, action) => {
    const { user, room } = this.props;
    // console.log('in the event buffer');
    let sendEventFromTimer = true;

    if (!user.connected || room.controlledBy !== user._id) {
      // console.log('show control warning from sendEventBuffer');
      // console.log(xml, definition, label, eventType, action);
      this.setState({ showControlWarning: true });
      return;
    }
    // Add event to eventQueue in case there are multiple events to send.
    if (eventType === 'REMOVE') {
      this.eventQueue.push(label);
    } else {
      this.eventQueue.push(
        action === 'updated' ? xml : `${label}:${definition}`
      );
    }
    if (this.timer) {
      // cancel the last sendEvent function
      clearTimeout(this.timer);
      this.timer = null;
      // Don't build up the queue for more than 1.5 seconds. If A user starts dragging,
      // we'll combine all of those events into one and then send them after 1.5 seconds,
      // if the user is still dragging we build up a new queue. This way, if they drag for several seconds,
      // there is not a several second delay before the other users in the room see the event
      if (this.time && Date.now() - this.time > 1500) {
        const isMultiPart = true;
        let renamedEventType = 'BATCH_ADD';
        if (eventType === 'UPDATE') {
          renamedEventType = 'BATCH_UPDATE';
        }
        // I dont think this condition will ever be met because style updates dont take more than 1.5...consider remove
        if (eventType === 'UPDATE_STYLE') {
          renamedEventType = 'UPDATE_STYLE';
        }
        this.sendEvent(
          xml,
          definition,
          label,
          renamedEventType,
          action,
          [...this.eventQueue],
          isMultiPart
        );
        sendEventFromTimer = false;
        this.eventQueue = [];
        this.time = null;
        this.timer = null;
      }
    } else {
      this.time = Date.now();
    }

    if (sendEventFromTimer) {
      this.timer = setTimeout(() => {
        let renamedEventType = eventType;
        if (eventType === 'UPDATE') {
          renamedEventType = 'BATCH_UPDATE';
        } else if (eventType === 'UPDATE_STYLE') {
          renamedEventType = 'UPDATE_STYLE';
        } else if (eventType === 'ADD' && this.eventQueue.length > 1) {
          renamedEventType = 'BATCH_ADD';
        }
        this.sendEvent(xml, definition, label, renamedEventType, action, [
          ...this.eventQueue,
        ]);
        this.eventQueue = [];
        this.time = null;
        this.timer = null;
      }, 110);
    }
  };

  /**
   * @method sendEvnet
   * @description emits the geogebra event over the socket and updates the room in the redux store.
   * @param  {String} xml - ggb generated xml of the even
   * @param  {String} definition - ggb multipoint definition (e.g. "Polygon(D, E, F, G)")
   * @param  {String} label - ggb label. ggbApplet.evalXML(label) yields xml representation of this label
   * @param  {String} eventType - ["ADD", "REMOVE", "UPDATE", "CHANGE_PERSPECTIVE", "NEW_TAB", "BATCH"] see ./models/event
   * @param  {String} action - ggb action ["addedd", "removed", "clicked", "updated"]
   * @param {Array} eventQueue - if we're sending many events they'll be stored in array (for dragging and creating multiple points/lines of a shape)
   * @param {bool} isMultiPart - When drag events last more than 1.5 seconds we break the event up so we can continuusly emit the drag to
   * other users while the drag is happening instead of waiting until the very end. isMultiPart = true if the event is a broken up drag.
   * We want to store this information so we know how to combine the multipart events into a single event for the replayer.
   */

  sendEvent = (
    xml,
    definition,
    label,
    eventType,
    action,
    eventQueue,
    isMultiPart = false
  ) => {
    const {
      room,
      user,
      myColor,
      currentTab,
      addToLog,
      resetControlTimer,
    } = this.props;
    const newData = {
      _id: mongoIdGenerator(),
      definition,
      label,
      eventType,
      action,
      isMultiPart,
      room: room._id,
      tab: room.tabs[currentTab]._id,
      event: xml,
      color: myColor,
      user: { _id: user._id, username: user.username },
      timestamp: new Date().getTime(),
      // currentState: this.ggbApplet.getXML(), // @TODO could we get away with not doing this? just do it when someone leaves?
      // mode: this.ggbApplet.getMode() // all ggbApplet get methods are too slow for dragging...right?
    };

    newData.description = this.buildDescription(
      definition,
      label,
      eventType,
      action,
      eventQueue
    );

    if (eventQueue && eventQueue.length > 0) {
      newData.eventArray = eventQueue;
    }
    addToLog(room._id, newData);

    if (this.updatingTab) {
      clearTimeout(this.updatingTab);
      this.updatingTab = null;
    }
    socket.emit('SEND_EVENT', newData);

    this.updatingTab = setTimeout(this.updateConstructionState, 3000);
    this.timer = null;
    this.movingGeos = false;
    resetControlTimer();
  };
  /**
   * @method buildDescription - takes information passed to send event and builds
   *  a description of the event that occured
   * @param  {String} definition
   * @param  {String} label
   * @param  {String} eventType
   * @param  {String} action
   * @param  {Array} eventQueue
   *
   * @return {String} description
   */
  buildDescription = (definition, label, eventType, action, eventQueue) => {
    // console.log(definition, label, eventType, action, eventQueue);
    const { user } = this.props;
    let description = `${user.username}`;
    let newLabel = label;
    let objType = this.ggbApplet.getObjectType(label);
    if (eventType === 'UPDATE_STYLE') {
      description += ` updated the style of ${objType} ${label}`;
    } else if (action === 'updated') {
      if (this.shapeSelected && eventType === 'BATCH_UPDATE') {
        objType = this.ggbApplet.getObjectType(this.shapeSelected);
        newLabel = this.shapeSelected;
      }
      description += ` dragged ${objType} ${newLabel}`;
    } else if (eventType === 'BATCH_ADD') {
      // parse the element label from the first element in eventQuere...it is always the most encompassing elemennt
      newLabel = eventQueue[0].slice(0, eventQueue[0].indexOf(':'));
      objType = this.ggbApplet.getObjectType(newLabel);
      description += ` ${action} ${objType} ${newLabel}`;
    } else if (action === 'mode') {
      description += ` selected the ${ggbTools[label].name.toLowerCase()} tool`;
    } else if (eventType === 'SELECT') {
      description += ` selected ${objType} ${newLabel}`;
    } else if (action === 'added') {
      description += ` ${action} ${objType} ${newLabel}`;
    } else if (eventType === 'REMOVE') {
      description += ` removed ${label}`;
    }
    return description;
  };

  updateConstructionState = () => {
    const { room, tabId, updateRoomTab } = this.props;
    // console.log("updating construction state");
    if (this.ggbApplet) {
      // when this method is called by componentDidUnmount we sometimes may not have access to ggbApplet depending on HOW the component was unmounted
      const currentState = this.ggbApplet.getXML();
      const { _id } = room.tabs[tabId];
      updateRoomTab(room._id, _id, {
        // @todo consider saving an array of currentStates to make big jumps in the relpayer less laggy
        currentState,
      });
    }
  };

  /**
   * @method getRelativeCoords - converts x,y coordinates of ggb point and converts them to the pizel location on the screen
   * @param  {String} element - ggb defined Label. MUST be a point
   * @return {Promise Object} - because parseXML is async
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
        reject(err);
      }
      // Get the element's location relative to the client Window
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
      // this + 36 here is a hack...
      resolve({ left: xOffset, top: yOffset + 36 });
    });
  };

  parseXML = xml => {
    return new Promise((resolve, reject) => {
      parseString(xml, (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      });
    });
  };

  render() {
    const { tabId, toggleControl, inControl } = this.props;
    const { showControlWarning, redo } = this.state;
    return (
      <Aux>
        <Script
          url="https://cdn.geogebra.org/apps/deployggb.js"
          onLoad={this.onScriptLoad}
        />
        <div
          className={classes.Graph}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
          id={`ggb-element${tabId}A`}
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
            if (redo) {
              this.ggbApplet.redo();
            } else {
              this.ggbApplet.undo();
            }
            if (inControl !== 'NONE') {
              this.ggbApplet.setMode(40);
            }
            toggleControl();
            this.setState({ showControlWarning: false, redo: false });
          }}
          inControl={inControl}
          cancel={() => {
            if (redo) {
              this.ggbApplet.redo();
            } else {
              this.ggbApplet.undo();
            }
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
  myColor: PropTypes.string,
  addToLog: PropTypes.func.isRequired,
  updateRoomTab: PropTypes.func.isRequired,
  toggleControl: PropTypes.func.isRequired,
  resetControlTimer: PropTypes.func.isRequired,
  inControl: PropTypes.string.isRequired,
  currentTab: PropTypes.number.isRequired,
  tabId: PropTypes.number.isRequired,
  addNtfToTabs: PropTypes.func.isRequired,
  isFirstTabLoaded: PropTypes.bool.isRequired,
  referToEl: PropTypes.shape({}),
  showingReference: PropTypes.bool.isRequired,
  referencing: PropTypes.bool.isRequired,
  setToElAndCoords: PropTypes.func.isRequired,
  setFirstTabLoaded: PropTypes.func.isRequired,
};

export default GgbGraph;
