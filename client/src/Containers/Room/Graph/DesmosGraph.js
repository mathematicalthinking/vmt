

handleDesmosLoad = () => {
  console.log('desmos')
  const elt = document.getElementById('calculator');
  this.desmos = window.Desmos.GraphingCalculator(elt);
  const tabs = this.props.room.tabs;
  if (tabs.length > 0) {
    if (tabs[0].desmosLink) {
      API.getDesmos(tabs[0].desmosLink)
      .then(res => {
        const elt = document.getElementById('desmos');
        const calculator = window.Desmos.GraphingCalculator(elt);
        calculator.setState(res.data.result.state)
        this.setState({loading: false})

      })
      .catch(err => console.log(err))
    }
  }
}
//
//   // we dont need socket functionality on replay
//   if (!this.props.replaying) {
//     this.socket = this.props.socket;
//     // define the socket listeners for handling events from the backend
//     this.socket.on('RECEIVE_EVENT', event => {
//       /// @TODO update room object in parents state so that the events.length stay up to date
//       // this.receivingData = true;
//       this.ggbApplet.setXML(event)
//       this.props.updateRoom({events: {event,}})
//       // @TODO ^^^^^ this seems strange events: {event,} but we need
//       // this to match the structure of the database so when we replay these received
//       // events or events from the db they have the same structure...what we probably
//       // want to do actually is rename the event property of event to xml or something
//       this.ggbApplet.registerAddListener(this.eventListener)
//     })
//   }
// }
//
// @TODO IM thinking we should use shouldupdate instead??? thoughts??
// or takesnapshot or whatever its called -- this seems BAD
// shouldComponentUpdate(nextProps, nextState) {
//   // checking that this props and the incoming props are both replayin
//   // ensures that this is not the first time we received
//   if (nextProps.replaying && this.props.replaying) {
//     this.ggbApplet.setXML(this.props.room.events[this.props.eventIndex].event)
//     return true;
//   }
//   if (!nextProps.replaying && this.props.replaying) {
//     const events = nextProps.room.events;
//     this.ggbApplet.setXML(events[events.length - 1].event)
//     return true;
//   }
//   if (!nextProps.room.events !== this.props.room.events) {
//     return true;
//   }
//   else return false;
// }
