import React, { Component } from 'react';
// import TextInput from '../Form/TextInput/TextInput';
import classes from './chat.css';
// import Button from '../UI/Button/Button';
import SendIcon from './sendicon';
import moment from 'moment';
class Chat extends Component {
  constructor(props){
    super(props);
    this.chatContainer = React.createRef()
    this.chatInput = React.createRef()
    this.chatEnd = React.createRef()

    // Create a ref for each chat element so they can be used with the referencing tool
    this.props.messages.forEach((message, i) => {
      this[`message-${i}`] = React.createRef()
    })
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateReference)
    window.addEventListener('keypress', this.onKeyPress)
    if (!this.props.replayer) this.chatInput.current.focus();
    this.scrollToBottom();
  }

  componentDidUpdate(prevProps){
    if (prevProps.messages.length !== this.props.messages.length) {
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
    window.removeEventListener('resize', this.updateReference)
  }

  onKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.props.submit();
    }
  }

  updateReference = () => {
    if (this.props.showingReference || this.props.referencing) {
      this.props.setChatCoords(this.getRelativeCoords(this.state.chatReferenceElement))
    }
  }

  scrollToBottom = () => {
    this.chatEnd.current.scrollTop = this.chatEnd.current.scrollHeight;
    // window.scroll({top: this.containerRef.current.offsetTop - 100, left: 0, behavior: 'smooth'})
  }

  showReference = (event, reference) => {
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
      this.props.showReference(reference, toCoords, fromCoords)
    }
  }

  getRelativeCoords = (target) => {
    
    let messageCoords = target.getBoundingClientRect(); // RENAME THIS ...THIS IS THE CHAT MESSAGE OR CHAT 
    let parentCoords = target.offsetParent.getBoundingClientRect() // HOW EXPENSIVE ARE THESE  ? CAUSE THEY ONLY CHANGE ON RESIZE BUT WE"RE RECULACULATING ON SCROLL
    let containerCoords = this.chatEnd.current.getBoundingClientRect() // we could do this somewhere else 
    let left = containerCoords.left - parentCoords.left
    let top = messageCoords.top - parentCoords.top;
    // if (inputCoords.top > containerCoords.bottom) {
    //   // top = containerCoords.bottom;
    // }
    return ({left, top,})
  }

  // If the object being reference is a chat message (and not an element on the graph)
  referToMessage = (event, id) => {
    let position = this.getRelativeCoords(event.target);
    this.props.setToElAndCoords({element: id, elementType: 'chat_message'}, position)
  }

  scrollHandler = (event) => {
    // INSTEAD OF DOING ALL OF THIS WE COULD JUST SEE HOW THE SCROLL HAS CHANGED AND THEN KNOW HOW TO UPDATE THE DOM LINE?
    if (this.props.showingReference) {
      // Find and update the position of the referer 
      // this.updateReference()
      if (this.props.referenceElement.elementType === 'chat_message') {
        // Find and update the position of the reference
        let elementRef = this[`message-${this.props.referToEl.element}`].current
        this.props.setToElAndCoords(null, this.getRelativeCoords(elementRef))
      }
    } 
    // else if (this.props.referencing && this.props.referenceElement.elementType === 'chat_message') {
    //   // Find and update the position of the reference
    // }
  }
  
  render() {
    const {messages, replayer, change, submit, value, referencing} = this.props;
    let displayMessages = [];
    if (messages) {
      displayMessages = messages.map((message, i) => {
        return (
          <div
            id={i} 
            key={i}
            ref={this[`message-${i}`]} 
            className={message.autogenerated ? classes.VmtBotEntry : classes.Entry } 
            onClick={
              referencing ? (event) => this.referToMessage(event, i) :  
              message.reference ? (event) => this.showReference(event, message.reference) : null
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
        <h3 className={classes.Title}>Chat</h3>
        <div className={classes.ChatScroll} ref={this.chatEnd} onScroll={this.scrollHandler} id='scrollable'>{displayMessages}</div>
        {!replayer ?
          <div className={classes.ChatInput}>
            <input ref={this.chatInput} className={classes.Input} type = {"text"} onChange={change} value={value}/>
            {/* <TextInput width={"90%"} size={20} light autoComplete="off" change={change} type='text' name='message' value={value}/> */}
            <div className={classes.Send} onClick={submit}>
              <SendIcon height='24' width='24' viewBox='0 0 24 24'/>
              </div>
          </div> : null
        }
      </div>
    )
  }
}

export default Chat;
