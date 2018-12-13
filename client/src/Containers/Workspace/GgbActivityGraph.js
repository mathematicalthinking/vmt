import React, { Component } from 'react';
import { Aux , Modal} from '../../Components';
import Script from 'react-load-script';
import classes from './graph.css';

class GgbActivityGraph extends Component{

  state = {
    loading: true,
  }
  
  onScriptLoad = () => {
    const parameters = {
      "id":"ggbApplet",
      // "scaleContainerClasse": "graph",
      "customToolBar": "0 39 73 62 | 1 501 67 , 5 19 , 72 75 76 | 2 15 45 , 18 65 , 7 37 | 4 3 8 9 , 13 44 , 58 , 47 | 16 51 64 , 70 | 10 34 53 11 , 24  20 22 , 21 23 | 55 56 57 , 12 | 36 46 , 38 49  50 , 71  14  68 | 30 29 54 32 31 33 | 25 17 26 60 52 61 | 40 41 42 , 27 28 35 , 6",
      "showToolBar": false,
      "showMenuBar": true,
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
  
  initializeGgb = () => {
    this.setState({loading: false})
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

export default GgbActivityGraph;