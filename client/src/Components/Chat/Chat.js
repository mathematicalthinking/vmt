import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Modal from '../UI/Modal/Modal';
import Message from './Message';
import Event from './Event';
import classes from './chat.css';

class Chat extends Component {
  // We need this construcotr, stop deleting it...look @ line29
  constructor(props) {
    super(props);
    const { log } = this.props;
    this.state = {
      containerCoords: null,
      chatCoords: null,
      chatInputCoords: null,
      settings: false,
    };
    this.chatContainer = React.createRef();
    this.chatInput = React.createRef();
    this.chatEnd = React.createRef();

    // Create a ref for each chat element so they can be used with the referencing tool
    // This is why we needed to have a constructor function
    log.forEach(message => {
      this[`message-${message._id}`] = React.createRef();
    });
  }

  componentDidMount() {
    const { replayer } = this.props;
    window.addEventListener('resize', this.updateOnResize);
    window.addEventListener('keypress', this.onKeyPress);
    if (!replayer) this.chatInput.current.focus();
    this.setState({
      containerCoords: this.chatContainer.current.offsetParent
        ? this.chatContainer.current.offsetParent.getBoundingClientRect()
        : null,
      chatCoords: this.chatContainer.current.getBoundingClientRect(),
      chatInputCoords: replayer
        ? null
        : this.chatInput.current.getBoundingClientRect(),
    });
    this.scrollToBottom();
  }

  componentDidUpdate(prevProps) {
    const {
      log,
      referencing,
      setFromElAndCoords,
      setToElAndCoords,
      referToEl,
      showingReference,
      // referenceElement,
      // referenceElementCoords,
    } = this.props;
    if (prevProps.log.length !== log.length) {
      // create a ref for the new element
      this[`message-${log[log.length - 1]._id}`] = React.createRef();
      this.scrollToBottom();
    } else if (!prevProps.referencing && referencing) {
      setFromElAndCoords(
        this.chatInput.current,
        this.getRelativeCoords(this.chatInput.current)
      );
    } else if (!prevProps.referToEl && referToEl && referencing) {
      this.chatInput.current.focus();
    } else if (
      !prevProps.showingReference &&
      showingReference &&
      referToEl.elementType === 'chat_message'
    ) {
      // set the coordinates of the refElement to proper ref
      const refMessage = this[`message-${referToEl.element}`].current;
      setToElAndCoords(null, this.getRelativeCoords(refMessage));
    }
    //  else if (
    //   !prevProps.referenceElementCoords &&
    //   referenceElementCoords &&
    //   referenceElement.elementType === 'chat_message'
    // ) {

    // }
  }

  componentWillUnmount() {
    window.removeEventListener('keypress', this.onKeyPress);
    window.removeEventListener('resize', this.updateOnResize);
  }

  toggleExpansion = () => {
    const { toggleExpansion } = this.props;
    if (toggleExpansion) {
      toggleExpansion('chat');
    }
    // start counting all unread messages once chat window is collapsed?
    // this.setState({
    //   expanded: !this.state.expanded
    // });
  };

  onKeyPress = event => {
    const { submit } = this.props;
    if (event.key === 'Enter') {
      submit();
    }
  };

  // Updaye on resize
  updateOnResize = () => {
    const { showingReference, referencing } = this.props;
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
    this.resizeTimer = setTimeout(() => {
      if (showingReference || referencing) {
        this.setState(
          {
            containerCoords: this.chatContainer.current.offsetParent.getBoundingClientRect(),
            chatCoords: this.chatContainer.current.getBoundingClientRect(),
            chatInputCoords: this.chatInput.current.getBoundingClientRect(),
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

  showReference = (event, reference) => {
    const { showReference, referToEl, clearReference } = this.props;
    // If we're already showing this reference clear the reference
    if (showReference && referToEl && reference.element === referToEl.element) {
      clearReference();
    }
    // else if (this.props.referenceElement.elementType === 'chat_message') {
    //   console.log(this.props.referenceElement)
    // }
    else {
      const fromCoords = this.getRelativeCoords(event.target);
      let toCoords;
      if (reference.elementType === 'chat_message') {
        toCoords = this.getRelativeCoords(
          this[`message-${reference.element}`].current
        );
      }
      showReference(
        reference,
        toCoords,
        event.currentTarget.id,
        fromCoords,
        reference.tab
      );
    }
  };

  getRelativeCoords = target => {
    const { chatCoords, containerCoords, chatInputCoords } = this.state;
    const messageCoords = target.getBoundingClientRect(); // RENAME THIS ...THIS IS THE CHAT MESSAGE OR CHAT
    const left = chatCoords.left - containerCoords.left + 10; // + 10 to account for margin
    let top = messageCoords.top - containerCoords.top;
    if (messageCoords.top > chatInputCoords.bottom) {
      top = chatInputCoords.bottom - containerCoords.top - 10;
    } else if (messageCoords.bottom < containerCoords.top) {
      top = chatCoords.top - containerCoords.top;
    }
    return { left, top };
  };

  // If the object being reference is a chat message (and not an element on the graph)
  referToMessage = (event, id) => {
    const { setToElAndCoords } = this.props;
    const position = this.getRelativeCoords(event.target);
    setToElAndCoords({ element: id, elementType: 'chat_message' }, position);
  };

  scrollHandler = () => {};

  updateReferencePositions = () => {
    const {
      showingReference,
      referencing,
      referToEl,
      referFromEl,
      setToElAndCoords,
      setFromElAndCoords,
    } = this.props;
    // INSTEAD OF DOING ALL OF THIS WE COULD JUST SEE HOW THE SCROLL HAS CHANGED AND THEN KNOW HOW TO UPDATE THE DOM LINE?
    if (showingReference) {
      // Find and update the position of the referer
      // this.updateReference()
      setFromElAndCoords(
        null,
        this.getRelativeCoords(this[`message-${referFromEl}`].current)
      );
      if (referToEl.elementType === 'chat_message') {
        // Find and update the position of the reference
        const elementRef = this[`message-${referToEl.element}`].current;
        setToElAndCoords(null, this.getRelativeCoords(elementRef));
      }
    } else if (
      referencing &&
      referToEl &&
      referToEl.elementType === 'chat_message'
    ) {
      const elementRef = this[`message-${referToEl.element}`].current;
      setToElAndCoords(null, this.getRelativeCoords(elementRef));
    }
  };

  // eslint-disable-next-line camelcase
  display_temporary_error = () => {
    // eslint-disable-next-line no-alert
    window.alert('showing references is not available in the replayer yet');
  };

  messageClickHandler = (event, message) => {
    const { replayer, referencing } = this.props;
    if (!replayer) {
      if (referencing) {
        this.referToMessage(event, message._id);
      } else if (message.reference)
        this.showReference(event, message.reference);
    } else {
      this.display_temporary_error();
    }
  };

  render() {
    const {
      // messages,
      log,
      replayer,
      change,
      submit,
      value,
      expanded,
      referToEl,
      referencing,
      user,
    } = this.props;
    const { settings } = this.state;
    console.log('user in chat layout: ', user);
    let displayMessages = [];
    if (log) {
      displayMessages = log.map(message => {
        let highlighted = false;
        if (referToEl) {
          if (
            referToEl.element === message._id ||
            message.tab ||
            (message.reference &&
              referToEl.element === message.reference.element)
          ) {
            highlighted = true;
          }
        }
        if (message.messageType) {
          return (
            <Message
              key={message._id}
              message={message}
              id={message._id} // ?? no message._id ??
              ref={this[`message-${message._id}`]}
              click={event => this.messageClickHandler(event, message)}
              highlighted={highlighted}
              referencing={referencing}
            />
          );
        }
        return <Event event={message} id={message._id} key={message._id} />;
      });
      // use this to scroll to the bottom
      // displayMessages.push(<div key='end' ref={this.chatEnd}></div>)
    }
    return (
      <Fragment>
        <div
          className={expanded ? classes.Container : classes.CollapsedContainer}
          ref={this.chatContainer}
        >
          <div
            className={classes.Title}
            onClick={this.toggleExpansion}
            onKeyPress={this.toggleExpansion}
            tabIndex="0"
            role="button"
          >
            Chat
            {!replayer ? (
              <div className={classes.Status}>
                <i
                  className={[
                    'fas fa-wifi',
                    user.connected ? classes.Connected : classes.Disconnected,
                  ].join(' ')}
                />
                <div className={classes.StatusText}>
                  {user.connected ? '' : 'disconnected!'}
                </div>
                <i
                  onClick={() => this.setState({ settings: true })}
                  onKeyPress={() => this.setState({ settings: true })}
                  className={['fas fa-cog', classes.Settings].join(' ')}
                  tabIndex="-1"
                  role="button"
                />
              </div>
            ) : null}
          </div>
          <div
            className={expanded ? classes.ChatScroll : classes.Collapsed}
            data-testid="chat"
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
                type="text"
                onChange={change}
                value={value}
              />
              {/* <TextInput width={"90%"} size={20} light autoComplete="off" change={change} type='text' name='message' value={value}/> */}
              <div
                className={classes.Send}
                onClick={submit}
                onKeyPress={submit}
                tabIndex="-2"
                role="button"
              >
                <i className="fab fa-telegram-plane" />
              </div>
            </div>
          ) : null}
        </div>
        {settings ? (
          <Modal
            show={settings}
            closeModal={() => this.setState({ settings: false })}
          >
            Settings
          </Modal>
        ) : null}
      </Fragment>
    );
  }
}

// @todo we need to consider making a different component for replayer chat or conditionally requiring many of these props (like change and submit) if this is NOT a replayer chat
Chat.propTypes = {
  user: PropTypes.shape({}).isRequired,
  toggleExpansion: PropTypes.func,
  referencing: PropTypes.bool,
  referToEl: PropTypes.shape({}),
  referFromEl: PropTypes.shape({}),
  setFromElAndCoords: PropTypes.func,
  setToElAndCoords: PropTypes.func,
  showReference: PropTypes.func,
  clearReference: PropTypes.func,
  showingReference: PropTypes.bool,
  referenceElement: PropTypes.shape({}),
  change: PropTypes.func,
  value: PropTypes.string,
  // referenceElementCoords: PropTypes.arrayOf(PropTypes.number),
  replayer: PropTypes.bool,
  submit: PropTypes.func,
  log: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  expanded: PropTypes.bool.isRequired,
};

Chat.defaultProps = {
  toggleExpansion: null,
  referToEl: null,
  referFromEl: null,
  referenceElement: null,
  value: '',
  replayer: false,
  change: null,
  submit: null,
  referencing: false,
  setFromElAndCoords: null,
  setToElAndCoords: null,
  showReference: null,
  clearReference: null,
  showingReference: null,
  // referenceElementCoords: [],
};

export default Chat;
