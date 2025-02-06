import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Script from 'react-load-script';
import { parseString } from 'xml2js';
import throttle from 'lodash/throttle';
import isFinite from 'lodash/isFinite';
import find from 'lodash/find';
import classes from './graph.css';
import { blankEditorState, setCodeBase } from './ggbUtils';
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

const GgbViewIdToPerspectiveMap = {
  1: { perspective: 'G', defaultTool: 40, controlTool: 0 }, // graphing
  2: { perspective: 'A', defaultTool: 0, controlTool: 0 }, // algebra
  4: { perspective: 'S', defaultTool: 0, controlTool: 0 }, // spreadsheet
  512: { perspective: 'T', defaultTool: 40, controlTool: 0 }, // 3D graphics,
  8: { perspective: 'C', defaultTool: 1001, controlTool: 1001 }, // CAS,
  64: { perspective: 'B', defaultTool: 0, controlTool: 0 }, // probability
  16: { perspective: 'D', defaultTool: 40, controlTool: 0 }, // graphics view 2,
  4097: { perspective: 'P', defaultTool: 0, controlTool: 0 }, // properties menu
  32: { perspective: 'L', defaultTool: 0, controlTool: 0 }, // construction protocol,
};

const refViewToIdMap = {
  1: '1',
  2: '16',
  512: '512',
};

// const viewLocationMap = { 2 views
//   3: 'LEFT',
//   2: 'BOTTOM',
//   0: 'TOP',
//   1: 'RIGHT',
// };

// 1 view location =0

// 3 views
// left: 3,3
// middle 3,1

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
  currentDefinition = null; // used to prevent duplicate definitions being sent across the socket...e.g., when using the roots tools (https://help.geogebra.org/en/tool/Roots)
  // it sends the Roots(line, x, y) for each point that is created...we only want to send it once
  isFileSet = false; // calling ggb.setBase64 triggers this.initializeGgb(), because we set base 64 inside initializeGgb we use this instance var to track whether we've already set the file. When the ggb tries to load the file twice it breaks everything
  isFaviconNtf = false;
  isWindowVisible = true;
  currentShape = [];
  previousEvent = null; // Prevent repeat events from firing (for example if they keep selecting the same tool)
  previousCommandString = null;
  time = null; // used to time how long an eventQueue is building up, we don't want to build it up for more than two seconds.

  renamedDetails = null; // tuple of oldLabel, newLabel
  tabFileLoadedHash = {};
  /**
   * @method componentDidMount
   * @description add socket listeners, window resize listener
   */

  componentDidMount() {
    // const { currentTabId } = this.props;
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
    window.addEventListener('scroll', this.scrollChange);

    if (this.graph.current) {
      this.graph.current.addEventListener('mouseenter', this.lockWindowScroll);

      this.graph.current.addEventListener(
        'mouseleave',
        this.unlockWindowScroll
      );
    }
    // console.log('Mounted - Tab Id: ', currentTabId);
    socket.on('RECEIVE_EVENT', (data) => {
      this.handleUpdate(data);
    });

    //   socket.on('FORCE_SYNC', (data) => {
    //     this.forceGgbSync(data);
    //   });
  }

  /**
   * @method componentDidUpdate
   * @description - determines what should happen when props update
   * and initializes socket event listeners
   * @param  {Object} prevProps - props before update
   */

  async componentDidUpdate(prevProps) {
    const {
      currentTabId,
      tab,
      // room,
      referencing,
      inControl,
      showingReference,
      referToEl,
      clearReference,
      log,
    } = this.props;

    if (!this.ggbApplet) {
      return;
    }

    if (currentTabId !== tab._id) {
      return;
    }

    const isInControl = inControl === 'ME';
    const wasInControl = prevProps.inControl === 'ME';
    const didGainControl = !wasInControl && isInControl;
    const didReleaseControl = wasInControl && !isInControl;

    const isNewEvent = prevProps.log.length < log.length;
    const didStartReferencing = !prevProps.referencing && referencing;
    const didStopReferencing = prevProps.referencing && !referencing;

    const didStartDisplayingReference =
      !prevProps.showingReference && showingReference;

    const didReferToElChange = prevProps.referToEl !== referToEl;

    if (isNewEvent) {
      this.previousEvent = log[log.length - 1];
    }

    // Creating a reference
    if (didStartReferencing) {
      // prompt if they want reference to automatically turn on when chat is in focus?
      this.setDefaultGgbMode();
      // Set tool to pointer so the user can select elements @question shpuld they have to be in control to reference
    } else if (didStopReferencing) {
      // if they are in control, can keep mode set to move tool
      if (!isInControl) {
        // force resync in case they moved anything while referencing
        // this.resyncGgbState();
        // this.ggbApplet.setMode(40);
      }
    }
    // Control
    if (didGainControl) {
      clearReference();
      await this.resyncGgbState();
      this.setDefaultGgbMode();
    } else if (didReleaseControl) {
      this.hideShowRightButtonPanel(-1);
      this.setDefaultGgbMode();
    }

    // Displaying Reference
    if (
      didStartDisplayingReference &&
      referToEl.elementType !== 'chat_message'
    ) {
      // find the coordinates of the point we're referencing
      this.updateReferToEl(referToEl);
    } else if (
      showingReference &&
      didReferToElChange &&
      referToEl.elementType !== 'chat_message'
    ) {
      this.updateReferToEl(referToEl);
    }

    // switching tab
    if (prevProps.currentTabId !== currentTabId) {
      this.updateDimensions();
    }

    // releasing control
    if (prevProps.inControl !== inControl && inControl === 'NONE') {
      // this.updateConstructionState();
    }
  }

  componentWillUnmount() {
    // this.updateConstructionState();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.loadingTimer) {
      clearInterval(this.loadingTimer);
    }
    if (this.ggbApplet) {
      this.ggbApplet.unregisterAddListener(this.addListener);
      this.ggbApplet.unregisterUpdateListener(this.updateListener);
      // this.ggbApplet.unregisterClickListener(this.clickListener);
      this.ggbApplet.unregisterRemoveListener(this.removeListener);
      this.ggbApplet.unregisterClearListener(this.clearListener);
      this.ggbApplet.unregisterClientListener(this.clientListener);
      this.ggbApplet.unregisterRenameListener(this.renameListener);
      this.ggbApplet.unregisterObjectUpdateListener(this.cornerLabel);

      this.removeGgbObjectSilent(this.cornerLabel);
    }

    if (this.updatingTab) {
      clearTimeout(this.updatingTab);
    }

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
    window.removeEventListener('visibilitychange', this.visibilityChange);
    socket.removeAllListeners('RECEIVE_EVENT');
    socket.removeAllListeners('FORCE_SYNC');
    window.removeEventListener('resize', this.updateDimensions);
  }

  getCoordsFromPathParameter(element, parameter) {
    if (!this.ggbApplet) {
      return [];
    }

    this.doIgnoreAdd = true;
    const refPoint = this.ggbApplet.evalCommandGetLabels(
      `Point(${element},${parameter})`
    );
    this.doIgnoreAdd = false;

    this.ggbApplet.setAuxiliary(refPoint, true);

    const refCoords = this.getGgbPointCoords(refPoint);

    this.removeGgbObjectSilent(refPoint);
    return refCoords;
  }

  getBase64Async = () => {
    return new Promise((resolve, reject) => {
      if (!this.ggbApplet) {
        reject(new Error('Missing ggbApplet'));
        return;
      }
      this.ggbApplet.getBase64((base64) => {
        if (!base64) {
          reject(new Error('Unable to get base64 construction state'));
          return;
        }
        resolve(base64);
      });
    });
  };

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
    if (event.base64) {
      // used for undo and redo events currently
      // do not want to run UpdateConstruction command after setBase64
      this.didResync = true;
      this.setGgbBase64(event.base64);
      return;
    }
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
    } else if (event.valueString) {
      this.ggbApplet.evalCommand(event.valueString);
    }
    this.ggbApplet.evalCommand('UpdateConstruction()');
  };

  readFromGraph = (label, eventType) => {
    const objType = this.ggbApplet.getObjectType(label);
    const editorState = this.ggbApplet.getEditorState(label);

    let base64;
    let xml;
    let commandString;
    let valueString;

    const algXML = this.ggbApplet.getAlgorithmXML(label);

    if (!algXML) {
      xml = this.ggbApplet.getXML(label);
    }

    if (objType === 'image' || objType === 'file') {
      // need to get entire base64 state
      base64 = this.ggbApplet.getBase64();
    } else {
      commandString = this.ggbApplet.getCommandString(label);
      valueString = this.ggbApplet.getValueString(label);
    }
    let x;
    let y;
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
      base64,
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
      showAlgebraInput: tab.appName === 'geometry',
      language: 'en',
      useBrowserForJS: false,
      borderColor: '#ddd',
      buttonShadows: true,
      preventFocus: true,
      showLogging: false,
      errorDialogsActive: false,
      appletOnLoad: this.initializeGgb,
      appName: tab.appName || 'classic',
    };
    const ggbApp = new window.GGBApplet(parameters, '6.0');
    if (currentTabId === tab._id) {
      setCodeBase(ggbApp);
      ggbApp.inject(`ggb-element${tab._id}A`);
    } else {
      // wait to inject other tabs if they're not in focus
      // i.e. prioritze loading of the current tab
      this.loadingTimer = setInterval(() => {
        // accessing props here instead of top of function so that
        // this value is current on each interval
        const { isFirstTabLoaded } = this.props;
        if (isFirstTabLoaded) {
          setCodeBase(ggbApp);
          ggbApp.inject(`ggb-element${tab._id}A`);
          clearInterval(this.loadingTimer);
        }
      }, 500);
    }
  };

  resyncGgbState = () => {
    const { tab } = this.props;
    this.didResync = true;
    this.tabFileLoadedHash[tab._id] = false;
    this.isResyncing = true;
    return this.getTabState()
      .then(() => {
        const { inControl } = this.props;
        const displayValue = inControl === 'ME' ? 1 : -1;
        this.hideShowRightButtonPanel(displayValue);
      })
      .catch(() => {
        const { inControl, toggleControl } = this.props;

        if (inControl === 'ME') {
          // if an error occured while resyncing and the user has control
          // auto remove control
          toggleControl();
        }
        // eslint-disable-next-line no-alert
        window.alert(
          'An error occurred syncing the state of this room. It is recommended you refresh the page to avoid falling out of sync with other users.'
        );
      });
  };

  getTabState = () => {
    const { tab } = this.props;
    return API.getById('tabs', tab._id)
      .then((res) => {
        return this.setGgbState(res.data.result);
      })
      .then(() => {
        this.registerListeners();
        this.setDefaultGgbMode().then(() => {
          this.isResyncing = false;
        });
      })
      .catch((err) => {
        console.log('ERROR resyncing: ', 'failed to updated', err);
        this.isResyncing = false;
        throw err;
      });
  };

  /**
   * @method initializeGgb
   * @description
   */

  waitForGraphElement = () => {
    return new Promise((resolve) => {
      const checkElement = () => {
        if (this.getInnerGraphCoords()) {
          resolve();
        } else {
          // Check again in 100ms
          setTimeout(checkElement, 100);
        }
      };
      checkElement();
    });
  };

  initializeGgb = async () => {
    this.isInitializingGgb = true;
    const { tab, setFirstTabLoaded, currentTabId } = this.props;

    try {
      // Wait for the graph element to be fully loaded
      await this.waitForGraphElement();

      this.ggbApplet = window[`ggbApplet${tab._id}A`];
      await this.setDefaultGgbMode();

      if (!this.didResync) {
        await this.resyncGgbState();
      } else {
        this.didResync = false;
      }

      if (tab._id === currentTabId) {
        setFirstTabLoaded();
      }

      await this.setDefaultGgbMode();
      this.isInitializingGgb = false;

      // Add resize observer to update coordinates when window is resized
      const graphEl = document.querySelector('.gwt-SplitLayoutPanel');
      if (graphEl && typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => {
          this.getInnerGraphCoords();
        });
        this.resizeObserver.observe(graphEl);
      }
    } catch (err) {
      console.log(`Error initializingGgb: `, err);
      this.isInitializingGgb = false;
    }
  };

  /**
   * @method userCanEdit
   * @description - checks if the user is in control and connected to the socket
   *  if they are in control and connected then they can edit
   * @return {Boolean} - can the user edit?
   */

  userCanEdit = () => {
    const { inControl, user } = this.props;
    if (this.resetting || this.updatingOn) {
      return false;
    }
    if (inControl === 'ME' && !this.receivingData) {
      return true;
    }

    if (user.inAdminMode) {
      return false;
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
    if (!event) {
      // seems to happen if you click a bunch of points really quickly
      return;
    }
    // modes (https://wiki.geogebra.org/en/Reference:Toolbar)
    // 40 = TRANSLATEVIEW
    // 0 = MOVE

    const { referencing, clearReference } = this.props;
    const canChangePerspective = false; //  room.settings.participantsCanChangePerspective;
    if (this.receivingData) {
      return;
    }

    switch (event[0]) {
      case 'setMode':
        // eslint-disable-next-line prefer-destructuring
        if (
          event[2] === '40' ||
          // (referencing && event[2] === '0') ||
          (this.previousEvent &&
            this.previousEvent.eventType === 'mode' &&
            this.previousEvent.label === event[2])
        ) {
          return;
        }
        this.getDefaultGgbMode().then((mode) => {
          if (event[2] === mode.toString()) {
            return;
          }
          if (this.userCanEdit()) {
            // throttled because of a bug in Geogebra that causes this to fire twice
            this.throttledSendEvent({ eventType: 'MODE', label: event[2] });

            if (referencing) {
              clearReference();
            }
            return;
            // if the user is not connected or not in control and they initisted this event (i.e. it didn't come in over the socket)
            // Then don't send this to the other users/=.
          }
          if (event[2] !== mode.toString()) {
            if (!this.isResyncing && !this.isInitializingGgb) {
              // this.intendedMode = parseInt(event[2], 10);
              this.setState({ showControlWarning: true });
            } else {
              this.setDefaultGgbMode().then(() => {
                this.receivingData = false;
              });
            }
          } else {
            this.receivingData = false;
          }
        });
        break;

      case 'undo':
        if (this.resetting) {
          // undo was triggered as a result of someone not in control clicking redo
          this.resetting = false;
          return;
        }
        if (this.userCanEdit()) {
          const base64 = this.ggbApplet.getBase64();
          this.sendEvent({ eventType: 'UNDO', base64 });
        } else {
          this.setState({ showControlWarning: true, redo: true });
        }
        break;
      case 'redo':
        if (this.userCanEdit()) {
          const base64 = this.ggbApplet.getBase64();

          this.sendEvent({ eventType: 'REDO', base64 });
        } else {
          this.resetting = true;
          this.ggbApplet.undo();
          this.setState({ showControlWarning: true });
        }
        break;
      case 'select':
        if (this.ggbApplet.getMode() === 0) {
          if (referencing) {
            return;
          }

          const selection = this.ggbApplet.getObjectType(event[1]);
          const valueString = this.ggbApplet.getValueString(event[1]);

          this.objectSelected = {
            objectType: selection,
            valueString,
            label: event[1],
          };

          if (selection === 'textfield') {
            // e.g. InputBox(alpha)
            const commandString = this.ggbApplet.getCommandString(event[1]);
            const linkedObject = commandString.slice(
              commandString.indexOf('(') + 1,
              commandString.lastIndexOf(')')
            );
            this.objectSelected.linkedObject = linkedObject;
            this.objectSelected.valueString = this.ggbApplet.getValueString(
              linkedObject
            );
          }

          if (this.outgoingEventQueue.length > 0) {
            this.sendEventBuffer({
              xml: null,
              objType: selection,
              label: event[1],
              eventType: 'SELECT',
            });
          } else {
            this.sendEvent({
              xml: null,
              objType: selection,
              label: event[1],
              eventType: 'SELECT',
            });
          }
        }
        break;
      case 'openMenu':
        if (!this.userCanEdit()) {
          this.setState({ showControlWarning: true });
        }
        break;
      case 'perspectiveChange':
        // console.log(
        //   'Perspective change... Can edit?: ',
        //   this.userCanEdit(),
        //   ' can change: ',
        //   canChangePerspective
        // );
        if (this.userCanEdit()) {
          this.parseVisibleViews()
            .then((visibleViews) => {
              const oldViews = [...this.visibleViews];
              const newViews = visibleViews;
              this.visibleViews = newViews;
              const base64 = this.ggbApplet.getBase64();
              this.sendEventBuffer({
                base64,
                eventType: 'CHANGE_PERSPECTIVE',
                oldViews,
                newViews,
              });
            })
            .catch((err) => {
              console.log('parse visible views err: ', err);
            });
        } else if (!canChangePerspective) {
          this.setState({ showControlWarning: true });
        }

        break;
      case 'updateStyle': {
        if (this.userCanEdit()) {
          const label = event[1];
          const xml = this.ggbApplet.getXML(label);
          const objType = this.ggbApplet.getObjectType(label);

          this.sendEventBuffer({
            xml,
            label,
            objType,
            eventType: 'UPDATE_STYLE',
          });
        } else {
          this.setState({ showControlWarning: true });
        }
        break;
      }
      case 'renameComplete': {
        if (this.renamedDetails) {
          const [oldLabel, newLabel] = this.renamedDetails;

          if (oldLabel === this.cornerLabel) {
            // update the new name of the cornerZoomAnchor point
            // but do not emit renaming event
            // if user for some reason renamed
            // one of their points cornerZoomAnchor
            this.cornerLabel = newLabel;
            this.renamedDetails = null;
            return;
          }

          if (this.doIgnoreRename) {
            return;
          }

          if (!this.userCanEdit()) {
            this.setState({ showControlWarning: true });
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
        const selectedShape = this.objectSelected || {};
        this.sendEventBuffer({
          xml,
          label: selectedShape.label,
          eventType: 'DRAG',
          objType: this.ggbApplet.getObjectType(selectedShape.label),
        });
        break;
      }

      case 'dragEnd': {
        if (this.isDraggingPoint) {
          this.isDraggingPoint = false;
        }
        break;
      }
      case 'mouseDown': {
        const { x, y, hits, viewNo } = event;

        this.mouseDownCoords = [x, y];

        if (referencing && Array.isArray(hits) && hits.length > 0) {
          // take the first hit and use that as referenced object
          if (viewNo === 512) {
            // eslint-disable-next-line no-alert
            window.alert('3D Graph Referencing is currently not supported');
            return;
          }
          this.handleReference(event.hits[0], viewNo);
        }
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
      this.ggbApplet.getMode() === 40 ||
      this.doIgnoreAdd
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
    if (this.receivingData && !this.updatingOn) {
      return;
    }
    if (this.resetting) {
      this.resetting = false;
      return;
    }

    if (this.doIgnoreRemove) {
      return;
    }

    if (label === this.cornerLabel && this.isAutoRemovingCornerAnchor) {
      this.isAutoRemovingCornerAnchor = false;
      return;
    }

    if (!this.userCanEdit()) {
      this.setState({ showControlWarning: true });
      return;
    }
    if (!this.receivingData) {
      this.previousCommandString = null;

      const data = { label, eventType: 'REMOVE' };

      const selectedObject = this.objectSelected || {};
      const { label: selectedLabel, objectType } = selectedObject;
      if (selectedLabel === label) {
        data.objType = objectType;
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
      return;
    }

    if (!this.userCanEdit()) {
      return;
    }
    const selectedObject = this.objectSelected || {};
    const {
      label: selectedLabel,
      objectType: selectedType,
      valueString: selectedValueString,
    } = selectedObject;

    if (label === selectedLabel) {
      if (selectedType === 'point') {
        // check if is drag event
        let doSendDragEvent = false;
        if (this.isDraggingPoint) {
          doSendDragEvent = true;
        } else {
          const valueString = this.ggbApplet.getValueString(label);

          if (valueString !== selectedValueString) {
            doSendDragEvent = true;
            this.isDraggingPoint = true;
          }
        }
        // update
        if (doSendDragEvent) {
          const xml = this.ggbApplet.getXML(label);
          this.sendEventBuffer({
            xml,
            label,
            objType: 'point',
            eventType: 'DRAG',
          });
        }
      } else if (selectedType === 'numeric') {
        // check if is drag event
        let doSendDragEvent = false;
        if (this.isDraggingNumeric) {
          doSendDragEvent = true;
        } else {
          const valueString = this.ggbApplet.getValueString(label);

          if (valueString !== selectedValueString) {
            doSendDragEvent = true;
            this.isDraggingNumeric = true;
          }
        }
        // update
        if (doSendDragEvent) {
          const xml = this.ggbApplet.getXML(label);
          this.sendEventBuffer({
            xml,
            label,
            objType: 'numeric',
            eventType: 'DRAG',
          });
        }
      } else if (selectedType === 'boolean') {
        const valueString = this.ggbApplet.getValueString(label);

        if (valueString !== selectedValueString) {
          // value changed
          const caption = this.ggbApplet.getCaption(label);

          if (this.outgoingEventQueue.length > 0) {
            this.sendEventBuffer({
              label,
              objType: 'boolean',
              valueString,
              eventType: 'TOGGLE',
              caption,
            });
          } else {
            this.sendEvent({
              label,
              objType: 'boolean',
              valueString,
              eventType: 'TOGGLE',
              caption,
            });
          }
        }
      }
    } else if (selectedObject.linkedObject === label) {
      if (selectedType === 'textfield') {
        const valueString = this.ggbApplet.getValueString(
          selectedObject.linkedObject
        );

        if (valueString !== selectedValueString) {
          // value changed
          const caption = this.ggbApplet.getCaption(label);
          if (this.outgoingEventQueue.length > 0) {
            this.sendEventBuffer({
              label: selectedObject.label,
              objType: 'textfield',
              valueString,
              eventType: 'UPDATE_TEXT_FIELD',
              caption,
              originalValueString: selectedValueString,
            });
          } else {
            this.sendEvent({
              label: selectedObject.label,
              objType: 'textfield',
              valueString,
              eventType: 'UPDATE_TEXT_FIELD',
              caption,
              originalValueString: selectedValueString,
            });
          }
        }
      }
    }
  };

  clearListener = (element) => {
    console.log({ clearListener: element });
  };

  zoomListener = async () => {
    const { referencing, showingReference, referToEl } = this.props;
    if ((referencing && referToEl) || showingReference) {
      this.getInnerGraphCoords();
      if (referToEl.elementType !== 'chat_message') {
        this.updateReferToEl(referToEl);
      }
    }
  };

  renameListener = (oldLabel, newLabel) => {
    if (this.doIgnoreRename) {
      return;
    }
    this.renamedDetails = [oldLabel, newLabel];
  };

  /**
   * @method registerListeners
   *  rs - register the even listeners with geogebra
   */

  registerListeners = () => {
    this.ggbApplet.unregisterClientListener(this.clientListener);
    this.ggbApplet.unregisterAddListener(this.addListener);
    // this.ggbApplet.unregisterClickListener(this.clickListener);
    this.ggbApplet.unregisterUpdateListener(this.updateListener);
    this.ggbApplet.unregisterRemoveListener(this.RemoveListener);
    this.ggbApplet.unregisterClearListener(this.clearListener);
    this.ggbApplet.unregisterRenameListener(this.renameListener);

    if (this.zoomObj) {
      this.ggbApplet.unregisterObjectUpdateListener(this.zoomObj);
    }

    // Set corner object to listen for zooming/moving of graph

    const cornerLabel = 'cornerZoomAnchor';
    this.cornerLabel = cornerLabel;

    const hasAnchor = this.ggbApplet.exists(cornerLabel);
    if (hasAnchor) {
      this.removeGgbObjectSilent(cornerLabel);
    }

    this.zoomObj = this.ggbApplet.evalCommandGetLabels('Corner(1)');
    this.ggbApplet.setAuxiliary(this.zoomObj, true);
    this.ggbApplet.registerObjectUpdateListener(
      this.zoomObj,
      this.throttledZoomListener
    );

    this.renameGgbObjectSilent(this.zoomObj, cornerLabel);

    this.ggbApplet.registerClientListener(this.clientListener);
    this.ggbApplet.registerAddListener(this.addListener);
    // this.ggbApplet.registerClickListener(this.clickListener);
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
    if (!event) {
      return;
    }

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
    if (!event || (Array.isArray(event) && event.length === 0)) {
      return;
    }

    if (!this.userCanEdit()) {
      return;
    }

    const { emitEvent } = this.props;
    const eventData = {
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
    // addToLog(eventData); // emitEvent already adds to the log

    if (this.updatingTab) {
      clearTimeout(this.updatingTab);
      this.updatingTab = null;
    }

    emitEvent(eventData);

    this.updatingTab = setTimeout(
      this.updateConstructionState.bind(this, event),
      1500
    );
    this.checkForUpdatedReferences(eventData);

    this.timer = null;
    this.movingGeos = false;
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
      // some tools are not listed in the ggbTools file
      // such as switching to CAS mode
      const tool = ggbTools[label];
      const toolName = tool ? tool.name.toLowerCase() : 'unknown tool';

      description += `selected the ${toolName} tool`;
    } else if (eventType === 'SELECT') {
      description += `selected ${objType} ${label}`;
    } else if (eventType === 'REMOVE') {
      description += `removed ${objType} ${label}`;
    } else if (eventType === 'RENAME') {
      description += `renamed ${objType} ${oldLabel} to ${label}`;
      this.renamedDetails = null;
    } else if (eventType === 'REDEFINE') {
      description += `redefined ${objType} ${label}`;
    } else if (eventType === 'UNDO') {
      // not sure if we can give more information
      description += 'performed an undo';
    } else if (eventType === 'REDO') {
      description += 'performed a redo';
    } else if (eventType === 'CHANGE_PERSPECTIVE') {
      description += 'changed perspectives';
    } else if (eventType === 'TOGGLE') {
      const { caption, valueString } = event;
      const descriptor = caption || `boolean ${label}`;
      let oldValue;
      let newValue;
      if (valueString.indexOf('true') !== -1) {
        // toggled on
        oldValue = 'false';
        newValue = 'true';
      } else if (valueString.indexOf('false') !== -1) {
        // toggled off
        oldValue = 'true';
        newValue = 'false';
      }
      description += `toggled the value for ${descriptor}`;

      if (oldValue && newValue) {
        description += ` from ${oldValue} to ${newValue}`;
      }
    } else if (eventType === 'UPDATE_TEXT_FIELD') {
      const { caption } = event;
      const descriptor = caption || `text field ${label}`;

      description += `changed the value of ${descriptor}`;
    }
    return description;
  };

  updateConstructionState = () => {
    const { tab } = this.props;
    if (this.ggbApplet) {
      // const currentState = this.ggbApplet.getXML();
      this.getBase64Async()
        .then((base64) => {
          const { _id } = tab;
          API.put('tabs', _id, { currentStateBase64: base64 });
        })
        .then(() => {})
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
        });
    }
  };

  getReferenceCoords = (
    element,
    elementType,
    pathParameter,
    x,
    y,
    refType,
    viewNum
  ) => {
    let position;

    if (isFinite(pathParameter)) {
      const coords = this.getCoordsFromPathParameter(element, pathParameter);

      position = this.getRelativeCoords(coords, viewNum);
      return {
        renamedElementType: elementType,
        position,
      };
    }

    if (refType === 'region') {
      if (isFinite(x) && isFinite(y)) {
        const refCoords = this.getRegionCoords(element, x, y);
        position = this.getRelativeCoords(refCoords, viewNum);
        return {
          renamedElementType: elementType,
          position,
        };
      }
    }

    let renamedElementType = elementType;
    // find center point of circle
    if (elementType === 'circle') {
      const commandString = this.ggbApplet.getCommandString(element);
      const point = commandString.slice(
        commandString.indexOf('(') + 1,
        commandString.indexOf(',')
      );

      position = this.getRelativeCoords(point, viewNum);

      return position ? { renamedElementType, position } : null;
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
      const coordsArr = pointsOfShape.map((point) =>
        this.getRelativeCoords(point, viewNum)
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
      return position ? { renamedElementType, position } : null;
    }
    // regular point
    position = this.getRelativeCoords(element, viewNum);
    return position ? { renamedElementType, position } : null;
  };

  /**
   * @method getRelativeCoords - converts x,y coordinates of ggb point and converts them to the pizel location on the screen
   * @param  {String} element - ggb defined Label. MUST be a point
   * @return {Object} - { left, top} or null if invalid point passed in
   */
  getRelativeCoords = (element, viewNum) => {
    let elX;
    let elY;

    if (Array.isArray(element) && element.length >= 2) {
      [elX, elY] = element;
      if (!isFinite(elX) || !isFinite(elY)) {
        return null;
      }
    } else {
      try {
        elX = this.ggbApplet.getXcoord(element);
        elY = this.ggbApplet.getYcoord(element);
      } catch (err) {
        // this will happen if we pass something other than a point
        return null;
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
    const ggbViewProps = JSON.parse(
      this.ggbApplet.getViewProperties(viewNum || 1)
    );
    const { height, xMin, yMin, invXscale, left } = ggbViewProps;
    let { invYscale } = ggbViewProps;

    if (!invYscale) {
      invYscale = invXscale;
    }

    const scale = 1 / invXscale;
    const yscale = 1 / invYscale;
    const yMax = yMin + height * invYscale;

    const xZero = -1 * xMin * (1 / invXscale);
    const yZero = Math.abs(yMax) * (1 / invYscale);

    if (!invYscale) invYscale = invXscale;
    const xOffset = left - ggbCoords.left + parseInt(xZero, 10) + elX * scale;

    let yOffset =
      ggbCoords.height - height + parseInt(yZero, 10) - elY * yscale;
    if (bottomMenuHeight) {
      yOffset -= bottomMenuHeight;
    }
    return { left: xOffset, top: yOffset };
  };

  getInnerGraphCoords = () => {
    const { setGraphCoords } = this.props;
    const graphSelector = '.gwt-SplitLayoutPanel';
    const graphEl = document.querySelector(graphSelector);

    // will not always necessarily be a graph
    // for example if the probability calculator is on
    if (!graphEl) {
      console.warn('Graph element not found');
      return false;
    }

    // Ensure the element has been rendered and has dimensions
    const innerGraphCoords = graphEl.getBoundingClientRect();
    if (innerGraphCoords.width === 0 || innerGraphCoords.height === 0) {
      console.warn('Graph element has zero dimensions');
      return false;
    }

    const topBar = document.getElementsByClassName('ggbtoolbarpanel')[0];
    let topBarHeight = 0;
    if (topBar) {
      const topBarRect = topBar.getBoundingClientRect();
      if (topBarRect.height === 0) {
        console.warn('Toolbar has zero height');
        return false;
      }
      topBarHeight = topBarRect.height;
    }

    setGraphCoords({
      left: innerGraphCoords.left - 17,
      right: innerGraphCoords.right - 17,
      height: innerGraphCoords.height + topBarHeight,
      top: topBarHeight,
    });

    return true;
  };

  parseXML = (xml) => {
    return new Promise((resolve, reject) => {
      parseString(xml, (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      });
    });
  };

  updateReferToEl = (referToElDetails) => {
    const { setToElAndCoords } = this.props;

    const {
      element,
      elementType,
      pathParameter,
      x,
      y,
      isForRegion,
      viewNum,
    } = referToElDetails;

    const doesExist = this.ggbApplet.exists(element);

    if (!doesExist) {
      // should only happen if something went wrong in terms of updating the construction
      // should we also check the elementType?
      const msg = `The referenced object (${elementType} ${element}) no longer exists.`;

      // eslint-disable-next-line no-alert
      window.alert(msg);
      return;
    }
    // old references will not have the viewNum prop
    // 1 is the normal default view when only having 1 graph
    const isViewVisible = this.isReferenceViewVisible(viewNum || 1);

    if (!isViewVisible) {
      const msg = `The containing view for object (${elementType} ${element}) is not currently visible.`;

      // eslint-disable-next-line no-alert
      window.alert(msg);
      return;
    }

    const refType = isForRegion ? 'region' : 'path';

    const { position } = this.getReferenceCoords(
      element,
      elementType,
      pathParameter,
      x,
      y,
      refType,
      viewNum
    );
    setToElAndCoords(referToElDetails, position);
  };

  checkForUpdatedReferences = (event) => {
    const { eventsWithRefs, updateEventsWithReferences, room } = this.props;

    const { ggbEvent, tab, eventArray } = event;
    const events =
      Array.isArray(eventArray) && eventArray.length > 0
        ? eventArray
        : [ggbEvent];

    const { eventType } = events[0];

    const mutateEvents = ['DRAG', 'REMOVE', 'RENAME', 'UPDATE_STYLE'];

    if (mutateEvents.includes(eventType)) {
      const base = eventType === 'DRAG' ? [events[0]] : events;
      const labels = [...base].reduce((results, ev) => {
        if (typeof ev.label === 'string') {
          if (eventType === 'RENAME') {
            results.push([ev.oldLabel, ev.label]);
          } else {
            results.push(ev.label);
          }
        }
        return results;
      }, []);

      if (labels.length === 0) {
        return;
      }
      let doEmit = false;

      const updatedEvents = [...eventsWithRefs].map((ev) => {
        const { reference } = ev;

        if (reference.tab !== tab) {
          return ev;
        }

        if (eventType === 'RENAME') {
          const match = find(labels, (tuple) => {
            return tuple[0] === reference.element;
          });

          if (match) {
            [, ev.reference.element] = match;
            ev.reference.wasObjectUpdated = true;
            doEmit = true;
          }
          return ev;
        }
        const propToCheck =
          eventType === 'REMOVE' ? 'wasObjectDeleted' : 'wasObjectUpdated';

        if (!reference[propToCheck] && labels.indexOf(reference.element) >= 0) {
          reference[propToCheck] = true;
          doEmit = true;
        }
        return ev;
      });

      if (doEmit) {
        socket.emit('UPDATED_REFERENCES', { roomId: room._id, updatedEvents });

        updateEventsWithReferences(updatedEvents);
      }
    }
  };

  isPointInRegion = (point, region) => {
    if (!this.ggbApplet) {
      return false;
    }

    this.doIgnoreAdd = true;

    const booleanObj = this.ggbApplet.evalCommandGetLabels(
      `IsInRegion(${point}, ${region})`
    );
    this.doIgnoreAdd = false;

    this.ggbApplet.setAuxiliary(booleanObj, true);

    const isInRegion = this.ggbApplet.getValue(booleanObj);

    this.removeGgbObjectSilent(booleanObj);
    return isInRegion;
  };

  getCoordsOfArbitraryPointInRegion = (region) => {
    if (!this.ggbApplet) {
      return [];
    }
    const point = this.ggbApplet.evalCommandGetLabels(`PointIn(${region})`);

    const coords = this.getGgbPointCoords();

    this.removeGgbObjectSilent(point);

    return coords;
  };

  getGgbPointCoords = (point) => {
    try {
      const x = this.ggbApplet.getXcoord(point);
      const y = this.ggbApplet.getYcoord(point);
      const z = this.ggbApplet.getZcoord(point);

      return [x, y, z];
    } catch (err) {
      console.log('getGgbPointCoords err: ', err);
      return [];
    }
  };

  removeGgbObjectSilent = (label) => {
    if (!this.ggbApplet) {
      return;
    }

    this.doIgnoreRemove = true;
    this.ggbApplet.deleteObject(label);
    this.doIgnoreRemove = false;
  };
  getRegionCoords = (region, x, y) => {
    if (!this.ggbApplet) {
      return [];
    }

    this.doIgnoreAdd = true;
    const refPoint = this.ggbApplet.evalCommandGetLabels(`PointIn(${region})`);
    this.doIgnoreAdd = false;

    this.ggbApplet.setAuxiliary(refPoint, true);
    this.ggbApplet.setCoords(refPoint, x, y);

    const refCoords = this.getGgbPointCoords(refPoint);

    this.removeGgbObjectSilent(refPoint);
    return refCoords;
  };

  getPathCoordsAndParam = (element, clickCoords) => {
    if (!this.ggbApplet) {
      return [];
    }

    const [x, y] = clickCoords;

    this.doIgnoreAdd = true;
    const refPoint = this.ggbApplet.evalCommandGetLabels(`Point(${element})`);
    this.doIgnoreAdd = false;

    this.ggbApplet.setAuxiliary(refPoint, true);
    this.ggbApplet.setCoords(refPoint, x, y);

    const refCoords = this.getGgbPointCoords(refPoint);

    this.doIgnoreAdd = true;
    const parameterObj = this.ggbApplet.evalCommandGetLabels(
      `PathParameter(${refPoint})`
    );
    this.doIgnoreAdd = false;

    this.ggbApplet.setAuxiliary(parameterObj, true);
    const pathParameter = this.ggbApplet.getValue(parameterObj);

    this.removeGgbObjectSilent(parameterObj);

    this.removeGgbObjectSilent(refPoint);
    return [refCoords, pathParameter];
  };

  setGgbBase64 = (base64) => {
    if (!this.ggbApplet || !typeof base64 === 'string') {
      return;
    }
    this.ggbApplet.setBase64(base64, () => {
      // always need to reregister listeners after setting base64
      this.registerListeners();
    });
  };

  setGgbState = (tab) => {
    // eslint-disable-next-line consistent-return
    return new Promise((resolve) => {
      const {
        currentState,
        ggbFile,
        startingPoint,
        currentStateBase64,
        startingPointBase64,
      } = tab;

      if (currentStateBase64) {
        if (this.isInitialGgbFileLoaded(tab._id)) {
          // call to resync was triggered by setBase64 invoking initializeGgb
          return resolve(true);
        }

        this.tabFileLoadedHash[tab._id] = true;
        this.ggbApplet.setBase64(currentStateBase64, () => {
          resolve(true);
        });
      } else if (currentState) {
        this.ggbApplet.setXML(currentState);
        resolve(true);
      } else if (startingPointBase64) {
        if (this.isInitialGgbFileLoaded(tab._id)) {
          // call to resync was triggered by setBase64 invoking initializeGgb
          return resolve(true);
        }

        this.tabFileLoadedHash[tab._id] = true;
        this.ggbApplet.setBase64(startingPointBase64, () => {
          resolve(true);
        });
      } else if (startingPoint) {
        this.ggbApplet.setXML(startingPoint);
        resolve(true);
      } else if (ggbFile && !this.tabFileLoadedHash[tab._id]) {
        this.tabFileLoadedHash[tab._id] = true;
        this.ggbApplet.setBase64(ggbFile, () => {
          resolve(true);
        });
      } else {
        resolve(true);
      }
    });
  };

  renameGgbObjectSilent = (oldLabel, newLabel) => {
    if (!this.ggbApplet) {
      return;
    }

    this.doIgnoreRename = true;
    this.ggbApplet.renameObject(oldLabel, newLabel);
    this.doIgnoreRename = false;
  };

  isInitialGgbFileLoaded = (tabId) => {
    return this.tabFileLoadedHash[tabId];
  };

  getDefaultGgbMode = async () => {
    try {
      const { inControl } = this.props;
      const visibleViews = await this.parseVisibleViews();
      this.visibleViews = visibleViews;
      const defaultViewId = this.getDefaultActiveViewId(visibleViews);

      if (defaultViewId === null) {
        // no visible views.. should this ever happen?
        return 0;
      }

      if (inControl === 'ME') {
        const { referencing } = this.props;

        if (referencing) {
          return GgbViewIdToPerspectiveMap[defaultViewId].defaultTool;
        }
        return GgbViewIdToPerspectiveMap[defaultViewId].controlTool;
      }
      // not in control
      return GgbViewIdToPerspectiveMap[defaultViewId].defaultTool;
    } catch (err) {
      console.log('error get default ggbMode:', err);
      return 0;
    }
  };

  setDefaultGgbMode = () => {
    return this.getDefaultGgbMode().then((mode) => {
      this.ggbApplet.setMode(mode);
    });
  };

  parseVisibleViews = () => {
    const perspectiveXML = this.ggbApplet.getPerspectiveXML();
    return this.parseXML(perspectiveXML)
      .then((parsedPerspectiveXML) => {
        const { view: views } = parsedPerspectiveXML.perspective.views[0];
        const visibleViews = views.filter((view) => view.$.visible === 'true');
        return visibleViews;
      })
      .catch((err) => {
        console.log(`Error parsing views: ${err}`);
        throw err;
      });
  };

  getDefaultActiveViewId = (visibleViews) => {
    if (!Array.isArray(visibleViews) || visibleViews.length === 0) {
      return null;
    }

    if (visibleViews.length === 1) {
      return visibleViews[0].$.id;
    }

    const viewHash = {};

    for (let i = 0; i < visibleViews.length; i++) {
      const { id } = visibleViews[i].$;
      const isCas = id === '8';
      if (isCas) {
        return id;
      }
      viewHash[id] = true;
    }

    // spreadsheet view takes next precedence
    const spreadsheetId = '4';

    if (viewHash[spreadsheetId]) {
      return spreadsheetId;
    }
    // next precedence is graphing (G or D)

    if (viewHash['1']) {
      return '1';
    }

    if (viewHash['16']) {
      return '16';
    }

    // next 3d graph
    if (viewHash['512']) {
      return '512';
    }

    // next probability
    if (viewHash['64']) {
      return '64';
    }

    // remaining views do not actually have modes to set so does not matter
    return Object.keys(viewHash)[0].$.id;
  };

  isReferenceViewVisible = (viewNum) => {
    const id = refViewToIdMap[viewNum];
    const view = find(this.visibleViews, (v) => {
      return v.$.id === id;
    });
    return view !== undefined;
  };

  handleReference = (element, viewNum) => {
    const { setToElAndCoords, clearReference, showingReference } = this.props;

    const elementType = this.ggbApplet.getObjectType(element);
    let refCoords;
    let pathParameter;
    let x;
    let y;
    let refType = 'point';

    let renamedElementType;
    let position;

    if (elementType !== 'point' && Array.isArray(this.mouseDownCoords)) {
      [x, y] = this.mouseDownCoords;
      if (isFinite(x) && isFinite(y)) {
        const pointInTypes = [
          'polygon',
          'triangle',
          'quadrilateral',
          'pentagon',
          'hexagon',
        ];

        if (pointInTypes.includes(elementType)) {
          refType = 'region';
          refCoords = this.getRegionCoords(element, x, y);
        } else {
          refType = 'path';
          [refCoords, pathParameter] = this.getPathCoordsAndParam(element, [
            x,
            y,
          ]);
        }
      }
      position = this.getRelativeCoords(refCoords, viewNum);
      renamedElementType = elementType;
    } else {
      ({ renamedElementType, position } = this.getReferenceCoords(
        element,
        elementType,
        pathParameter,
        x,
        y,
        refType,
        viewNum
      ));
    }
    if (showingReference) {
      clearReference({ doKeepReferencingOn: true });
    }
    setToElAndCoords(
      {
        element,
        elementType: renamedElementType,
        pathParameter,
        x,
        y,
        isForRegion: refType === 'region',
        viewNum,
      },
      position
    );
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

  hideShowRightButtonPanel = (val) => {
    const rightButtonPanels = document.querySelectorAll('.rightButtonPanel');

    if (rightButtonPanels) {
      const displayValue = val === 1 ? 'block' : 'none';
      rightButtonPanels.forEach((node) => {
        node.style.display = displayValue;
      });
    }
  };

  handleUpdate(data) {
    const { currentTabId, addNtfToTabs, tab } = this.props;

    if (!this.isWindowVisible) {
      this.isFaviconNtf = true;
      this.changeFavicon('/favNtf.ico');
    }
    // If the event is for this room tab (i.e., not browser tab) but this tab is not in view,
    // add a notification to this tab
    if (currentTabId !== data.tab) {
      addNtfToTabs(data.tab);
    }
    // // If this event is for this tab add it to the log
    if (data.tab === tab._id) {
      //   // If we're still processing data from the last event
      //   // save this event in a queue...then when processing is done we'll pull
      //   // from this queue in clearSocketQueue()
      if (this.receivingData || this.batchUpdating) {
        this.incomingEventQueue.push(data);
        return;
      }
      this.receivingData = true;
      this.constructEvent(data);
    }
  }

  render() {
    const { tab, toggleControl, inControl, user } = this.props;
    const { showControlWarning, redo } = this.state;
    return (
      <Fragment>
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
          toggleControlWarning={async () => {
            if (redo) {
              this.ggbApplet.redo();
            } else {
              this.ggbApplet.undo();
            }
            await this.setDefaultGgbMode();
            this.setState({ showControlWarning: false, redo: false });
          }}
          takeControl={async () => {
            this.setState({ showControlWarning: false, redo: false });
            if (inControl !== 'NONE') {
              await this.setDefaultGgbMode();
            }
            toggleControl();
          }}
          inControl={inControl}
          cancel={async () => {
            this.setState({ showControlWarning: false, redo: false });
            await this.setDefaultGgbMode();
            this.resyncGgbState();
          }}
          inAdminMode={user.inAdminMode}
        />
      </Fragment>
    );
  }
}
GgbGraph.defaultProps = {
  referToEl: {},
};
GgbGraph.propTypes = {
  room: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    log: PropTypes.arrayOf(PropTypes.shape({})),
    controlledBy: PropTypes.string,
  }).isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    connected: PropTypes.bool.isRequired,
  }).isRequired,
  tab: PropTypes.shape({}).isRequired,
  addToLog: PropTypes.func.isRequired,
  toggleControl: PropTypes.func.isRequired,
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
  log: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  eventsWithRefs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  updateEventsWithReferences: PropTypes.func.isRequired,
  emitEvent: PropTypes.func.isRequired,
};

export default GgbGraph;
