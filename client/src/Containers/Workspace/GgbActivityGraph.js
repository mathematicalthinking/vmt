// Theres a lot of repetiion between this component and the regular Ggb Graph...for example they both resize @TODO how might we utilize HOCs to cut down on repetition
import React, { Component } from 'react';
import { parseString } from 'xml2js';
import throttle from 'lodash/throttle';
import { Aux , Modal} from '../../Components';
import INITIAL_GGB from './blankGgb';
import Script from 'react-load-script';
import classes from './graph.css';

class GgbActivityGraph extends Component{

  state = {
    loading: true,
  }

  graph = React.createRef()

  componentDidMount(){
    window.addEventListener("resize", this.updateDimensions);
  }

  componentDidUpdate(prevProps){
    if (prevProps.currentTab !== this.props.currentTab) {
      console.log('switched tab, ', this.props.currentTab)
      if (this.props.tabs[this.props.currentTab].currentState !== '') {
        console.log('')
        setTimeout(this.ggbApplet.setXML(this.props.tabs[this.props.currentTab].currentState), 0)
      }
      else {
        setTimeout(this.ggbApplet.setXML(INITIAL_GGB), 0)
      }
    }
  }

  componentWillUnmount(){
    window.removeEventListener("resize", this.updateDimensions);
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
          let position = await this.getRelativeCoords(element)
          this.props.setToElAndCoords(null, position)
        }
      }
      this.resizeTimer = undefined;
    }, 200)
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
  
  onScriptLoad = () => {
    const parameters = {
      "id":"ggbApplet",
      // "scaleContainerClasse": "graph",
      "customToolBar": "0 39 73 62 | 1 501 67 , 5 19 , 72 75 76 | 2 15 45 , 18 65 , 7 37 | 4 3 8 9 , 13 44 , 58 , 47 | 16 51 64 , 70 | 10 34 53 11 , 24  20 22 , 21 23 | 55 56 57 , 12 | 36 46 , 38 49  50 , 71  14  68 | 30 29 54 32 31 33 | 25 17 26 60 52 61 | 40 41 42 , 27 28 35 , 6",
      "showToolBar": false,
      "showMenuBar": this.props.role === 'facilitator',
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
    ggbApp.inject('ggb-element');
  }
  
  initializeGgb = () => {
    this.ggbApplet = window.ggbApplet;
    this.setState({loading: false});
    let { startingPoint } = this.props.tabs[this.props.currentTab];
    if (startingPoint) {
      this.ggbApplet.setXML(startingPoint)
    }
    if (this.props.role === 'participant') {
      this.ggbApplet.setMode(40)
      this.ggbApplet.freezeElements(true)
    } else this.registerListeners();
    // put the current construction on the graph, disable everything until the user takes control
  }

  getGgbState = throttle(() => {
    let updatedTabs = [...this.props.tabs]
    let updatedTab = {...this.props.tabs[this.props.currentTab]}
    updatedTab.currentState = this.ggbApplet.getXML();
    updatedTabs[this.props.currentTab] = updatedTab;
    this.props.updatedActivity(this.props.activity._id, {tabs: updatedTabs})
  }, 500)

  registerListeners() {
    console.log('registering listeners')
    this.ggbApplet.registerAddListener(this.getGgbState);
    this.ggbApplet.registerUpdateListener(this.getGgbState);
    this.ggbApplet.registerRemoveListener(this.getGgbState);
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
    let allElements = this.ggbApplet.getAllObjectNames() // WARNING ... THIS METHOD IS DEPRECATED
    allElements.forEach(element => { // AS THE CONSTRUCTION GETS BIGGER THIS GETS SLOWER...SET_FIXED IS BLOCKING
      this.ggbApplet.setFixed(element, freeze, true) // Unfix/fix all of the elements
    })
  }
  
  render() {
    return (
      <Aux>
        <Script url='https://cdn.geogebra.org/apps/deployggb.js' onLoad={this.onScriptLoad} />
        <div className={classes.Graph} id='ggb-element' ref={this.graph}></div>
        <Modal show={this.state.loading} message='Loading...'/>
      </Aux>
    )
  }
}

export default GgbActivityGraph;