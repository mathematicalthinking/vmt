import React, { Component } from 'react';
import classes from '../Workspace/graph.css';
import Aux from '../../Components/HOC/Auxil';
// import { GRAPH_HEIGHT } from '../../constants'
import Modal from '../../Components/UI/Modal/Modal';
import Script from 'react-load-script';
class GgbReplayer extends Component {

  state = {
    loading: true,
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.index !== nextProps.index
      || this.state.loading !== nextState.loading) {
      return true;
    } return false;
  }

  
  componentDidUpdate(prevProps, prevState) {
    console.log(this.props)
    const { log, index, skipping } = this.props;
    // IF we're skipping it means we might need to reconstruct several evenets, possible in reverse order if the prevIndex is greater than this index.
    if (!prevProps.skipping && skipping) {
      if (prevProps.index < this.props.index) {
        for (let i = prevProps.index + 1; i <= this.props.index; i++) {
          this.constructEvent(log[i])
        }
      } 
      else {
        for (let i = prevProps.index; i >= this.props.index + 1; i--) {
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
      "appName":"whiteboard"
    };
    const ggbApp = new window.GGBApplet(parameters, true);
    ggbApp.inject('ggb-element')
    const timer = setInterval(() => {
      if (window.ggbApplet) {
        if (window.ggbApplet.listeners) {
          this.ggbApplet = window.ggbApplet;
          this.ggbApplet.setMode(0)
          this.setState({loading: false})
          clearInterval(timer);
        }
      }
    }, 1000)
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
