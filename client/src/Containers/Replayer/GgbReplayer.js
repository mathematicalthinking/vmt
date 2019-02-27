import React, { Component } from "react";
import classes from "../Workspace/graph.css";
import Aux from "../../Components/HOC/Auxil";
// import { GRAPH_HEIGHT } from '../../constants';
import Modal from "../../Components/UI/Modal/Modal";
import Script from "react-load-script";
import { parseString } from "xml2js";
class GgbReplayer extends Component {
  state = {
    loading: true,
    xmlContext: ""
  };

  graph = React.createRef();
  previousState = "";

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
    // if (window.GGBApplet) {
    //   console.log('already exists')
    //   console.log(this.props.tabId)
    //   this[`ggbApplet${this.props.tabId}`] = new window.GGBApplet(this.parameters, '5.0');
    //   this[`ggbApplet${this.props.tabId}`].inject(`ggb-element${this.props.tabId}`)
    //   this.initializeGgb();
    // }
    // this.setState({loading: false})
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.loading && !nextState.loading) {
      return true;
    } else if (this.props.inView) {
      return this.props.index !== nextProps.index;
    } else return false;
  }

  componentDidUpdate(prevProps, prevState) {
    let { log, index, changingIndex } = this.props;
    if (!prevProps.inView && this.props.inView) {
      this.updateDimensions();
    }
    if (this.props.inView) {
      if (changingIndex && prevProps.index !== index) {
        this.applyMultipleEvents(prevProps.index, index);
      } else if (
        prevProps.index !== index &&
        !this.state.loading &&
        (log[index].event || log[index].eventArray)
      ) {
        // check if the tab has changed
        this.constructEvent(log[index]);
      }

      // IF we're skipping it means we might need to reconstruct several evenets, possible in reverse order if the prevIndex is greater than this index.
      // This is a god damned mess...good luck
    }
    // else if (!this.state.loading || this.state.tabStates !== prevState.tabStates){
    //   console.log('the tabState have changed')
    //   this.constructEvent(log[index])
    // }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  applyMultipleEvents(startIndex, endIndex) {
    let skipping = true;
    // this.ggbApplet.setRepaintingActive(false); // THIS DOES NOT SEEM TO BE WORKING
    // Forwards through time
    if (startIndex < endIndex) {
      for (let i = startIndex; i <= endIndex; i++) {
        this.constructEvent(this.props.log[i], false, skipping);
      }
    }
    // backwards through time
    else {
      for (let i = startIndex; i > endIndex; i--) {
        let syntheticEvent = { ...this.props.log[i] };
        if (syntheticEvent.eventType === "ADD") {
          syntheticEvent.eventType = "REMOVE";
        } else if (syntheticEvent.eventType === "REMOVE") {
          syntheticEvent.eventType = "ADD";
        } else if (syntheticEvent.eventType === "BATCH_ADD") {
          syntheticEvent.eventType = "BATCH_REMOVE";
        }
        let backwards = true;
        this.constructEvent(syntheticEvent, backwards, skipping);
      }
    }
    // for (let i = prevProps.index; i >= index + 1; i--) {
    //   let syntheticEvent = {...log[i]}
    //   if (syntheticEvent.eventType === 'ADD') {
    //     syntheticEvent.eventType = 'REMOVE'
    //   }
    //   else if (syntheticEvent.eventType === 'REMOVE') {
    //     syntheticEvent.eventType = 'ADD'
    //   }
    //   this.constructEvent(syntheticEvent)
    // }

    // this.ggbApplet.setRepaintingActive(true);
  }

  constructEvent(data, backwards, skipping) {
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
      case "BATCH_UPDATE":
        this.recursiveUpdate(
          [...data.eventArray],
          data.batchSize,
          false,
          backwards,
          skipping
        );
        break;
      case "BATCH_ADD":
        this.recursiveUpdate([...data.eventArray], 1, true);
        break;
      // }
      case "BATCH_REMOVE":
        data.eventArray.forEach(event =>
          this.ggbApplet.deleteObject(event.slice(0, event.indexOf(":")))
        );
        break;
      default:
        break;
    }
  }

  /**
   * @method recursiveUpdate
   * @description takes an array of events and updates the construction in batches
   * used to make drag updates and multipoint shape creation more efficient. See ./docs/Geogebra
   * @param  {Array} events - array of ggb xml events
   * @param  {Number} noOfPoints - the batch size, i.e., number of points in the shape
   * @param  {Boolean} adding - true if BATCH_ADD false if BATCH_UPDATE
   * @param  {Boolean} backwards - true if skipping back in timeline
   * @param {Boolean} Skipping - true if the user is dragging
   *
   */
  recursiveUpdate(events, noOfPoints, adding, backwards, skipping) {
    if (events.length > 0) {
      if (adding) {
        for (let i = 0; i < events.length; i++) {
          this.ggbApplet.evalCommand(events[i]);
        }
      } else {
        if (backwards) {
          events.reverse();
        }
        if (skipping) {
          this.ggbApplet.evalXML(
            events.slice(events.length - noOfPoints, events.length)
          );
          return this.ggbApplet.evalCommand("UpdateConstruction()");
        } else {
          this.ggbApplet.evalXML(
            events.splice(0, noOfPoints).join("") ||
              events.splice(0, events.length).join("")
          );
          this.ggbApplet.evalCommand("UpdateConstruction()");
          setTimeout(() => {
            this.recursiveUpdate(events, noOfPoints, null);
          }, 10);
        }
      }
    } else {
      return;
    }
  }

  constructConsolidatedEvents(xml) {}

  onScriptLoad = () => {
    let parameters = {
      id: `ggbApplet${this.props.tabId}A`, // THE 'A' here is because ggb doesn't like us ending Id name with a number
      // "width": 1300 * .75, // 75% width of container
      // "height": GRAPH_HEIGHT,
      // "scaleContainerClass": "graph",
      showToolBar: false,
      showMenuBar: false,
      showAlgebraInput: true,
      language: "en",
      useBrowserForJS: true,
      borderColor: "#ddd",
      preventFocus: true,
      appletOnLoad: this.initializeGgb,
      appName: "3D Graphics"
    };
    const ggbApp = new window.GGBApplet(parameters, "5.0");
    ggbApp.inject(`ggb-element${this.props.tabId}A`);
  };

  initializeGgb = () => {
    this.ggbApplet = window[`ggbApplet${this.props.tabId}A`];
    this.setState({ loading: false });
    this.ggbApplet.setMode(40); // Sets the tool to zoom
    let { tab } = this.props;
    let { currentState, startingPoint, ggbFile, perspective } = tab;
    // put the current construction on the graph, disable everything until the user takes control
    if (perspective) this.ggbApplet.setPerspective(perspective);
    if (startingPoint) {
      this.ggbApplet.setXML(currentState);
    } else if (ggbFile) {
      this.ggbApplet.setBase64(ggbFile);
    }
  };

  // This method is for when we're skipping forward or backward and, rather than apply each event
  // one at a time to the construction, we instead consolidate all of the evemts into one event
  // and apply it once /// IT DOESNT QUITE WORK BECAUSE SOMETIMES WE NEED TO EVALUATE COMMANDS RATHER THAN JUST ADD XML....BUT THERE MIGHT BE A SOLUTION HERE
  consolidateEvents(startingIndex, endingIndex) {
    // consolidate the log up until the startingIndex
    // let syntheticLog = this.props.log.reduce((acc, event, idx) => {
    //   if (event.label && idx <= endingIndex) {
    //     if (acc[event.label] && event.eventType === 'REMOVE') {
    //       delete acc[event]
    //     } else {
    //       acc[event.label] = event.event
    //     }
    //   }
    //   return acc;
    // }, {})
    // let xmlString = Object.keys(syntheticLog).map(event => syntheticLog[event]).join('')
    // this.ggbApplet.setRepaintingActive(false);
    // for (let i = 0; i < endingIndex; i++) {
    //   this.constructEvent(this.props.log[i]);
    // }
    // this.ggbApplet.setRepaintingActive(true);
    // this.ggbApplet.setXML(this.state.xmlContext + xmlString + '</construction></geogebra>')
    // console.log(syntheticLog)
    // this.parseXML(this.ggbApplet.getXML())
    // .then(parsedXML => {
    //   console.log(parsedXML)
    //   let existingEvents = {}
    //   console.log(this.props.log)
    //   parsedXML.geogebra.construction[0].element.forEach(event => {
    //   })
    //   console.log(existingEvents)
    // })
    // rpelay forwards
    // let { log } = this.props;
    // let syntheticLog = {};
    // if (startingIndex < endingIndex) {
    //   for (let i = startingIndex + 1; i <= endingIndex; i++) {
    //     // If no label then its not a ggb event
    //     if (log[i].label) {
    //       // If we're removing an event we had previosuly added in this string of events then get rid of it
    //       if (log[i].eventType === 'REMOVE' && syntheticLog[log[i].label]) {
    //         delete syntheticLog[log[i].label]
    //       }
    //       // Else we are removing a point that had been added before the skipFromPoint
    //       // Because we're going to update the construction all at once
    //       else {
    //       }
    //       syntheticLog[log[i].label] = log[i]
    //     }
    //   }
    //   console.log(syntheticLog)
    //   let syntheticLogArr = Object.keys(syntheticLog).map(key => {
    //     console.log(key)
    //     return syntheticLog[key]
    //   }).join('')
    //   console.log(syntheticLogArr)
    // }
    // else {
    // }
  }

  // This is repeated in ggbGraph...I wonder if we should have a separate file of shared functions
  parseXML = xml => {
    return new Promise((resolve, reject) => {
      parseString(xml, (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      });
    });
  };

  updateDimensions = () => {
    // this.resizeTimer = setTimeout(() => {
    if (this.graph.current) {
      let { clientHeight, clientWidth } = this.graph.current.parentElement;
      window[`ggbApplet${this.props.tabId}A`].setSize(
        clientWidth,
        clientHeight
      );
      // window.ggbApplet.evalCommand('UpdateConstruction()')
    }
    // this.resizeTimer = undefined;
    // }, 200)
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
          id={`ggb-element${this.props.tabId}A`}
          ref={this.graph}
        />
        <Modal show={this.state.loading} message="Loading..." />
      </Aux>
    );
  }
}

export default GgbReplayer;
