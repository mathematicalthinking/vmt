import React, { Component } from "react";
import classes from "../Workspace/graph.css";
import Aux from "../../Components/HOC/Auxil";
// import { GRAPH_HEIGHT } from '../../constants';
import Modal from "../../Components/UI/Modal/Modal";
import Script from "react-load-script";
class GgbReplayer extends Component {
  state = {
    loading: true,
    xmlContext: ""
  };

  graph = React.createRef();

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
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

  // We should periodically save the entire state so if we skip to the very end we don't have to apply each event one at a time

  /**
   * @method applyMultipleEvents
   * @description Takes two indices from the log and applies (or un-applies if going backwards thru time) all
   * @param  {} startIndex
   * @param  {} endIndex
   */

  applyMultipleEvents(startIndex, endIndex) {
    if (startIndex < endIndex) {
      // this.ggbApplet.setXML(this.props.log[endIndex].currentState);
      for (let i = startIndex; i <= endIndex; i++) {
        if (
          this.props.log[i].eventArray &&
          this.props.log[i].eventArray.length > 0
        ) {
          let syntheticEvent = { ...this.props.log[i] };
          let { eventArray, batchSize } = syntheticEvent;
          if (!batchSize) batchSize = eventArray.length;
          syntheticEvent.eventArray = eventArray.slice(
            eventArray.length - batchSize,
            eventArray.length
          );
          this.constructEvent(syntheticEvent);
        } else {
          this.constructEvent(this.props.log[i]);
        }
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
        } else if (syntheticEvent.eventType === "BATCH_UPDATE") {
          let { eventArray, batchSize } = { ...syntheticEvent };
          syntheticEvent.eventArray = eventArray.slice(0, batchSize);
        }
        this.constructEvent(syntheticEvent);
      }
    }
  }

  constructEvent(data) {
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
        this.recursiveUpdate([...data.eventArray], data.batchSize);
        break;
      case "BATCH_ADD":
        if (data.definition) {
          this.recursiveUpdate([...data.eventArray], 1, true);
        }
        break;
      default:
        break;
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
  recursiveUpdate(events, batchSize, adding) {
    if (events && events.length > 0) {
      if (adding) {
        for (let i = 0; i < events.length; i++) {
          this.ggbApplet.evalCommand(events[i]);
        }
      } else {
        this.ggbApplet.evalXML(
          events.splice(0, batchSize * 2).join("") ||
            events.splice(0, events.length).join("")
        );
        this.ggbApplet.evalCommand("UpdateConstruction()");
        setTimeout(() => {
          this.recursiveUpdate(events, batchSize);
        }, 10);
      }
    } else {
      return;
    }
  }

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
      appName: this.props.tab.appName
    };
    const ggbApp = new window.GGBApplet(parameters, "5.0");
    ggbApp.inject(`ggb-element${this.props.tabId}A`);
  };

  initializeGgb = () => {
    this.ggbApplet = window[`ggbApplet${this.props.tabId}A`];
    this.setState({ loading: false });
    this.ggbApplet.setMode(40); // Sets the tool to zoom
    let { tab } = this.props;
    let { currentState, startingPoint, ggbFile } = tab;
    // put the current construction on the graph, disable everything until the user takes control
    // if (perspective) this.ggbApplet.setPerspective(perspective);
    if (startingPoint) {
      this.ggbApplet.setXML(currentState);
    } else if (ggbFile) {
      this.ggbApplet.setBase64(ggbFile);
    }
  };

  updateDimensions = () => {
    // this.resizeTimer = setTimeout(() => {
    if (this.graph.current) {
      let { clientHeight, clientWidth } = this.graph.current.parentElement;
      window[`ggbApplet${this.props.tabId}A`].setSize(
        clientWidth,
        clientHeight
      );
    }
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
