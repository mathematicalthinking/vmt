import React, { Component } from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash/throttle';
import classes from './graph.css';
import { Aux } from '../../Components';
import Script from 'react-load-script';
import socket from '../../utils/sockets';
import ggbTools from './Tools/GgbIcons/';
import { parseString } from 'xml2js';
class GgbGraph extends Component {
  state = {
    selectedElement: '',
    showControlWarning: false,
    receivingData: false,
    warningPosition: { x: 0, y: 0 },
  };

  graph = React.createRef();
  eventQueue = [];
  firstLabel;
  resetting = false; // used to reset the construction when something is done by a user not in control.
  editorState = null; // In the algebra input window,
  receivingData = false;
  batchUpdating = false;
  movingGeos = false;
  pointSelected = null;
  shapeSelected = null;
  isFileSet = false; // calling ggb.setBase64 triggers this.initializeGgb(), because we set base 64 inside initializeGgb we use this instance var to track whether we've already set the file. When the ggb tries to load the file twice it breaks everything
  socketQueue = [];
  previousEvent = null; // Prevent repeat events from firing (for example if they keep selecting the same tool)
  time = null; // used to time how long an eventQueue is building up, we don't want to build it up for more than two seconds.
  /**
   * @method componentDidMount
   * @description add socket listeners, window resize listener
   */

  componentDidMount() {
    // We need access to a throttled version of sendEvent because of a geogebra bug that causes clientListener to fire twice when setMode is invoked
    this.throttledSendEvent = throttle(this.sendEvent, 500, {
      leading: true,
      trailing: false,
    });
    window.addEventListener('resize', this.updateDimensions);
    // socket.removeAllListeners("RECEIVE_EVENT");
    socket.on('RECEIVE_EVENT', data => {
      // callback('success');
      let { room, tabId } = this.props;
      // If this event is for this tab add it to the log
      if (data.tab === room.tabs[tabId]._id) {
        this.props.addToLog(room._id, data);
        // If the event is for this tab but this tab is not in view,
        // add a notification to this tab
        if (this.props.currentTab !== this.props.tabId) {
          this.props.addNtfToTabs(room.tabs[this.props.tabId]._id);
        }

        // If we're still processing data from the last event
        // save this event in a queue...then when processing is done we'll pull
        // from this queue
        if (this.state.receivingData) {
          // we're already processing the previous event.
          this.socketQueue.push(data);
          return;
        }

        // this.updateConstructionState();
        this.setState({ receivingData: true }, () => {
          if (room.tabs[tabId]._id === data.tab) {
            // @TODO consider abstracting out...resued in the GgbReplayer
            switch (data.eventType) {
              case 'ADD':
                if (data.definition && data.definition.length > 0) {
                  this.ggbApplet.evalCommand(
                    `${data.label}:${data.definition}`
                  );
                }
                this.ggbApplet.evalXML(data.event);
                this.ggbApplet.evalCommand('UpdateConstruction()');
                break;
              case 'REMOVE':
                this.ggbApplet.deleteObject(data.label);
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
                this.batchUpdating = true;
                this.recursiveUpdate(data.eventArray, data.noOfPoints);
                break;
              case 'BATCH_ADD':
                this.batchUpdating = true;
                if (data.definition) {
                  this.recursiveUpdate(data.eventArray, true);
                }
                break;
              default:
                this.setState({ receivingData: false });
                break;
            }
          }
        });
      }
    });
    socket.on('FORCE_SYNC', room => {
      this.setState({ receivingData: true }, () => {
        room.tabs.forEach((tab, i) => {
          if (i === this.props.tabId) {
            this.ggbApplet.setXML(tab.currentState);
            this.registerListeners();
          }
        });
      });
    });
  }

  shouldComponentUpdate(nextProps) {
    return (
      this.props.tabId === this.props.currentTab ||
      nextProps.tabId === nextProps.currentTab
    );
  }

  /**
   * @method componentDidUpdate
   * @description - determines what should happen when props update
   * and initializes socket event listeners
   * @param  {Object} prevProps - props before update
   */

  async componentDidUpdate(prevProps) {
    if (this.props.currentTab === this.props.tabId) {
      // console.log("component updated");
      if (!this.ggbApplet) return;

      // new evnet
      if (
        prevProps.room.log &&
        prevProps.room.log.length < this.props.room.log.length
      ) {
        this.previousEvent = this.props.room.log[
          this.props.room.log.length - 1
        ];
      }

      // Creating a reference
      if (!prevProps.referencing && this.props.referencing) {
        this.ggbApplet.setMode(0); // Set tool to pointer so the user can select elements @question shpuld they have to be in control to reference
      } else if (prevProps.referencing && !this.props.referencing) {
        this.ggbApplet.setMode(40);
      }
      // Control
      let wasInControl = prevProps.room.controlledBy === this.props.user._id;
      let isInControl = this.props.room.controlledBy === this.props.user._id;
      if (!wasInControl && isInControl) {
        this.ggbApplet.setMode(0);
      } else if (wasInControl && !isInControl) {
        this.ggbApplet.setMode(40);
      }

      // Displaying Reference
      if (
        !prevProps.showingReference &&
        this.props.showingReference &&
        this.props.referToEl.elementType !== 'chat_message'
      ) {
        // find the coordinates of the point we're referencing
        let position = await this.getRelativeCoords(
          this.props.referToEl.element
        );
        this.props.setToElAndCoords(null, position);
      } else if (
        this.props.showingReference &&
        prevProps.referToEl !== this.props.referToEl &&
        this.props.referToEl.elementType !== 'chat_message'
      ) {
        let position = await this.getRelativeCoords(
          this.props.referToEl.element
        );
        this.props.setToElAndCoords(null, position);
      }

      // switching tab
      if (prevProps.currentTab !== this.props.currentTab) {
        this.updateDimensions();
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

    socket.removeAllListeners('RECEIVE_EVENT');
    socket.removeAllListeners('FORCE_SYNC');
    // if (!this.props.tempRoom) {
    //   let canvas = document.querySelector('[aria-label="Graphics View 1"]');
    //   this.props.updateRoom(this.props.room._id, {graphImage: {imageData: canvas.toDataURL()}})
    // }
    window.removeEventListener('resize', this.updateDimensions);
  }

  /**
   * @method recursiveUpdate
   * @description takes an array of events and updates the construction in batches
   * used to make drag updates and multipoint shape creation more efficient. See ./docs/Geogebra
   * Note that this is copy-pasted in GgbReplayer for now, consider abstracting.
   * When we've reached the bottom of the recursive chain we check if any events came in while
   * making these changes. (See the socket listener if(this.state.receviingData))
   * @param  {Array} events - array of ggb xml events
   * @param  {Number} batchSize - the batch size, i.e., number of points in the shape
   * @param  {Boolean} adding - true if BATCH_ADD false if BATCH_UPDATE
   */

  recursiveUpdate(events, adding) {
    if (events && events.length > 0 && Array.isArray(events)) {
      if (adding) {
        for (let i = 0; i < events.length; i++) {
          this.ggbApplet.evalCommand(events[i]);
        }
        this.updatingOn = false;
        this.setState({ receivingData: false });
        return;
      } else {
        // If the socket queue is getting long skip some events to speed it up
        if (this.socketQueue.length > 1 && events.length > 2) {
          if (Array.isArray(events)) {
            // this should probably never happen...we should only have arrays in here
            events.shift();
          }
        }
        if (Array.isArray(events)) {
          this.ggbApplet.evalXML(events.shift());
        } else {
          this.ggbApplet.evalXML(events);
        }
        this.ggbApplet.evalCommand('UpdateConstruction()');
        setTimeout(() => {
          this.recursiveUpdate(events);
        }, 0);
      }
      // After we've finished applying all of the events check the socketQueue to see if more
      // events came over the socket while we were painting those updates
    } else if (this.socketQueue.length > 0) {
      let nextEvent = this.socketQueue.shift();
      this.recursiveUpdate(nextEvent.eventArray, false);
      // If we're all done
    } else {
      this.batchUpdating = false;
      this.setState({ receivingData: false });
    }
  }

  updateDimensions = async () => {
    if (this.graph.current) {
      let { clientHeight, clientWidth } = this.graph.current.parentElement;
      this.ggbApplet.setSize(clientWidth, clientHeight);
      this.ggbApplet.recalculateEnvironments();
      // window.ggbApplet.evalCommand('UpdateConstruction()')
      if (
        this.props.showingReference ||
        (this.props.referencing &&
          this.props.referToEl.elmentType !== 'chat_message')
      ) {
        let { element } = this.props.referToEl;
        let position = await this.getRelativeCoords(element);
        this.props.setToElAndCoords(null, position);

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
    const parameters = {
      id: `ggbApplet${this.props.tabId}A`,
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
      appName: this.props.room.tabs[this.props.tabId].appName || 'classic',
    };

    const ggbApp = new window.GGBApplet(parameters, '6.0');
    if (this.props.currentTab === this.props.tabId) {
      ggbApp.inject(`ggb-element${this.props.tabId}A`);
    } else {
      // wait to inject other tabs if they're not in focus
      // i.e. prioritze loading of the current tab
      this.loadingTimer = setInterval(() => {
        if (this.props.isFirstTabLoaded) {
          ggbApp.inject(`ggb-element${this.props.tabId}A`);
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
    this.ggbApplet = window[`ggbApplet${this.props.tabId}A`];
    this.ggbApplet.setMode(40); // Sets the tool to zoom
    let { room, tabId } = this.props;
    let { currentState, startingPoint, ggbFile } = room.tabs[tabId];
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
    this.props.setFirstTabLoaded();
  };

  /**
   * @method userCanEdit
   * @description - checks if the user is in control and connected to the socket
   *  if they are in control and connected then they can edit
   * @return {Boolean} - can the user edit?
   */

  userCanEdit = () => {
    if (this.resetting || this.updatingOn) {
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
   * @description client listener fires everytime anything in the geogebra construction is touched
   * we use it to listen for user interaction, and either allow that action and send it over the socket
   * if they're in control, or prevent/undo it if they're not.
   * @param  {Array} event - Ggb array [eventType (e.g. setMode),  String, String]
   */

  clientListener = event => {
    if (this.state.receivingData) {
      return this.setState({ receivingData: false });
    }
    switch (event[0]) {
      case 'setMode':
        // ignore this event if its the same as the last one or the user is selecting
        // zoom tool or the user is referencing and only using the pointer tool
        if (
          event[2] === '40' ||
          (this.props.referencing && event[2] === '0') ||
          (this.previousEvent.action === 'mode' &&
            this.previousEvent.label === event[2])
        ) {
          return;
        } else if (this.userCanEdit()) {
          // throttled because of a bug in Geogebra that causes this to fire twice
          this.throttledSendEvent(null, null, event[2], 'SELECT', 'mode');
          return;
          // if the user is not connected or not in control and they initisted this event (i.e. it didn't come in over the socket)
          // Then don't send this to the other users/=.
        } else {
          if (event[2] !== '0') this.showAlert();
          this.ggbApplet.setMode(40);
        }
        this.setState({ receivingData: false });
        break;
      case 'undo':
        if (this.resetting || this.userCanEdit()) {
          this.resetting = false;

          return;
        } else {
          this.showAlert();
          this.resetting = true;
          this.ggbApplet.redo();
        }
        break;
      case 'redo':
        if (this.resetting || this.userCanEdit()) {
          this.resetting = false;
          return;
        } else {
          this.showAlert();
          this.resetting = true;
          this.ggbApplet.undo();
        }
        break;
      case 'select':
        if (this.props.referencing) {
          return;
        }
        if (this.ggbApplet.getMode() === 0) {
          let selection = this.ggbApplet.getObjectType(event[1]);
          if (selection === 'point') {
            this.pointSelected = event[1];
            this.shapeSelected = null;
          } else {
            this.shapeSelected = event[1];
            this.pointSelected = null;
          }
          this.sendEvent(null, selection, event[1], 'SELECT', 'ggbObj');
        }
        break;
      case 'openMenu':
        if (!this.userCanEdit()) {
          this.showAlert();
        }
        break;
      case 'perspectiveChange':
        break;
      case 'updateStyle':
        break;
      case 'editorStart':
        // this.ggbApplet.evalCommand("editorStop()");
        // save the state of what's being edited BEFORE they edit it. This way,
        // if they're not in control and cannot edit, we can reset to this state
        this.editorState = this.ggbApplet.getEditorState();
        break;
      case 'editorKeyTyped':
        if (this.userCanEdit()) {
          return;
        } else {
          // If they weren't allowed to tupe here undo to the previous state
          this.ggbApplet.setEditorState(this.editorState);
          this.showAlert();
        }
        break;
      case 'movingGeos':
        this.movingGeos = true; // turn of updating so the updateListener does not send events
        break;
      case 'movedGeos':
        this.movingGeos = true;
        // combine xml into one event
        let xml = '';
        let label = '';
        for (var i = 1; i < event.length; i++) {
          xml += this.ggbApplet.getXML(event[i]);
        }
        label = event[i];
        this.sendEventBuffer(xml, null, label, 'UPDATE', 'updated');
        // this.movingGeos = false;
        break;

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
    if (this.state.receivingData && !this.updatingOn) {
      this.setState({ receivingData: false });
      return;
    }
    if (this.resetting) {
      this.resetting = false;
      return;
    }
    if (!this.userCanEdit()) {
      this.resetting = true;
      this.ggbApplet.deleteObject(label);
      // Let the Ggb UI updates happen first...then when the stack is clear show an alert
      setTimeout(() => this.showAlert(), 0);
      return;
    }
    if (!this.state.receivingData) {
      let xml = this.ggbApplet.getXML(label);
      let definition = this.ggbApplet.getCommandString(label);
      this.sendEventBuffer(xml, definition, label, 'ADD', 'added');
    }
  };

  /**
   * @method removeListener
   * @description See add (but for removing)
   */

  removeListener = label => {
    if (this.state.receivingData && !this.updatingOn) {
      this.setState({ receivingData: false });
      return;
    }
    if (this.resetting) {
      this.resetting = false;
      return;
    }
    if (!this.userCanEdit()) {
      this.showAlert();
      let { room, currentTab } = this.props;
      this.ggbApplet.setXML(room.tabs[currentTab].currentState);
      // Reregister the listeners because setXML clears everything
      this.registerListeners();
      return;
    }
    if (!this.state.receivingData) {
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
    if (this.state.receivingData && !this.updatingOn) {
      this.setState({ receivingData: false });
      return;
    }
    // let independent = this.ggbApplet.isIndependent(label);
    // let moveable = this.ggbApplet.isMoveable(label);
    // let isInControl = this.props.room.controlledBy === this.props.user._id;
    if (!this.state.receivingData && label === this.pointSelected) {
      let xml = this.ggbApplet.getXML(label);
      this.sendEventBuffer(xml, null, label, 'UPDATE', 'updated');
    }
  };

  /**
   * @param  {String} element - ggb label for what has been clicked
   * @description used to get reference positions
   */

  clickListener = async element => {
    if (this.props.referencing) {
      let elementType = this.ggbApplet.getObjectType(element);
      let position;
      if (elementType !== 'point') {
        let commandString = this.ggbApplet.getCommandString(element);
        element = commandString.slice(
          commandString.indexOf('(') + 1,
          commandString.indexOf('(') + 2
        );
      }
      position = await this.getRelativeCoords(element);
      this.props.setToElAndCoords({ element, elementType: 'point' }, position);
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
   * @param  {String} eventType - ["ADD", "REMOVE", "UPDATE", "CHANGE_PERSPECTIVE", "NEW_TAB", "BATCH"] see ./models/event
   * @param  {String} action - ggb action ["addedd", "removed", "clicked", "updated"]
   */

  sendEventBuffer = (xml, definition, label, eventType, action) => {
    // console.log('in the event buffer');
    let sendEventFromTimer = true;
    // Don't send if the user is not allowed to make changes
    if (
      !this.props.user.connected ||
      this.props.room.controlledBy !== this.props.user._id
    ) {
      alert(
        'You are not in control. The update you just made will not be saved. Please refresh the page'
      );
      this.ggbApplet.undo();
      return;
    }
    // Add event to eventQueue in case there are multiple events to send.
    this.eventQueue.push(action === 'updated' ? xml : `${label}:${definition}`);

    if (this.timer) {
      // cancel the last sendEvent function
      clearTimeout(this.timer);
      this.timer = null;
      // Don't build up the queue for more than 2 seconds. If A user starts dragging,
      // we'll combine all of those events into one and then send them after 2 seconds,
      // if the user is still dragging we build up a new queue. This way, if they drag for several seconds,
      // there is not a several second delay before the other users in the room see the event
      if (this.time && Date.now() - this.time > 1500) {
        eventType = eventType === 'UPDATE' ? 'BATCH_UPDATE' : 'BATCH_ADD';
        this.sendEvent(xml, definition, label, eventType, action, [
          ...this.eventQueue,
        ]);
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
        eventType = eventType === 'UPDATE' ? 'BATCH_UPDATE' : 'BATCH_ADD';
        // Because all ADD events pass thru this buffer, if the eventQueue just has one event in it
        // the event is actually just an "ADD" not a batch add
        if (this.eventQueue.length === 1) {
          eventType = 'ADD';
          this.sendEvent(xml, definition, label, eventType, action);
        } else {
          this.sendEvent(xml, definition, label, eventType, action, [
            ...this.eventQueue,
          ]);
        }
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
   */

  sendEvent = (xml, definition, label, eventType, action, eventQueue) => {
    let { room, user, myColor, currentTab } = this.props;

    let newData = {
      definition,
      label,
      eventType,
      action,
      room: room._id,
      tab: room.tabs[currentTab]._id,
      event: xml,
      color: myColor,
      user: { _id: user._id, username: user.username },
      timestamp: new Date().getTime(),
      // currentState: this.ggbApplet.getXML(), // @TODO could we get away with not doing this? just do it when someone leaves?
      // mode: this.ggbApplet.getMode()
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
    this.props.addToLog(this.props.room._id, newData);

    if (this.updatingTab) {
      clearTimeout(this.updatingTab);
      this.updatingTab = null;
    }
    socket.emit('SEND_EVENT', newData);

    this.updatingTab = setTimeout(this.updateConstructionState, 3000);
    this.timer = null;
    this.movingGeos = false;
    this.props.resetControlTimer();
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
    let description = `${this.props.user.username}`;
    let objType = this.ggbApplet.getObjectType(label);
    if (action === 'updated') {
      if (this.shapeSelected && eventType === 'BATCH_UPDATE') {
        objType = this.ggbApplet.getObjectType(this.shapeSelected);
        label = this.shapeSelected;
      }
      description = description + ` dragged ${objType} ${label}`;
    } else if (eventType === 'BATCH_ADD') {
      // parse the element label from the first element in eventQuere...it is always the most encompassing elemennt
      let newLabel = eventQueue[0].slice(0, eventQueue[0].indexOf(':'));
      let objType = this.ggbApplet.getObjectType(newLabel);
      description = description + ` ${action} ${objType} ${newLabel}`;
    } else if (action === 'mode') {
      description =
        description +
        ` selected the ${ggbTools[label].name.toLowerCase()} tool`;
    } else if (eventType === 'SELECT') {
      description = description + ` selected ${objType} ${label}`;
    } else if (action === 'added') {
      description = description + ` ${action} ${objType} ${label}`;
    }
    return description;
  };

  updateConstructionState = () => {
    let { room } = this.props;
    // console.log("updating construction state");
    if (this.ggbApplet) {
      // when this method is called by componentDidUnmount we sometimes may not have access to ggbApplet depending on HOW the component was unmounted
      let currentState = this.ggbApplet.getXML();
      let tabId = room.tabs[this.props.tabId]._id;
      this.props.updateRoomTab(room._id, tabId, {
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
          id={`ggb-element${this.props.tabId}A`}
          ref={this.graph}
        />
        {/* <div className={classes.ReferenceLine} style={{left: this.state.referencedElementPosition.left, top: this.state.referencedElementPosition.top}}></div> */}
        {/* {this.state.showControlWarning ? <div className={classes.ControlWarning} style={{left: this.state.warningPosition.x, top: this.state.warningPosition.y}}>
          You don't have control!
        </div> : null} */}
      </Aux>
    );
  }
}

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
  role: PropTypes.string.isRequired,
  addToLog: PropTypes.func.isRequired,
  updateRoom: PropTypes.func.isRequired,
  updateRoomTab: PropTypes.func.isRequired,
  updatedRoom: PropTypes.func.isRequired,
  resetControlTimer: PropTypes.func.isRequired,
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
