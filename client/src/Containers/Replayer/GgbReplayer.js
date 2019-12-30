/* eslint-disable no-await-in-loop */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Script from 'react-load-script';
import classes from '../Workspace/graph.css';

import { getEventXml } from './SharedReplayer.utils';
import { isNonEmptyArray } from '../../utils/objects';
import { setGgbBase64Async, setCodeBase } from '../Workspace/ggbUtils';

class GgbReplayer extends Component {
  graph = React.createRef();
  isFileSet = false; // calling ggb.setBase64 triggers this.initializeGgb(), because we set base 64 inside initializeGgb we use this instance var to track whether we've already set the file. When the ggb tries to load the file twice it breaks everything

  elementXmlBeforeRemovalHash = {};
  backwardsBase64Hash = {};

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

  constructEvent = async (data) => {
    const { ggbEvent, eventArray } = data;
    if (eventArray && eventArray.length > 0) {
      await this.recursiveUpdateNew(eventArray, data._id);
    } else if (ggbEvent) {
      await this.writeGgbEventToGraph(ggbEvent, data._id);
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
      appName: tab.appName, // doesn't need to be required because ggb default is 'classic'
    };
    const ggbApp = new window.GGBApplet(parameters, '5.0');
    setCodeBase(ggbApp);
    ggbApp.inject(`ggb-element${tabId}A`);
  };

  initializeGgb = () => {
    const { tabId, tab, setTabLoaded } = this.props;
    this.ggbApplet = window[`ggbApplet${tabId}A`];
    setTabLoaded(tab._id);

    if (this.didSetBase64) {
      this.didSetBase64 = false;
      return;
    }
    // do we need to set the mode here?
    // the toolbar is not visible and once we load the starting point or file
    // the tool gets set automatically

    const { startingPoint, ggbFile, startingPointBase64 } = tab;
    // put the current construction on the graph, disable everything until the user takes control
    // if (perspective) this.ggbApplet.setPerspective(perspective);
    if (startingPointBase64) {
      if (this.didSetBase64) {
        this.didSetBase64 = false;
        return;
      }

      this.didSetBase64 = true;
      this.ggbApplet.setBase64(startingPointBase64);
    } else if (startingPoint) {
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

  writeGgbEventToGraph = async (event, eventId) => {
    try {
      // eventId is the Event model id
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
      } else if (event.xml && !event.base64) {
        this.ggbApplet.evalXML(event.xml);
      } else if (eventType === 'ADD' && event.isUndoRemove) {
        const cachedXmlStack = this.elementXmlBeforeRemovalHash[event.label];

        if (isNonEmptyArray(cachedXmlStack)) {
          const cachedXml = this.elementXmlBeforeRemovalHash[event.label].pop();

          if (cachedXml) {
            this.ggbApplet.evalXML(cachedXml);
          }
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
      } else if (event.base64) {
        let base64ToSet;
        if (event.isForBackwards) {
          base64ToSet = this.backwardsBase64Hash[eventId];
          delete this.backwardsBase64Hash[eventId];
        } else {
          base64ToSet = event.base64;
          this.backwardsBase64Hash[eventId] = this.ggbApplet.getBase64();
        }

        if (base64ToSet) {
          this.didSetBase64 = true;
          await setGgbBase64Async(this.ggbApplet, base64ToSet);
        } else {
          return;
        }
      } else if (event.valueString) {
        this.ggbApplet.evalCommand(event.valueString);
      }
      this.ggbApplet.evalCommand('UpdateConstruction()');
    } catch (err) {
      console.log(`Error writing ggb event to graph: `, err);
    }
  };

  /**
   * @method applyMultipleEvents
   * @description Takes two indices from the log and applies (or un-applies if going backwards thru time) all events between
   * @param  {} startIndex
   * @param  {} endIndex
   */

  async applyMultipleEvents(startIndex, endIndex) {
    const { log } = this.props;
    // Forwards through time
    if (startIndex < endIndex) {
      // if we were paused on ix 2 and then click to index 5,
      // we will have already applied the event for ix 2
      for (let i = startIndex + 1; i <= endIndex; i++) {
        const syntheticEvent = { ...log[i] };
        const { ggbEvent, eventArray } = syntheticEvent;
        if (eventArray && eventArray.length > 0) {
          await this.recursiveUpdateNew(eventArray);
        } else if (ggbEvent) {
          await this.writeGgbEventToGraph(ggbEvent, syntheticEvent._id);
        }
      }
    }

    // backwards through time
    else {
      for (let i = startIndex; i > endIndex; i--) {
        const syntheticEvent = { ...log[i] };
        const { ggbEvent, eventArray } = syntheticEvent;
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
            } else if (evType === 'RENAME') {
              copy.isUndoRename = true;
            } else if (copy.base64) {
              copy.isForBackwards = true;
            } else if (evType === 'TOGGLE') {
              let { valueString } = copy;
              if (valueString.indexOf('true') !== -1) {
                valueString = valueString.replace('true', 'false');
              } else if (valueString.indexOf('false') !== -1) {
                valueString = valueString.replace('false', 'true');
              }
            } else if (evType === 'UPDATE_TEXT_FIELD') {
              copy.valueString = copy.originalValueString;
            }
            return copy;
          });
          await this.recursiveUpdateNew(syntheticEvents);
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
          } else if (copy.base64) {
            copy.isForBackwards = true;
          } else if (copy.eventType === 'TOGGLE') {
            let { valueString } = copy;
            if (valueString.indexOf('true') !== -1) {
              valueString = valueString.replace('true', 'false');
            } else if (valueString.indexOf('false') !== -1) {
              valueString = valueString.replace('false', 'true');
            }
          } else if (copy.eventType === 'UPDATE_TEXT_FIELD') {
            copy.valueString = copy.originalValueString;
          }
          await this.writeGgbEventToGraph(copy, syntheticEvent._id);
        }
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

  async recursiveUpdateNew(events, eventId) {
    if (Array.isArray(events) && events.length > 0) {
      const copiedEvents = [...events];

      const event = copiedEvents.shift();
      await this.writeGgbEventToGraph(event, eventId);
      if (copiedEvents.length > 0) {
        // readyToClearSocketQueue = false;
        // By wrapping calls to recursiveUpdate in a setTimeout we end up with behavior that is closer
        // to a natural dragging motion. If we write copy one after the other w/o a timeout
        // the point moves too quickly and looks like its jumping to the final position
        setTimeout(
          async () => this.recursiveUpdateNew(copiedEvents, eventId),
          0
        );
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
    appName: PropTypes.string,
    _id: PropTypes.string.isRequired,
    startingPoint: PropTypes.string,
    ggbFile: PropTypes.string,
  }).isRequired,
  tabId: PropTypes.number.isRequired,
};

export default GgbReplayer;
