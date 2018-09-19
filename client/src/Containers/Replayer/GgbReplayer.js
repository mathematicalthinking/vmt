import React, { Component } from 'react';
import classes from '../Workspace/graph.css';
import Aux from '../../Components/HOC/Auxil';
import Modal from '../../Components/UI/Modal/Modal';
import Script from 'react-load-script';
class GgbReplayer extends Component {

  state = {
    loading: true,
  }

  componentDidMount() {

  }

  componendDidUpdate(prevProps) {
    if (prevProps.event !== this.props.event && !this.state.loading) {
      this.ggbApplet.setXML(this.props.event.event)
    }
  }

  onScriptLoad = () => {
    const parameters = {
      "id":"ggbApplet",
      "width": 1300 * .75, // 75% width of container
      "height": window.innerHeight - 300,
      "scaleContainerClass": 'applet_container',
      "showToolBar": true,
      "showMenuBar": true,
      "showAlgebraInput":true,
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
          this.initializeGgb();
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
