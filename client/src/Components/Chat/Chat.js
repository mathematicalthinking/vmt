/* eslint-disable react/no-did-update-set-state */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import find from 'lodash/find';
// import Modal from '../UI/Modal/Modal';
import Message from './Message';
import Event from './Event';
import Pending from './Pending';
import classes from './chat.css';
import DropdownMenuClasses from '../../Layout/Dashboard/MainContent/dropdownmenu.css';
import Button from '../UI/Button/Button';

class Chat extends Component {
  // We need this construcotr, stop deleting it...look @ line29
  constructor(props) {
    super(props);
    const { log, chatInput } = this.props;
    this.state = {
      containerCoords: null,
      chatCoords: null,
      chatInputCoords: null,
      highlightedMessage: null,
      // settings: false,
      hasNewMessages: false,
      lastTimestamp: '',
    };
    this.chatContainer = React.createRef();
    this.chatInput = chatInput || React.createRef();
    this.chatEnd = React.createRef();
    // Create a ref for each chat element so they can be used with the referencing tool
    // This is why we needed to have a constructor function
    log.forEach((message) => {
      this[`message-${message._id}`] = React.createRef();
    });

    this.debouncedUpdateCoords = debounce(this.updateCoords, 200);
  }

  componentDidMount() {
    const { replayer } = this.props;
    window.addEventListener('resize', this.updateCoords);
    window.addEventListener('scroll', this.debouncedUpdateCoords);
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
      isSimplified,
      replayer,
    } = this.props;
    if (prevProps.log.length !== log.length) {
      // create a ref for the new element
      if (log.length) {
        const ts = new Date(log[log.length - 1].timestamp);
        this[`message-${log[log.length - 1]._id}`] = React.createRef();
        this.setState({ lastTimestamp: ts.toTimeString().split(' ')[0] });
      }
      if (this.nearBottom()) this.scrollToBottom();
      else this.setState({ hasNewMessages: true });
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
    } else if (prevProps.referencing && !referencing) {
      this.setState({ highlightedMessage: null });
    } else if (prevProps.showingReference && !showingReference) {
      // need to set the from el to the chatinput just as if we started referencing
      setFromElAndCoords(
        this.chatInput.current,
        this.getRelativeCoords(this.chatInput.current)
      );
    }

    // if the view is switched, always scroll to the bottom after updating
    if (prevProps.isSimplified !== isSimplified) {
      this.scrollToBottom();
    }
    // if we are in replayer and skip ahead, scroll to bottom
    if (replayer && prevProps.changingIndex) {
      this.scrollToBottom();
    }

    // if we have a new pending user and are near bottom, scroll to bottom to not cover messages
    // if (!replayer) {
    //   if (
    //     Object.keys(prevProps.pendingUsers).length <
    //     Object.keys(pendingUsers).length
    //   ) {
    //     if (this.nearBottom()) {
    //       this.scrollToBottom();
    //     }
    //   }
    // }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateCoords);
    window.removeEventListener('scroll', this.debouncedUpdateCoords);
  }

  updateCoords = () => {
    const { replayer } = this.props;
    if (!this.chatContainer.current) return;
    this.setState({
      containerCoords: this.chatContainer.current.offsetParent
        ? this.chatContainer.current.offsetParent.getBoundingClientRect()
        : null,
      chatCoords: this.chatContainer.current.getBoundingClientRect(),
      chatInputCoords: replayer
        ? null
        : this.chatInput.current.getBoundingClientRect(),
    });
  };
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

  scrollToBottom = () => {
    this.chatEnd.current.scrollTop = this.chatEnd.current.scrollHeight;
    // window.scroll({top: this.containerRef.current.offsetTop - 100, left: 0, behavior: 'smooth'})
  };

  nearBottom = () => {
    const chat = this.chatEnd.current;
    return (
      chat.scrollHeight - Math.floor(chat.scrollTop) - chat.clientHeight - 100 <
      0
    );
  };

  clearNewMessages = () => {
    this.setState({ hasNewMessages: false });
  };

  showReference = (event, reference, messageId) => {
    const {
      showReference,
      referToEl,
      clearReference,
      referencing,
      referFromEl,
    } = this.props;
    // If we're already showing this reference clear the reference
    if (showReference && referToEl && messageId === referFromEl) {
      // if referencing was already on, no reason to turn referencing off when hiding
      // a reference
      this.currentRefMessageId = null;
      clearReference({ doKeepReferencingOn: referencing });
    } else {
      const fromCoords = this.getRelativeCoords(event.target);
      let toCoords;
      this.currentRefMessageId = messageId;
      if (reference.elementType === 'chat_message') {
        // escape hatch in case referenced message is not rendred in current display
        if (!this[`message-${reference.element}`].current) return;
        toCoords = this.getRelativeCoords(
          this[`message-${reference.element}`].current
        );
      }
      const updatedReference = this.findReference(reference, messageId);
      showReference(
        updatedReference,
        toCoords,
        event.currentTarget.id,
        fromCoords,
        reference.tab
      );
    }
  };

  getRelativeCoords = (target) => {
    const { chatCoords, containerCoords, chatInputCoords } = this.state;
    const messageCoords = target.getBoundingClientRect(); // RENAME THIS ...THIS IS THE CHAT MESSAGE OR CHAT
    const left = chatCoords.left - containerCoords.left; // + 10 to account for margin
    let top = messageCoords.top - containerCoords.top;
    if (messageCoords.top > chatInputCoords.bottom) {
      top = chatInputCoords.bottom - containerCoords.top - 37;
    } else if (messageCoords.bottom < containerCoords.top) {
      top = chatCoords.top - containerCoords.bottom + 10;
    }
    return { left, top };
  };

  // If the object being reference is a chat message (and not an element on the graph)
  referToMessage = (event, id) => {
    const { setToElAndCoords, showingReference, clearReference } = this.props;

    if (showingReference) {
      clearReference({ doKeepReferencingOn: true });
    }

    const position = this.getRelativeCoords(event.target);
    setToElAndCoords({ element: id, elementType: 'chat_message' }, position);
  };

  scrollHandler = () => {
    this.updateReferencePositions();
    if (this.nearBottom()) this.clearNewMessages();
  };

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
    const { replayer, startNewReference, referencing } = this.props;
    if (!replayer) {
      if (!referencing) {
        startNewReference();
      }
      this.setState({ highlightedMessage: message._id });
      this.referToMessage(event, message._id);
    } else {
      this.display_temporary_error();
    }
  };

  findReference = (reference, messageId) => {
    const { eventsWithRefs } = this.props;
    const found = find(eventsWithRefs, (ev) => {
      return ev._id === messageId;
    });

    return found.reference || reference;
  };

  createActivity = () => {
    const { createActivity } = this.props;
    // this.setState({ settings: false });
    createActivity();
  };

  openReplayer = () => {
    const { goToReplayer } = this.props;
    // this.setState({ settings: false });
    goToReplayer();
  };

  render() {
    const {
      log,
      replayer,
      change,
      submit,
      value,
      expanded,
      referToEl,
      referencing,
      isSimplified,
      user,
      startNewReference,
      goToReplayer,
      createActivity,
      pendingUsers,
      connectionStatus,
    } = this.props;
    const { highlightedMessage, hasNewMessages, lastTimestamp } = this.state;
    const DropdownMenu = () => {
      return (
        // eslint-disable-next-line
        <div
          className={DropdownMenuClasses.Container}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <i className="fas fa-bars" />

          <div className={DropdownMenuClasses.DropdownContent}>
            {goToReplayer ? (
              <div className={DropdownMenuClasses.DropdownItem}>
                <button
                  type="button"
                  className={classes.Button}
                  onClick={(e) => {
                    this.openReplayer();
                    e.stopPropagation();
                  }}
                  data-testid="open-replayer"
                >
                  Open Replayer
                  <span className={classes.ExternalLink}>
                    <i className="fas fa-external-link-alt" />
                  </span>
                </button>
              </div>
            ) : null}
            {createActivity ? (
              <div className={DropdownMenuClasses.DropdownItem}>
                <button
                  type="button"
                  className={classes.Button}
                  onClick={(e) => {
                    this.createActivity();
                    e.stopPropagation();
                  }}
                  data-testid="create-workspace"
                >
                  Create Template
                  {/* or Room */}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      );
    };

    let displayMessages = [];
    if (log) {
      displayMessages = log.map((message) => {
        let highlighted = false;
        let reference = false;
        if (message.reference) {
          reference = true;
        }
        if (referToEl) {
          if (
            referToEl.element === message._id ||
            message.tab ||
            (message.reference &&
              referToEl.element === message.reference.element)
          ) {
            highlighted = true;
          }
        } else if (message._id === highlightedMessage) {
          highlighted = true;
        }
        if (message.messageType) {
          if (!message._id) {
            // console.log('no id for message: ', message);
          }

          return (
            <Message
              key={message._id}
              message={message}
              id={message._id} // ?? no message._id ??
              ref={this[`message-${message._id}`]}
              onClick={(event) => this.messageClickHandler(event, message)}
              showReference={(event) =>
                this.showReference(event, message.reference, message._id)
              }
              highlighted={highlighted}
              reference={reference}
              referencing={referencing}
              isSimplified={isSimplified}
            />
          );
        }
        if (!isSimplified) {
          if (!message.synthetic) {
            // for replayer only. should not show up in chat, only slider
            return <Event event={message} id={message._id} key={message._id} />;
          }
        }
        return null;
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
            {!replayer ? (
              <div className={classes.DropdownContainer}>
                <DropdownMenu />{' '}
              </div>
            ) : null}
            Chat
            {!replayer ? (
              // eslint-disable-next-line
              <div
                className={classes.Status}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <i
                  className={[
                    'fas fa-wifi',
                    // user.connected ? classes.Connected : classes.Disconnected,
                    classes[connectionStatus],
                  ].join(' ')}
                  // title={`Connection: ${connectionStatus}`}
                />
                <div className={classes.StatusText}>
                  {user.connected ? '' : 'Disconnected!'}
                </div>
                <div className={classes.TooltipContent}>
                  {`Connection Status: ${connectionStatus}`}
                </div>
              </div>
            ) : null}
          </div>
          <div
            className={expanded ? classes.ChatScroll : classes.Collapsed}
            data-testid="chat"
            ref={this.chatEnd}
            onScroll={this.scrollHandler}
            id="scrollable"
          >
            {displayMessages}
            <div className={classes.Timestamp}>
              {isSimplified
                ? `End of log - last event ${lastTimestamp}`
                : 'End of log'}
            </div>
          </div>
          {hasNewMessages && (
            <Button click={this.scrollToBottom} theme="ntf" m="0 0 0 auto">
              New <i className="fas fa-arrow-down" />
            </Button>
          )}
          {!replayer ? (
            <Fragment>
              <div className={classes.ChatInput}>
                <Pending pendingUsers={pendingUsers} />

                <input
                  ref={this.chatInput}
                  className={classes.Input}
                  type="text"
                  onChange={change}
                  value={value}
                  onFocus={() => {
                    if (!referencing) {
                      startNewReference();
                    }
                  }}
                  disabled={user.inAdminMode}
                />
                {!user.inAdminMode ? (
                  <div
                    className={classes.Send}
                    onClick={submit}
                    onKeyPress={submit}
                    tabIndex="-2"
                    role="button"
                  >
                    <i className="fab fa-telegram-plane" />
                  </div>
                ) : null}
              </div>
            </Fragment>
          ) : null}
        </div>
        {/* {settings ? (
          <Modal
            show={settings}
            closeModal={() => this.setState({ settings: false })}
          >
            More Options
            <div className={classes.MoreMenu}>
              {goToReplayer ? (
                <div className={classes.MoreMenuOption}>
                  <Button click={this.openReplayer} data-testid="open-replayer">
                    Open Replayer
                    <span className={classes.ExternalLink}>
                      <i className="fas fa-external-link-alt" />
                    </span>
                  </Button>
                </div>
              ) : null}
              {createActivity ? (
                <div className={classes.MoreMenuOption}>
                  <Button
                    click={this.createActivity}
                    data-testid="create-workspace"
                  >
                    Create Activity or Room
                  </Button>
                </div>
              ) : null}
            </div>
          </Modal>
        ) : null} */}
      </Fragment>
    );
  }
}

// @todo we need to consider making a different component for replayer chat or conditionally requiring many of these props (like change and submit) if this is NOT a replayer chat
Chat.propTypes = {
  user: (props) => {
    const { replayer, user } = props;
    if (!replayer && !user) {
      return new Error('prop user is required when not in replayer mode');
    }
    return null;
  },
  toggleExpansion: PropTypes.func,
  referencing: PropTypes.bool,
  isSimplified: PropTypes.bool,
  referToEl: PropTypes.oneOfType([PropTypes.shape({}), PropTypes.string]),
  referFromEl: PropTypes.oneOfType([PropTypes.shape({}), PropTypes.string]),
  setFromElAndCoords: PropTypes.func,
  setToElAndCoords: PropTypes.func,
  showReference: PropTypes.func,
  clearReference: PropTypes.func,
  showingReference: PropTypes.bool,
  referenceElement: PropTypes.shape({}),
  change: PropTypes.func,
  value: PropTypes.string,
  startNewReference: PropTypes.func,
  replayer: PropTypes.bool,
  submit: PropTypes.func,
  log: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  expanded: PropTypes.bool.isRequired,
  chatInput: PropTypes.shape({ current: PropTypes.any }),
  eventsWithRefs: PropTypes.arrayOf(PropTypes.shape({})),
  goToReplayer: PropTypes.func,
  createActivity: PropTypes.func,
  pendingUsers: PropTypes.shape({}),
  connectionStatus: PropTypes.string,
  changingIndex: PropTypes.bool,
};

Chat.defaultProps = {
  user: null,
  toggleExpansion: null,
  referToEl: null,
  referFromEl: null,
  referenceElement: null,
  value: '',
  replayer: false,
  change: null,
  submit: null,
  referencing: false,
  isSimplified: true,
  setFromElAndCoords: null,
  setToElAndCoords: null,
  startNewReference: null,
  showReference: null,
  clearReference: null,
  showingReference: null,
  chatInput: null,
  eventsWithRefs: [],
  goToReplayer: null,
  createActivity: null,
  pendingUsers: null,
  connectionStatus: 'None',
  changingIndex: false,
};

export default Chat;
