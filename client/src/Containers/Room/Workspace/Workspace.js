import React, { Component } from 'react';
// let GGBApplet;
let ggbApplet;
class Workspace extends Component {
  componentDidMount() {
    this.socket = this.props.socket;
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
    console.log(this.props.socket)

    this.socket.on('RECEIVE_EVENT', event => {
      console.log('we got the event!')
      ggbApplet.setBase64(event, () => {
        console.log('and we appended it to the event')
      })
    })

  }
  initialize = () => {
    console.log('registered listeners')
    const updateListener = (objName) => {
      console.log("Update " + objName);
      console.log(ggbApplet)
    }

    const addListener = (objName) => {
        console.log(ggbApplet)
        console.log("Add " + objName);
    }

    const undoListener = () => {
      // this seems to fire when an event is completed
        console.log("undo");
        const newData = {}
        newData.roomId = this.props.room._id;
        newData.event = ggbApplet.getBase64();

        this.socket.emit('SEND_EVENT', newData, () => {
          console.log('success');
        })
    }

    const removeListener = (objName) => {
        console.log("Remove " + objName);
    }

    const clearListener = () =>  {
        console.log("clear");
    }
    ggbApplet.registerUpdateListener(updateListener);
    ggbApplet.registerAddListener(addListener);
    ggbApplet.registerRemoveListener(removeListener);
    ggbApplet.registerStoreUndoListener(undoListener);
    ggbApplet.registerClearListener(clearListener);
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
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Workspace;
