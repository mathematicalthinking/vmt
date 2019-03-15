import React, { Component } from "react";
import { Aux, Modal } from "../../Components";
import Message from "./Message";
import Event from "./Event";
// import TextInput from '../Form/TextInput/TextInput';
import classes from "./chat.css";
// import Button from '../UI/Button/Button';
import moment from "moment";
class Chat extends Component {
  // We need this construcotr, stop deleting it...look @ line29
  constructor(props) {
    super(props);

    this.state = {
      containerCoords: null,
      chatCoords: null,
      chatInputCoords: null,
      settings: false,
      showVMTBot: true
      // expanded: true,
    };
    this.chatContainer = React.createRef();
    this.chatInput = React.createRef();
    this.chatEnd = React.createRef();

    // Create a ref for each chat element so they can be used with the referencing tool
    // This is why we needed to have a constructor function
    this.props.messages.forEach((message, i) => {
      this[`message-${i}`] = React.createRef();
    });
  }

  toggleExpansion = () => {
    this.props.toggleExpansion("chat");
    //start counting all unread messages once chat window is collapsed?
    // this.setState({
    //   expanded: !this.state.expanded
    // });
  };

  componentDidMount() {
    window.addEventListener("resize", this.updateOnResize);
    window.addEventListener("keypress", this.onKeyPress);
    if (!this.props.replayer) this.chatInput.current.focus();
    this.setState({
      containerCoords: this.chatContainer.current.offsetParent.getBoundingClientRect(),
      chatCoords: this.chatContainer.current.getBoundingClientRect(),
      chatInputCoords: this.props.replayer
        ? null
        : this.chatInput.current.getBoundingClientRect()
    });
    this.scrollToBottom();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.messages.length !== this.props.messages.length) {
      // create a ref for the new element
      this[`message-${this.props.messages.length - 1}`] = React.createRef();
      this.scrollToBottom();
    } else if (!prevProps.referencing && this.props.referencing) {
      this.props.setFromElAndCoords(
        this.chatInput.current,
        this.getRelativeCoords(this.chatInput.current)
      );
    } else if (
      !prevProps.referToEl &&
      this.props.referToEl &&
      this.props.referencing
    ) {
      this.chatInput.current.focus();
    } else if (
      !prevProps.showingReference &&
      this.props.showingReference &&
      this.props.referToEl.elementType === "chat_message"
    ) {
      // set the coordinates of the refElement to proper ref
      let refMessage = this[`message-${this.props.referToEl.element}`].current;
      this.props.setToElAndCoords(null, this.getRelativeCoords(refMessage));
    } else if (
      !prevProps.referenceElementCoords &&
      this.props.referenceElementCoords &&
      this.props.referenceElement.elementType === "chat_message"
    ) {
    }
  }

  componentWillUnmount() {
    window.removeEventListener("keypress", this.onKeyPress);
    window.removeEventListener("resize", this.updateOnResize);
  }

  onKeyPress = event => {
    if (event.key === "Enter") {
      this.props.submit();
    }
  };

  // Updaye on resize
  updateOnResize = () => {
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
    this.resizeTimer = setTimeout(() => {
      if (this.props.showingReference || this.props.referencing) {
        this.setState(
          {
            containerCoords: this.chatContainer.current.offsetParent.getBoundingClientRect(),
            chatCoords: this.chatContainer.current.getBoundingClientRect(),
            chatInputCoords: this.chatInput.current.getBoundingClientRect()
          },
          () => {
            this.updateReferencePositions();
          }
        );
      }
      this.resizeTimer = undefined;
    }, 200);
  };

  scrollToBottom = () => {
    this.chatEnd.current.scrollTop = this.chatEnd.current.scrollHeight;
    // window.scroll({top: this.containerRef.current.offsetTop - 100, left: 0, behavior: 'smooth'})
  };

  showReference = (event, reference, tab) => {
    // If we're already showing this reference clear the reference
    if (
      this.props.showReference &&
      this.props.referToEl &&
      reference.element === this.props.referToEl.element
    ) {
      this.props.clearReference();
    }
    // else if (this.props.referenceElement.elementType === 'chat_message') {
    //   console.log(this.props.referenceElement)
    // }
    else {
      let fromCoords = this.getRelativeCoords(event.target);
      let toCoords;
      if (reference.elementType === "chat_message") {
        toCoords = this.getRelativeCoords(
          this[`message-${reference.element}`].current
        );
      }
      this.props.showReference(
        reference,
        toCoords,
        event.currentTarget.id,
        fromCoords,
        tab
      );
    }
  };

  getRelativeCoords = target => {
    let messageCoords = target.getBoundingClientRect(); // RENAME THIS ...THIS IS THE CHAT MESSAGE OR CHAT
    let left = this.state.chatCoords.left - this.state.containerCoords.left;
    let top = messageCoords.top - this.state.containerCoords.top;
    if (messageCoords.top > this.state.chatInputCoords.bottom) {
      top = this.state.chatInputCoords.bottom - this.state.containerCoords.top;
    } else if (messageCoords.bottom < this.state.containerCoords.top) {
      top = this.state.chatCoords.top - this.state.containerCoords.top;
    }
    return { left, top };
  };

  // If the object being reference is a chat message (and not an element on the graph)
  referToMessage = (event, id) => {
    let position = this.getRelativeCoords(event.target);
    this.props.setToElAndCoords(
      { element: id, elementType: "chat_message" },
      position
    );
  };

  scrollHandler = event => {};

  updateReferencePositions = () => {
    // INSTEAD OF DOING ALL OF THIS WE COULD JUST SEE HOW THE SCROLL HAS CHANGED AND THEN KNOW HOW TO UPDATE THE DOM LINE?
    if (this.props.showingReference) {
      // Find and update the position of the referer
      // this.updateReference()
      this.props.setFromElAndCoords(
        null,
        this.getRelativeCoords(
          this[`message-${this.props.referFromEl}`].current
        )
      );
      if (this.props.referToEl.elementType === "chat_message") {
        // Find and update the position of the reference
        let elementRef = this[`message-${this.props.referToEl.element}`]
          .current;
        this.props.setToElAndCoords(null, this.getRelativeCoords(elementRef));
      }
    } else if (
      this.props.referencing &&
      this.props.referToEl.elementType === "chat_message"
    ) {
      let elementRef = this[`message-${this.props.referToEl.element}`].current;
      this.props.setToElAndCoords(null, this.getRelativeCoords(elementRef));
    }
  };

  display_temporary_error = () => {
    alert("showing references is not available in the replayer yet");
  };

  render() {
    let {
      messages,
      log,
      replayer,
      change,
      submit,
      value,
      referencing,
      showingReference
    } = this.props;
    console.log(log);
    let displayMessages = [];
    if (log) {
      displayMessages = log.map((message, i) => {
        let highlighted = false;
        if (showingReference && this.props.referToEl) {
          if (
            parseInt(this.props.referToEl.element, 10) === i ||
            (message.reference &&
              this.props.referToEl.element === message.reference.element)
          ) {
            highlighted = true;
          }
        }
        if (message.messageType) {
          return (
            <Message
              message={message}
              key={message._id} // ?? no message._id ??
              ref={this[`message-${message._id}`]}
              click={() => {
                return !replayer
                  ? referencing
                    ? event => this.referToMessage(event, i)
                    : message.reference
                    ? event =>
                        this.showReference(
                          event,
                          message.reference,
                          message.tab
                        )
                    : null
                  : this.display_temporary_error;
              }}
              highlighted={highlighted}
              referencing={this.props.referencing}
            />
          );
        } else {
          return <Event event={message} key={message._id} />;
        }
      });
      // use this to scroll to the bottom
      // displayMessages.push(<div key='end' ref={this.chatEnd}></div>)
    }
    return (
      <Aux>
        <div
          className={
            this.props.expanded ? classes.Container : classes.CollapsedContainer
          }
          ref={this.chatContainer}
        >
          <h3 className={classes.Title} onClick={this.toggleExpansion}>
            Chat
            {!this.props.replayer ? (
              <div className={classes.Status}>
                <i
                  className={[
                    "fas fa-wifi",
                    this.props.isConnected
                      ? classes.Connected
                      : classes.Disconnected
                  ].join(" ")}
                />
                <div className={classes.StatusText}>
                  {this.props.isConnected ? "" : "disconnected!"}
                </div>
                <i
                  onClick={() => this.setState({ settings: true })}
                  className={["fas fa-cog", classes.Settings].join(" ")}
                />
              </div>
            ) : null}
          </h3>
          <div
            className={
              this.props.expanded ? classes.ChatScroll : classes.Collapsed
            }
            ref={this.chatEnd}
            onScroll={this.updateReferencePositions}
            id="scrollable"
          >
            {displayMessages}
          </div>
          {!replayer ? (
            <div className={classes.ChatInput}>
              <input
                ref={this.chatInput}
                className={classes.Input}
                type={"text"}
                onChange={change}
                value={value}
              />
              {/* <TextInput width={"90%"} size={20} light autoComplete="off" change={change} type='text' name='message' value={value}/> */}
              <div className={classes.Send} onClick={submit}>
                <i className={"fab fa-telegram-plane"} />
              </div>
            </div>
          ) : null}
        </div>
        {this.state.settings ? (
          <Modal
            show={this.state.settings}
            closeModal={() => this.setState({ settings: false })}
          >
            Settings
          </Modal>
        ) : null}
      </Aux>
    );
  }
}

export default Chat;
