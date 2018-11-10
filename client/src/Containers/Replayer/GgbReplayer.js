import React, { Component } from 'react';
import classes from '../Workspace/graph.css';
import Aux from '../../Components/HOC/Auxil';
import { GRAPH_HEIGHT } from '../../constants'
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
    const { log, index, skipping } = this.props;
    // REbuild the constrution from scratch up to the current index
    if (!prevProps.skipping && skipping) {
      this.ggbApplet.reset();
      log.forEach((entry, i) => {
        if (i <= this.props.index && entry.event) {
          this.constructEvent(entry)
        }
      })
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
