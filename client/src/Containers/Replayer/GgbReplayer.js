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

  componentDidUpdate(prevProps) {
    if (prevProps.event._id !== this.props.event._id && !this.state.loading && !this.props.event.text) {
      this.ggbApplet.setXML(this.props.event.event)
    }
  }

  onScriptLoad = () => {
    const parameters = {
      "id":"ggbApplet",
      "width": 1300 * .75, // 75% width of container
      "height": GRAPH_HEIGHT,
      "scaleContainerClass": 'applet_container',
      "showToolBar": false,
      "showMenuBar": false,
      "showAlgebraInput": true,
      "language": "en",
      "useBrowserForJS":false,
      "preventFocus":true,
      "appName":"whiteboard"
    };
    console.log("parameters: ", parameters)
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
