import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Script from 'react-load-script';
import classes from '../Workspace/graph.css';

import { getEventXml } from './SharedReplayer.utils';
import { isNonEmptyArray } from '../../utils/objects';

class GgbReplayer extends Component {
  graph = React.createRef();
  isFileSet = false; // calling ggb.setBase64 triggers this.initializeGgb(), because we set base 64 inside initializeGgb we use this instance var to track whether we've already set the file. When the ggb tries to load the file twice it breaks everything

  elementXmlBeforeRemovalHash = {};

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions);
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   if (this.props.inView) {
  //     return this.props.index !== nextProps.index;
  //   } else return false;
  // }

  componentDidUpdate(prevProps) {
    const { inView, log, index, changingIndex, isFullscreen } = this.props;
    if (!prevProps.inView && inView) {
      this.updateDimensions();
    }
    if (inView) {
      if (changingIndex && prevProps.index !== index) {
        this.applyMultipleEvents(prevProps.index, index);
      } else if (
        prevProps.index !== index &&
        (getEventXml(log[index]) || log[index].eventArray)
      ) {
        // check if the tab has changed
        this.constructEvent(log[index]);
      }

      // IF we're skipping it means we might need to reconstruct several evenets, possible in reverse order if the prevIndex is greater than this index.
      // This is a god damned mess...good luck
    }
    if (prevProps.isFullscreen && !isFullscreen) {
      this.updateDimensions();
    }
    // else if (!this.state.loading || this.state.tabStates !== prevState.tabStates){
    //   console.log('the tabState have changed')
    //   this.constructEvent(log[index])
    // }
    if (this.ggbApplet && prevProps.log !== log) {
      this.onScriptLoad();
    }
  }

  componentWillUnmount() {
    const { tabId } = this.props;
    window.removeEventListener('resize', this.updateDimensions);
    delete window[`ggbApplet${tabId}A`];
  }

  // We should periodically save the entire state so if we skip to the very end we don't have to apply each event one at a time

  constructEvent = (data) => {
    const { ggbEvent, eventArray } = data;
    if (eventArray && eventArray.length > 0) {
      this.recursiveUpdateNew(eventArray);
    } else if (ggbEvent) {
      this.writeGgbEventToGraph(ggbEvent);
    }
    // return;
    // switch (eventType) {
    //   case 'ADD':
    //     if (data.undoRemove) {
    //       if (data.undoXML) {
    //         this.ggbApplet.evalXML(data.undoXML);
    //         this.ggbApplet.evalCommand('UpdateConstruction()');
    //       }
    //       if (data.undoArray) {
    //         this.recursiveUpdate(data.undoArray, true);
    //       }
    //     } else if (data.definition) {
    //       this.ggbApplet.evalCommand(`${data.label}:${data.definition}`);
    //     } else if (data.ggbEvent && data.ggbEvent.commandString) {
    //       // not sure if this is correct...
    //       this.ggbApplet.evalCommand(data.ggbEvent.commandString);
    //     }
    //     this.ggbApplet.evalXML(getEventXml(data));
    //     this.ggbApplet.evalCommand('UpdateConstruction()');
    //     break;
    //   case 'REMOVE':
    //     if (data.eventArray && data.eventArray.length > 1) {
    //       data.eventArray.forEach((labelOrGgbEvent) => {
    //         if (typeof labelOrGgbEvent === 'string') {
    //           this.ggbApplet.deleteObject(labelOrGgbEvent);
    //         } else {
    //           this.ggbApplet.deleteObject(labelOrGgbEvent.label);
    //         }
    //       });
    //     } else {
    //       this.ggbApplet.deleteObject(getEventLabel(data));
    //     }
    //     break;
    //   case 'UPDATE':
    //     this.ggbApplet.evalXML(getEventXml(data));
    //     this.ggbApplet.evalCommand('UpdateConstruction()');
    //     break;
    //   case 'CHANGE_PERSPECTIVE':
    //     this.ggbApplet.setPerspective(getEventXml(data));
    //     this.ggbApplet.showAlgebraInput(true);
    //     // this.ggbApplet.evalXML(data.event);
    //     // this.ggbApplet.evalCommand("UpdateConstruction()");
    //     break;
    //   case 'BATCH_UPDATE':
    //     // make a copy because we're going to mutate the array so we
    //     // know when to stop the recursive process
    //     this.recursiveUpdate([...data.eventArray], false);
    //     break;
    //   case 'BATCH_ADD':
    //     if (data.definition) {
    //       // this.ggbApplet.evalCommand(data.event);
    //       this.recursiveUpdate(data.eventArray, true);
    //     } else if (data.ggbEvent && data.ggbEvent.commandString) {
    //       this.recursiveUpdate(data.eventArray, true);
    //     }
    //     break;
    //   case 'BATCH_REMOVE':
    //     data.eventArray.forEach((labelOrGgbEvent) => {
    //       if (typeof labelOrGgbEvent === 'string') {
    //         this.ggbApplet.deleteObject(labelOrGgbEvent);
    //       } else {
    //         this.ggbApplet.deleteObject(labelOrGgbEvent.label);
    //       }
    //     });
    //     break;
    //   case 'UPDATE_STYLE': {
    //     if (data.eventArray) {
    //       this.recursiveUpdate(data.eventArray);
    //     }
    //     break;
    //   }
    //   default:
    //     break;
    // }
  };

  onScriptLoad = () => {
    const { tab, tabId } = this.props;
    const parameters = {
      id: `ggbApplet${tabId}A`, // THE 'A' here is because ggb doesn't like us ending Id name with a number
      // "width": 1300 * .75, // 75% width of container
      // "height": GRAPH_HEIGHT,
      // "scaleContainerClass": "graph",
      showToolBar: false,
      showMenuBar: false,
      showAlgebraInput: true,
      language: 'en',
      useBrowserForJS: true,
      borderColor: '#ddd',
      errorDialogsActive: false,
      preventFocus: true,
      appletOnLoad: this.initializeGgb,
      appName: tab.appName,
    };
    const ggbApp = new window.GGBApplet(parameters, '5.0');
    ggbApp.inject(`ggb-element${tabId}A`);
  };

  initializeGgb = () => {
    const { tabId, tab, setTabLoaded } = this.props;
    this.ggbApplet = window[`ggbApplet${tabId}A`];
    setTabLoaded(tab._id);
    this.ggbApplet.setMode(40); // Sets the tool to zoom
    const { startingPoint, ggbFile } = tab;
    // put the current construction on the graph, disable everything until the user takes control
    // if (perspective) this.ggbApplet.setPerspective(perspective);
    if (startingPoint) {
      this.ggbApplet.setXML(startingPoint);
    } else if (ggbFile && !this.isFileSet) {
      this.isFileSet = true;
      this.ggbApplet.setBase64(ggbFile);
    }
  };

  updateDimensions = () => {
    const { tabId } = this.props;
    // this.resizeTimer = setTimeout(() => {
    if (this.graph.current) {
      const { clientHeight, clientWidth } = this.graph.current.parentElement;
      window[`ggbApplet${tabId}A`].setSize(clientWidth, clientHeight);
    }
  };

  writeGgbEventToGraph = (event) => {
    const { eventType } = event;

    if (eventType === 'REMOVE') {
      const { label } = event;

      if (!event.isUndoAdd) {
        const cachedXmlStack = this.elementXmlBeforeRemovalHash[label];

        if (!Array.isArray(cachedXmlStack)) {
          // no removed items with this label have been cached
          this.elementXmlBeforeRemovalHash[label] = [];

          const elementXml = this.ggbApplet.getXML(label);
          if (elementXml) {
            this.elementXmlBeforeRemovalHash[label].push(elementXml);
          }
        } else {
          const elementXml = this.ggbApplet.getXML(label);
          if (elementXml) {
            this.elementXmlBeforeRemovalHash[label].push(elementXml);
          }
        }
      }
      this.ggbApplet.deleteObject(label);
    } else if (event.isUndoRename) {
      // have to reset the renamed object to old label
      this.ggbApplet.renameObject(event.label, event.oldLabel);
    } else if (event.xml) {
      this.ggbApplet.evalXML(event.xml);
    } else if (eventType === 'ADD' && event.isUndoRemove) {
      const cachedXmlStack = this.elementXmlBeforeRemovalHash[event.label];

      if (isNonEmptyArray(cachedXmlStack)) {
        const cachedXml = this.elementXmlBeforeRemovalHash[event.label].pop();

        if (cachedXml) {
          this.ggbApplet.evalXML(cachedXml);
        }
        console.log('found cachedXml for event: ', 'event', event, cachedXml);
      } else {
        console.log('missing cached xml for ', event);
      }
    } else if (
      event.commandString &&
      event.objType !== 'point' &&
      event.eventType !== 'DRAG'
    ) {
      this.ggbApplet.evalCommand(event.commandString);
      // if (event.valueString) {
      //   this.ggbApplet.evalCommand(event.valueString);
      // }
    } else if (event.commandString) {
      const test = this.ggbApplet.evalCommandGetLabels(event.commandString);
      if (event.label) {
        this.ggbApplet.renameObject(test, event.label);
      }
    }
    this.ggbApplet.evalCommand('UpdateConstruction()');
  };

  /**
   * @method applyMultipleEvents
   * @description Takes two indices from the log and applies (or un-applies if going backwards thru time) all events between
   * @param  {} startIndex
   * @param  {} endIndex
   */

  applyMultipleEvents(startIndex, endIndex) {
    const { log } = this.props;
    // Forwards through time
    if (startIndex < endIndex) {
      // this.ggbApplet.setXML(this.props.log[endIndex].currentState);
      console.log(
        'applying multiple forwards',
        'from ',
        startIndex,
        'to ',
        endIndex
      );

      for (let i = startIndex; i <= endIndex; i++) {
        const syntheticEvent = { ...log[i] };
        // const { eventType } = syntheticEvent;
        // const isNewEvent = typeof eventType !== 'string';

        // if (isNewEvent) {
        const { ggbEvent, eventArray } = syntheticEvent;
        if (eventArray && eventArray.length > 0) {
          this.recursiveUpdateNew(eventArray);
        } else if (ggbEvent) {
          this.writeGgbEventToGraph(ggbEvent);
        } else {
          // console.log('ELSE shouldnt be here: ', syntheticEvent);
        }
        // } else if (
        //   log[i].eventArray &&
        //   log[i].eventArray.length > 0 &&
        //   getEventType(log[i]) === 'BATCH_UPDATE'
        // ) {
        //   const { eventArray } = syntheticEvent;

        //   const xmlOrGgbEvent = eventArray.pop();

        //   setEventXml(syntheticEvent, xmlOrGgbEvent);
        //   setEventType(syntheticEvent, 'UPDATE');

        //   console.log('calling constructEvent from applyMult');
        //   this.constructEvent(syntheticEvent);
        // } else {
        //   console.log('calling constructEvent from applyMult else');
        //   this.constructEvent(log[i]);
        // }
      }
    }

    // backwards through time
    else {
      console.log(
        'applying multiple backwards',
        'from ',
        startIndex,
        'to ',
        endIndex
      );
      for (let i = startIndex; i > endIndex; i--) {
        const syntheticEvent = { ...log[i] };
        // const { eventType } = syntheticEvent;
        // const isNewEvent = typeof eventType !== 'string';

        // if (isNewEvent) {
        const {
          ggbEvent,
          eventArray,
          // undoArray,
          // undoGgbEvent,
        } = syntheticEvent;

        // if (isNonEmptyArray(undoArray)) {
        //   console.log({ undoArray });
        //   this.recursiveUpdateNew([...undoArray]);
        // } else if (undoGgbEvent) {
        //   console.log({ undoGgbEvent });
        //   this.writeGgbEventToGraph(undoGgbEvent);
        // } else

        if (eventArray && eventArray.length > 0) {
          const syntheticEvents = eventArray.map((ev) => {
            const copy = { ...ev };
            const { eventType: evType } = copy;
            if (evType === 'ADD') {
              copy.eventType = 'REMOVE';
              copy.commandString = '';
              copy.xml = '';
              copy.isUndoAdd = true;
            } else if (evType === 'REMOVE') {
              copy.eventType = 'ADD';
              copy.isUndoRemove = true;
              // look for undoXML
            } else if (evType === 'RENAME') {
              copy.isUndoRename = true;
            }
            return copy;
          });
          this.recursiveUpdateNew(syntheticEvents);
        } else if (ggbEvent) {
          const copy = { ...ggbEvent };
          if (copy.eventType === 'ADD') {
            copy.eventType = 'REMOVE';
            copy.xml = '';
            copy.commandString = '';
            copy.isUndoAdd = true;
          } else if (copy.eventType === 'REMOVE') {
            copy.eventType = 'ADD';
            copy.isUndoRemove = true;
          } else if (copy.eventType === 'RENAME') {
            copy.isUndoRename = true;
          }
          this.writeGgbEventToGraph(copy);
        }
        // } else {
        //   if (eventType === 'ADD') {
        //     setEventType(syntheticEvent, 'REMOVE');
        //   } else if (eventType === 'REMOVE') {
        //     syntheticEvent.undoRemove = true;
        //     setEventType(syntheticEvent, 'ADD');
        //   } else if (eventType === 'BATCH_ADD') {
        //     setEventType(syntheticEvent, 'BATCH_REMOVE');
        //   } else if (eventType === 'BATCH_UPDATE') {
        //     const { eventArray } = { ...syntheticEvent };

        //     const xmlOrGgbEvent = eventArray.shift();

        //     setEventXml(syntheticEvent, xmlOrGgbEvent);
        //     setEventType(syntheticEvent, 'UPDATE');
        //   }
        //   this.constructEvent(syntheticEvent);
        // }
      }
    }
  }

  /**
   * @method recursiveUpdate
   * @description takes an array of events and updates the construction in batches
   * used to make drag updates and multipoint shape creation more efficient. See ./docs/Geogebra
   * Note that this is copy-pasted in GgbReplayer for now, consider abstracting
   * @param  {Array} events - array of ggb xml events
   * @param  {Number} batchSize - the batch size, i.e., number of points in the shape
   * @param  {Boolean} adding - true if BATCH_ADD false if BATCH_UPDATE
   */

  recursiveUpdate(events, adding) {
    if (events && events.length > 0) {
      if (adding) {
        for (let i = 0; i < events.length; i++) {
          const ggbEventOrXml = events[i];
          const isXml = typeof ggbEventOrXml === 'string';
          if (isXml) {
            this.ggbApplet.evalCommand(ggbEventOrXml);
          } else {
            this.writeGgbEventToGraph(ggbEventOrXml);
          }
        }
      } else {
        // @todo skip more events depending on playback speed.
        if (events.length > 10) {
          events.splice(0, 2);
        }
        const ggbEventOrXml = events.shift();
        const isXml = typeof ggbEventOrXml === 'string';

        if (isXml) {
          this.ggbApplet.evalXML(ggbEventOrXml);
          this.ggbApplet.evalCommand('UpdateConstruction()');
        } else {
          this.writeGgbEventToGraph(ggbEventOrXml);
        }
        setTimeout(() => {
          this.recursiveUpdate(events, false);
        }, 10);
      }
    }
  }

  recursiveUpdateNew(events) {
    if (Array.isArray(events) && events.length > 0) {
      const copiedEvents = [...events];

      const event = copiedEvents.shift();
      this.writeGgbEventToGraph(event);
      if (copiedEvents.length > 0) {
        // readyToClearSocketQueue = false;
        // By wrapping calls to recursiveUpdate in a setTimeout we end up with behavior that is closer
        // to a natural dragging motion. If we write copy one after the other w/o a timeout
        // the point moves too quickly and looks like its jumping to the final position
        setTimeout(() => this.recursiveUpdateNew(copiedEvents), 0);
      }
    }
    // if (readyToClearSocketQueue) {
    //   this.clearSocketQueue();
    // }
  }
  render() {
    const { tabId } = this.props;
    return (
      <Fragment>
        <Script
          url="https://cdn.geogebra.org/apps/deployggb.js"
          onLoad={this.onScriptLoad}
        />
        <div
          className={classes.Graph}
          id={`ggb-element${tabId}A`}
          ref={this.graph}
        />
      </Fragment>
    );
  }
}

GgbReplayer.propTypes = {
  log: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  changingIndex: PropTypes.bool.isRequired,
  inView: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  isFullscreen: PropTypes.bool.isRequired,
  setTabLoaded: PropTypes.func.isRequired,
  tab: PropTypes.shape({
    appName: PropTypes.string.isRequired,
    _id: PropTypes.string.isRequired,
    startinPoint: PropTypes.string,
    ggbFile: PropTypes.string,
  }).isRequired,
  tabId: PropTypes.number.isRequired,
};

export default GgbReplayer;
