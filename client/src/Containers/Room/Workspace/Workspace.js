import React, { Component } from 'react';
// let GGBApplet;
let ggbApplet;
class Workspace extends Component {
  componentDidMount() {
    // const script = document.createElement('script')
    // script.src = 'https://cdn.geogebra.org/apps/deployggb.js';
    // script.async = true;
    // document.body.appendChild(script);
    // script.onload = () => {
    //   console.log("SCRIPT LOADED");
    //   var parameters = {
    //     "id":"ggbApplet",
    //     "width": 800,
    //     "height": 600,
    //     "scaleContainerClass": 'applet_container',
    //     "showToolBar":true,
    //     "showMenuBar": true,
    //     "showAlgebraInput":true,
    //     "language": "en",
    //     "useBrowserForJS":false,
    //     "preventFocus":true,
    //     //"appName":"graphing"
    //   };
    //   var ggbApp = new GGBApplet(parameters, true);
    //   window.addEventListener("load", function() {
    //       ggbApp.inject('ggb-element');
    //       console.log("DOCUMENT: ", document)
    //   });
        const timer = setInterval(() => {
          console.log('looking for ggbApplet')
          const iframe = document.getElementById('ggbRoom').contentDocument;
          ggbApplet = iframe.ggbApplet;
          console.log(ggbApplet)
          if (ggbApplet) {
            console.log('found it!');
            this.initialize();
            clearInterval(timer);
          }
        }, 1000)

    // }

  }
  initialize = () => {
    ggbApplet.registerUpdateListener(updateListener);
    ggbApplet.registerAddListener(addListener);
    ggbApplet.registerRemoveListener(removeListener);
    ggbApplet.registerStoreUndoListener(undoListener);
    ggbApplet.registerClearListener(clearListener);
    console.log('registered listeners')
    function updateListener(objName) {
      var applet = document.ggbApplet;
      console.log("Update " + objName);
      let isChanged = true;
    }

    function addListener(objName) {
        console.log("Add " + objName);
        let isChanged = true;
    }

    function undoListener() {
        console.log("undo");
        let isChanged = true;
    }

    function removeListener(objName) {
        console.log("Remove " + objName);
        let isChanged = true;
    }

    function clearListener() {
        console.log("clear");
        let isChanged = true;
    }
  }
  render() {
    return (
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-md-9 nopadding-sides'>
            <div class='ui-tabs ui-widget-content ui-corner-all'>

              <ul  class='ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-wdget-header ui-cornern-all'>
                <li className=''>Click</li>
              </ul>
              <iframe
                height={600}
                width={800}
                title={this.props.roomName}
                id='ggbRoom'
                src={`/Geogebra.html`}
                ref={(element) => {this.ifr = element}}
              >
              </iframe>
              {/* <div id='ggb-element' class='applet-container'></div>
                <div className='loader'>
                <img src='./Ripple-2.3s-200px.gif' />
              </div> */}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Workspace;
