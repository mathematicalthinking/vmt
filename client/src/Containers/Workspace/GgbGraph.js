import React, { Component } from 'react';
import classes from './graph.css';
import Aux from '../../Components/HOC/Auxil';
import Modal from '../../Components/UI/Modal/Modal';
import Script from 'react-load-script';
import throttle from 'lodash/throttle';
import { parseString } from 'xml2js';
// import { eventNames } from 'cluster';
// THINK ABOUT GETTING RID OF ALL XML PARSING...THERE ARE PROBABLY NATIVE GGB METHODS THAT CAN ACCOMPLISH EVERYTHING WE NEED
const THROTTLE_FIDELITY = 60;
class GgbGraph extends Component {

  state = {
    receivingData: false,
    loadingWorkspace: true,
    loading: true,
    selectedElement: '',
    showControlWarning: false,
    warningPosition: {x: 0, y: 0},
    // referencedElementPosition: {left: null, top: null}
  }
  
  graph = React.createRef()
  
  componentDidMount() {
    this.socket = this.props.socket;
    // window.addEventListener('click', this.clickListener)
    window.addEventListener("resize", this.updateDimensions);
    this.socket.on('RECEIVE_EVENT', data => {
      this.setState({receivingData: true}, () => {
        switch (data.eventType) {
          case 'ADD':
          if (data.definition) {
            this.ggbApplet.evalCommand(`${data.label}:${data.definition}`)
          }
          this.ggbApplet.evalXML(data.event)
          this.ggbApplet.evalCommand('UpdateConstruction()')
          break;
          case 'REMOVE':
          this.ggbApplet.deleteObject(data.label)
          break;
          case 'UPDATE':
          this.ggbApplet.evalXML(data.event)
          this.ggbApplet.evalCommand('UpdateConstruction()')
          break;
          default: break;
        }
      })
    })
  }

  async componentDidUpdate(prevProps) {
    if (!prevProps.inControl && this.props.inControl) {
      this.ggbApplet.showToolBar('"0 39 73 62 | 1 501 67 , 5 19 , 72 75 76 | 2 15 45 , 18 65 , 7 37 | 4 3 8 9 , 13 44 , 58 , 47 | 16 51 64 , 70 | 10 34 53 11 , 24  20 22 , 21 23 | 55 56 57 , 12 | 36 46 , 38 49  50 , 71  14  68 | 30 29 54 32 31 33 | 25 17 26 60 52 61 | 40 41 42 , 27 28 35 , 6",')
      this.ggbApplet.showMenuBar(true)
      this.ggbApplet.setMode(0)
      this.freezeElements(false)
      
    }
    else if ((prevProps.inControl && !this.props.inControl )|| this.props.someoneElseInControl) {
      this.ggbApplet.showToolBar(false)
      this.ggbApplet.setMode(40)
      this.freezeElements(true)
    }
    else if (!prevProps.referencing && this.props.referencing) {
      this.ggbApplet.setMode(0) // Set tool to pointer so the user can select elements 
      
    }
    else if (prevProps.referencing && !this.props.referencing) {
      this.ggbApplet.setMode(40)
    }
    if (!prevProps.showingReference && this.props.showingReference && this.props.referToEl.elementType !== 'chat_message') {
      // find the coordinates of the point we're referencing
      let position = await this.getRelativeCoords(this.props.referToEl.element)
      this.props.setToElAndCoords(null, position)
    }
    else if (this.props.showingReference && (prevProps.referToEl !== this.props.referToEl) && this.props.referToEl.elementType !== 'chat_message') {
      let position = await this.getRelativeCoords(this.props.referToEl.element)
      this.props.setToElAndCoords(null, position)
    }
  }
  
  updateDimensions = () => {
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer)
    }
    this.resizeTimer = setTimeout(async () => {
      if (this.graph.current && !this.state.loading) {
        let { clientHeight, clientWidth } = this.graph.current.parentElement;
        window.ggbApplet.setSize(clientWidth, clientHeight);
        // window.ggbApplet.evalCommand('UpdateConstruction()')
        if (this.props.showingReference || (this.props.referencing && this.props.referToEl.elmentType !== 'chat_message')) {
          let { element } = this.props.referToEl;
          console.log(element)
          let position = await this.getRelativeCoords(element)
          this.props.setToElAndCoords(null, position)
        }
      }
      this.resizeTimer = undefined;
    }, 200)
  }
  
  onScriptLoad = () => {
    // NOTE: complete list here: https://wiki.geogebra.org/en/Reference:GeoGebra_App_Parameters
    const parameters = {
      "id":"ggbApplet",
      // "scaleContainerClasse": "graph",
      "customToolBar": "0 39 73 62 | 1 501 67 , 5 19 , 72 75 76 | 2 15 45 , 18 65 , 7 37 | 4 3 8 9 , 13 44 , 58 , 47 | 16 51 64 , 70 | 10 34 53 11 , 24  20 22 , 21 23 | 55 56 57 , 12 | 36 46 , 38 49  50 , 71  14  68 | 30 29 54 32 31 33 | 25 17 26 60 52 61 | 40 41 42 , 27 28 35 , 6",
      "showToolBar": false,
      "showMenuBar": false,
      "showAlgebraInput":true,
      "language": "en",
      "useBrowserForJS":false,
      "borderColor": "#ddd",
      "buttonShadows": true,
      "preventFocus":true,
      // "appName":"whiteboard"
      "appletOnLoad": this.initializeGgb
    };
    
    const ggbApp = new window.GGBApplet(parameters, '5.0');
    ggbApp.inject('ggb-element')
  }
  
  componentWillUnmount() {
    if (this.ggbApplet && this.ggbApplet.listeners) {
      delete window.ggbApplet;
      this.ggbApplet.unregisterAddListener(this.addListener);
      this.ggbApplet.unregisterUpdateListener();
      this.ggbApplet.unregisterRemoveListener(this.eventListener);
      // this.ggbApplet.unregisterClearListener(this.clearListener);
      // this.ggbApplet.unregisterStoreUndoListener(this.undoListener);
    }
    if (!this.props.tempRoom) {
      let canvas = document.querySelector('[aria-label="Graphics View 1"]');
      this.props.updateRoom(this.props.room._id, {graphImage: {imageData: canvas.toDataURL()}})
    }
    window.removeEventListener("resize", this.updateDimensions);
  }
  
  initializeGgb = () => {
    this.ggbApplet = window.ggbApplet;
    this.setState({loading: false})
    this.ggbApplet.setMode(40) // Sets the tool to zoom
    let { user, room } = this.props;
    let { events } = room;
    // put the current construction on the graph, disable everything until the user takes control
    if (events.length > 0) {
      this.ggbApplet.setXML(room.currentState)
      this.freezeElements(true)
    }

    this.addListener = label => {
      if (!this.state.receivingData) {
        let xml = this.ggbApplet.getXML(label)
        let definition = this.ggbApplet.getCommandString(label);
        sendEvent(xml, definition, label, "ADD", "added");
      }
      this.setState({receivingData: false})
    }
    
    this.removeListener = label => {
      if (!this.state.receivingData) {
        sendEvent(null, null, label, "REMOVE", "removed")
      }
      this.setState({receivingData: false})
    }
    
    this.updateListener = label => {
      if (!this.props.inControl) {
        return
      }
      else if (!this.state.receivingData) {
        let xml = this.ggbApplet.getXML(label)
        sendEvent(xml, null, label, "UPDATE", "updated")
      }
      this.setState({receivingData: false})
      // this.ggbApplet.evalCommand("updateConstruction()")
    }

    // Used to capture referencing 
    this.clickListener = async element => {
      console.log(element)
      // console.log("CLICKED", this.ggbApplet.getXML())
      if (this.props.referencing) {
        // let xmlObj = await this.parseXML(this.ggbApplet.getXML(event));
        let elementType = this.ggbApplet.getObjectType(element);
        let position;
        if (elementType !== 'point') {
          let commandString = this.ggbApplet.getCommandString(element)
          element = commandString.slice(commandString.indexOf('(') + 1, commandString.indexOf('(') + 2)
        }
        position = await this.getRelativeCoords(element)
        this.props.setToElAndCoords({element, elementType: 'point'}, position)
      }
    }
    
    let sendEvent = throttle(async (xml, definition, label, eventType, action) => {
      let xmlObj;
      if (xml) xmlObj = await this.parseXML(xml)
      let newData = {
        definition,
        label,
        eventType,
        room: room._id,
        event: xml,
        description: `${user.username} ${action} ${xmlObj && xmlObj.element ? xmlObj.element.$.type : ''} ${label}`,
        user: {_id: user._id, username: user.username},
        timestamp: new Date().getTime(),
        currentState: this.ggbApplet.getXML(),
        mode: this.ggbApplet.getMode(),
      }
      this.socket.emit('SEND_EVENT', newData)
      this.props.resetControlTimer()
    }, THROTTLE_FIDELITY)

    // attach this listeners to the ggbApplet
    if (this.ggbApplet.listeners.length === 0) {
      this.ggbApplet.registerAddListener(this.addListener);
      this.ggbApplet.registerClickListener(this.clickListener);
      this.ggbApplet.registerUpdateListener(this.updateListener);
      this.ggbApplet.registerRemoveListener(this.removeListener);
    }
    
  }
  
  parseXML = (xml) => {
    return new Promise((resolve, reject) => {
      parseString(xml, (err, result) => {
        if (err) return reject(err)
        return resolve(result)
      })
    })
  }

  freezeElements = (freeze) => {
    let allElements = this.ggbApplet.getAllObjectNames()
    allElements.forEach(element => {
      this.ggbApplet.setFixed(element, freeze, true) // Unfix all of the elements
    })
  }

  getRelativeCoords = (element) => {
    return new Promise(async (resolve, reject) => {
      let elX;
      let elY;
      try {
        elX = this.ggbApplet.getXcoord(element)
        elY = this.ggbApplet.getYcoord(element)
      }
      catch (err) {
        // get the coords of its children
      }
      // Get the element's location relative to the client Window 
      let ggbCoords = this.graph.current.getBoundingClientRect();
      let construction = await this.parseXML(this.ggbApplet.getXML()) // IS THERE ANY WAY TO DO THIS WITHOUT HAVING TO ASYNC PARSE THE XML...
      let euclidianView = construction.geogebra.euclidianView[0]
      let { xZero, yZero, scale, yScale, } = euclidianView.coordSystem[0].$;
      if (!yScale) yScale = scale;
      let { width, height } = euclidianView.size[0].$
      let xOffset = (ggbCoords.width - width) + parseInt(xZero, 10) + (elX * scale);
      let yOffset = (ggbCoords.height - height) + parseInt(yZero, 10) - (elY * yScale)
      resolve({left: xOffset, top: yOffset})
    })
  }

  render() {
    return (
      <Aux>
        <Script url='https://cdn.geogebra.org/apps/deployggb.js' onLoad={this.onScriptLoad} />
        <div className={classes.Graph} id='ggb-element' ref={this.graph}>
        </div>
        {/* <div className={classes.ReferenceLine} style={{left: this.state.referencedElementPosition.left, top: this.state.referencedElementPosition.top}}></div> */}
        {/* {this.state.showControlWarning ? <div className={classes.ControlWarning} style={{left: this.state.warningPosition.x, top: this.state.warningPosition.y}}>
          You don't have control!
        </div> : null} */}
        <Modal show={this.state.loading} message='Loading...'/>
      </Aux>
    )
  }
}

export default GgbGraph;
