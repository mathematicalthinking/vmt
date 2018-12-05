import React, { Component } from 'react';
import classes from '../Workspace/graph.css';
import Aux from '../../Components/HOC/Auxil';
// import { GRAPH_HEIGHT } from '../../constants'
import Modal from '../../Components/UI/Modal/Modal';
import Script from 'react-load-script';
import { parseString } from 'xml2js';
class GgbReplayer extends Component {

  state = {
    loading: true,
    xmlContext: '' // xml string representing everything but the events and commands
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.index !== nextProps.index || this.state.loading !== nextState.loading) {
      return true;
    } return false;
  }

  
  componentDidUpdate(prevProps, prevState) {
    const { log, index, changingIndex } = this.props;
    // IF we're skipping it means we might need to reconstruct several evenets, possible in reverse order if the prevIndex is greater than this index.
    if (changingIndex) {
      // this.consolidateEvents(prevProps.index, index) THIS MIGHT BE A DEAD END
      this.ggbApplet.setRepaintingActive(false)
      if (prevProps.index < this.props.index) {
        for (let i = prevProps.index; i <= index; i++){
          this.constructEvent(this.props.log[i])
        }
      } else {
        for (let i = prevProps.index; i >= index + 1; i--) {
          let syntheticEvent = {...log[i]}
          if (syntheticEvent.eventType === 'ADD') {
            syntheticEvent.eventType = 'REMOVE'
          } 
          else if (syntheticEvent.eventType === 'REMOVE') {
            syntheticEvent.eventType = 'ADD'
          }
          this.constructEvent(syntheticEvent)
        }
      }
      this.ggbApplet.setRepaintingActive(true)
    }
    else if (prevProps.log[prevProps.index]._id !== log[index]._id && !this.state.loading && !log[index].text) {
      this.constructEvent(log[index])
    }
    else if (!this.state.loading){
      this.constructEvent(log[index])
    }
  }
  
  constructEvent(event) {
    switch (event.eventType) {
      case 'ADD':
      if (event.definition && event.definition !== '') {
        this.ggbApplet.evalCommand(`${event.label}:${event.definition}`)
      }
      this.ggbApplet.evalXML(event.event)
      this.ggbApplet.evalCommand('UpdateConstruction()')
      break;
      case 'REMOVE':
      this.ggbApplet.deleteObject(event.label)
      break;
      case 'UPDATE':
      this.ggbApplet.evalXML(event.event)
      this.ggbApplet.evalCommand('UpdateConstruction()')
      break;
      default: break;
    }
  }

  constructConsolidatedEvents(xml) {

  }

  
  onScriptLoad = () => {
    const parameters = {
      "id":"ggbApplet",
      // "width": 1300 * .75, // 75% width of container
      // "height": GRAPH_HEIGHT,
      "scaleContainerClasse": "graph",
      "showToolBar": false,
      "showMenuBar": false,
      "showAlgebraInput": true,
      "language": "en",
      "useBrowserForJS":false,
      "borderColor": "#ddd",
      "preventFocus":true,
      "appletOnLoad": this.initializeGgb,
      "appName":"whiteboard"
    };
    const ggbApp = new window.GGBApplet(parameters, '5.0');
    ggbApp.inject('ggb-element')
  }

  initializeGgb = () => {
    this.ggbApplet = window.ggbApplet;
    // let xmlContext = this.ggbApplet.getXML()
    // xmlContext = xmlContext.slice(0, xmlContext.length - 27) // THIS IS HACKY BUT ????
    // console.log(xmlContext)
    this.setState({
      // xmlContext, 
      loading: false,
    })
  }

  // This method is for when we're skipping forward or backward and, rather than apply each event 
  // one at a time to the construction, we instead consolidate all of the evemts into one event 
  // and apply it once
  consolidateEvents(startingIndex, endingIndex) {
    // consolidate the log up until the startingIndex
    console.log(this.props.log)
    let syntheticLog = this.props.log.reduce((acc, event, idx) => {
      if (event.label && idx <= endingIndex) {
        if (acc[event.label] && event.eventType === 'REMOVE') {
          delete acc[event]
        } else {
          acc[event.label] = event.event
        }
      }
      return acc;
    }, {})
    console.log(syntheticLog)
    let xmlString = Object.keys(syntheticLog).map(event => syntheticLog[event]).join('')
    this.ggbApplet.setRepaintingActive(false)
    for (let i = 0; i < endingIndex; i++){
      this.constructEvent(this.props.log[i])
    }
    this.ggbApplet.setRepaintingActive(true)
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
  parseXML = (xml) => {
    console.log(xml)
    return new Promise((resolve, reject) => {
      parseString(xml, (err, result) => {
        if (err) return reject(err)
        return resolve(result)
      })
    })
  }
  
  render() {

    return (
      <Aux>
        <Script url='https://cdn.geogebra.org/apps/deployggb.js' onLoad={this.onScriptLoad} />
        <div className={classes.Graph} id='ggb-element'></div>
        <Modal show={this.state.loading} message='Loading...'/>
      </Aux>
    )
  }
}

export default GgbReplayer;
