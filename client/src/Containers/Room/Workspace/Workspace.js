import React, { Component } from 'react';
// let GGBApplet;
let ggbApplet;
class Workspace extends Component {
  componentDidMount() {
    // THIS IS EXTREMELEY HACKY -- basically what's going on here is that
    // we need to access the ggbApplet object that is attached to the iframe
    // window by the external geogebra cdn script. This takes a little bit of
    // time but there doesn't seem to be a way to listen for that change, so
    // instead we are essentially polling window object to see if it has
    // the ggbApplet property yet.
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
      console.log("Update " + objName);
      console.log(ggbApplet)
    }

    function addListener(objName) {
        console.log(ggbApplet)
        console.log("Add " + objName);
    }

    function undoListener() {
        console.log("undo");
        console.log("base64: ", ggbApplet.getBase64())
        console.log(ggbApplet.getLateXBase64())
    }

    function removeListener(objName) {
        console.log("Remove " + objName);
    }

    function clearListener() {
        console.log("clear");
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
                src={`/Geogebra.html?file=${this.props.room.tabList[0]}`}
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
