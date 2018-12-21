import React, { Component } from 'react';
// import TextInput from '../Form/TextInput/TextInput';
import classes from './chat.css';
// import Button from '../UI/Button/Button';
import moment from 'moment';
class Chat extends Component {
  constructor(props){
    super(props);

    this.state = {
      containerCoords: null,
      chatCoords: null,
      chatInputCoords: null,
      expanded: true,
    }
    this.chatContainer = React.createRef()
    this.chatInput = React.createRef()
    this.chatEnd = React.createRef()

    // Create a ref for each chat element so they can be used with the referencing tool
    this.props.messages.forEach((message, i) => {
      this[`message-${i}`] = React.createRef()
    })
  }

  toggleCollapse() {
    //start counting all unread messages once chat window is collapsed?
    this.setState({
      expanded: !this.state.expanded
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateOnResize)
    window.addEventListener('keypress', this.onKeyPress)
    if (!this.props.replayer) this.chatInput.current.focus();
    this.setState({
      containerCoords: this.chatContainer.current.offsetParent.getBoundingClientRect(),
      chatCoords: this.chatContainer.current.getBoundingClientRect(),
      chatInputCoords: this.props.replayer ? null : this.chatInput.current.getBoundingClientRect(),
    })
    this.scrollToBottom();
  }

  componentDidUpdate(prevProps){
    if (prevProps.messages.length !== this.props.messages.length) {
      // create a ref for the new element
      this[`message-${this.props.messages.length - 1}`] = React.createRef();
      this.scrollToBottom();
    }
    else if (!prevProps.referencing && this.props.referencing) {
      this.props.setFromElAndCoords(this.chatInput.current, this.getRelativeCoords(this.chatInput.current))
    }
    else if (!prevProps.referToEl && this.props.referToEl && this.props.referencing) {
      this.chatInput.current.focus();
    }
    else if (!prevProps.showingReference && this.props.showingReference && this.props.referToEl.elementType === 'chat_message') {
      // set the coordinates of the refElement to proper ref
      let refMessage = this[`message-${this.props.referToEl.element}`].current
      this.props.setToElAndCoords(null, this.getRelativeCoords(refMessage))

    }
    else if (!prevProps.referenceElementCoords && this.props.referenceElementCoords && this.props.referenceElement.elementType === 'chat_message') {

    }
  }

  componentWillUnmount() {
    window.removeEventListener('keypress', this.onKeyPress)
    window.removeEventListener('resize', this.updateOnResize)
  }

  onKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.props.submit();
    }
  }

  // Updaye on resize
  updateOnResize = () => {
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer)
    }
    this.resizeTimer = setTimeout(() => {
      if (this.props.showingReference || this.props.referencing) {
        this.setState({
          containerCoords: this.chatContainer.current.offsetParent.getBoundingClientRect(),
          chatCoords: this.chatContainer.current.getBoundingClientRect(),
          chatInputCoords: this.chatInput.current.getBoundingClientRect(),
        }, () => {
          this.updateReferencePositions()
        })
      }
      this.resizeTimer = undefined;
    }, 200)
  }

  scrollToBottom = () => {
    this.chatEnd.current.scrollTop = this.chatEnd.current.scrollHeight;
    // window.scroll({top: this.containerRef.current.offsetTop - 100, left: 0, behavior: 'smooth'})
  }

  showReference = (event, reference, tab) => {
    // If we're already showing this reference clear the reference
    if (this.props.showReference && this.props.referToEl && (reference.element === this.props.referToEl.element)) {
      this.props.clearReference()
    }
    // else if (this.props.referenceElement.elementType === 'chat_message') {
    //   console.log(this.props.referenceElement)
    // }

    else {
      let fromCoords = this.getRelativeCoords(event.target);
      let toCoords;
      if (reference.elementType === 'chat_message') {
        toCoords  = this.getRelativeCoords(this[`message-${reference.element}`].current)

      }
      this.props.showReference(reference, toCoords, event.currentTarget.id, fromCoords, tab)
    }
  }

  getRelativeCoords = (target) => {
    let messageCoords = target.getBoundingClientRect(); // RENAME THIS ...THIS IS THE CHAT MESSAGE OR CHAT
    let left = this.state.chatCoords.left - this.state.containerCoords.left
    let top = messageCoords.top - this.state.containerCoords.top;
    if (messageCoords.top > this.state.chatInputCoords.bottom) {
      top = this.state.chatInputCoords.bottom - this.state.containerCoords.top
    }
    else if (messageCoords.bottom < this.state.containerCoords.top) {
      top = this.state.chatCoords.top - this.state.containerCoords.top
    }
    return ({left, top,})
  }

  // If the object being reference is a chat message (and not an element on the graph)
  referToMessage = (event, id) => {
    let position = this.getRelativeCoords(event.target);
    this.props.setToElAndCoords({element: id, elementType: 'chat_message'}, position)
  }

  scrollHandler = (event) => {

  }

  updateReferencePositions = () => {
     // INSTEAD OF DOING ALL OF THIS WE COULD JUST SEE HOW THE SCROLL HAS CHANGED AND THEN KNOW HOW TO UPDATE THE DOM LINE?
     if (this.props.showingReference) {
      // Find and update the position of the referer
      // this.updateReference()
      this.props.setFromElAndCoords(null, this.getRelativeCoords(this[`message-${this.props.referFromEl}`].current))
      if (this.props.referToEl.elementType === 'chat_message') {
        // Find and update the position of the reference
        let elementRef = this[`message-${this.props.referToEl.element}`].current
        this.props.setToElAndCoords(null, this.getRelativeCoords(elementRef))
      }
    }
    else if (this.props.referencing && this.props.referToEl.elementType === 'chat_message') {
      let elementRef = this[`message-${this.props.referToEl.element}`].current
      this.props.setToElAndCoords(null, this.getRelativeCoords(elementRef))
    }
  }

  display_temporary_error = () => {
    alert('showing references is not available in the replayer yet')
  }

  render() {
    let {
      messages, replayer, change,
      submit, value, referencing,
      showingReference,
    } = this.props;
    let displayMessages = [];
    if (messages) {
      displayMessages = messages.map((message, i) => {
        let highlightClass = '';
        if (showingReference && this.props.referToEl) {
          //@TODO DOUBLE EQUALS BELOW HERE IS INTENTIONAL. THIS NEEDS TO BE FIXED EVENTUALLY BUT FOR NOW,
          // WHEN WE MAKE THE INTIAL REFERENCE ELEMENT IS AN INT BUT WHEN WE SAVE IT TO THE DB OR IT COMES ACROSS THE SOCKET
          // IT IS A STRING...WE SHOULD JUST PARSE IT TO STRING ON CREATION REFERTOEL.ELEMENT
          if ((this.props.referToEl.element == i) || (message.reference && (this.props.referToEl.element === message.reference.element))) {
            highlightClass = classes.Highlight
          }
        }
        return (
          <div
            id={i}
            key={i}
            ref={this[`message-${i}`]}
            className={[message.autogenerated ? classes.VmtBotEntry : classes.Entry, highlightClass].join(" ")}
            onClick={
              !replayer ?
                referencing ? (event) => this.referToMessage(event, i) :
                message.reference ? (event) => this.showReference(event, message.reference, message.tab) : null
              : this.display_temporary_error
            }
            style={{cursor: message.reference || this.props.referencing ? 'pointer' : 'auto'}}
          >
            <div><b>{message.autogenerated ? 'VMTbot': message.user.username}: </b><span>{message.text}</span></div>
            {/* CONSIDER CONDITIONALLLY FORMATIING THE DATE BASED ON HOW FAR IN THE PAST IT IS
            IF IT WAS LAST WEEK, SAYING THE DAY AND TIME IS MISLEADING */}
            <div className={classes.Timestamp}>
              {moment.unix(message.timestamp/1000).format('ddd h:mm:ss a')}
            </div>
          </div>
        )
      })
      // use this to scroll to the bottom
      // displayMessages.push(<div key='end' ref={this.chatEnd}></div>)
    }
    return (
      <div className={classes.Container} ref={this.chatContainer}>
        <h3 className={classes.Title} onClick={this.toggleCollapse.bind(this)}>Chat
          <div className={classes.Status}>
            <svg height="20" width="20">
              <circle cx="10" cy="15" r="5" fill="#34A505"/>
            </svg>
          </div>
        </h3>
        <div className={(this.state.expanded ? classes.ChatScroll : classes.Collapsed)} ref={this.chatEnd} onScroll={this.updateReferencePositions} id='scrollable'>{displayMessages}</div>
        {!replayer ?
          <div className={classes.ChatInput}>
            <input ref={this.chatInput} className={classes.Input} type = {"text"} onChange={change} value={value}/>
            {/* <TextInput width={"90%"} size={20} light autoComplete="off" change={change} type='text' name='message' value={value}/> */}
            <div className={classes.Send} onClick={submit}>
              <i className={'fab fa-telegram-plane'}></i>
            </div>
          </div> : null
        }
      </div>
    )
  }
}

export default Chat;
