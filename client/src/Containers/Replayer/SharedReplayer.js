import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button, CurrentMembers, Error, Loading } from 'Components';
import { TabTypes } from 'Model';
import { WorkspaceLayout } from 'Layout';
import { dateAndTime } from 'utils';
import ReplayerControls from './ReplayerControls';
import ChatReplayer from './ChatReplayer';
import Clock from './Clock';
import Slider from './Slider';
import Settings from './Settings';
import Tabs from '../Workspace/Tabs';
import Tools from '../Workspace/Tools/Tools';
import buildReplayerLog from './SharedReplayer.utils';
import CreationModal from '../Workspace/Tools/CreationModal';

const PLAYBACK_FIDELITY = 100;
const INITIAL_STATE = {
  playing: false,
  playbackSpeed: 1,
  logIndex: 0,
  timeElapsed: 0, // MS
  absTimeElapsed: 0,
  changingIndex: false,
  currentMembers: [],
  activeMember: null,
  allTabsLoaded: false,
  startTime: '',
  loading: true,
  currentTabId: null,
  multipleTabTypes: false,
  isFullscreen: false,
  stopTime: null,
  showControls: true,
  errorMessage: null,
  isCreatingActivity: false,
  mathState: {},
  isSimplified: false,
};
class SharedReplayer extends Component {
  state = INITIAL_STATE;
  updatedLog = [];
  tabsLoaded = 0;
  endTime = 0;

  componentDidMount() {
    const { populatedRoom } = this.props;
    if (!populatedRoom.log || populatedRoom.log.length === 0) {
      this.setState({
        errorMessage: 'This room does not have any activity yet',
      });
    } else {
      document.addEventListener('webkitfullscreenchange', this.resizeListener);
      document.addEventListener('mozfullscreenchange', this.resizeListener);
      document.addEventListener('fullscreenchange', this.resizeListener);
      document.addEventListener('MSFullscreenChange', this.resizeListener);
      window.addEventListener('message', this.onEncMessage);
      // @TODO We should never populate the tabs events before getting here
      // we dont need them for the regular room activity only for playback
      this.buildReplayerLog();
      this._setInitialMathState();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { encompass, updateEnc } = this.props;
    const {
      playing,
      changingIndex,
      logIndex,
      timeElapsed,
      stopTime,
    } = this.state;

    // Once we've fetched the room, build a log of all the events by combining all of the events from each tab
    // in chornological order
    // if (!encompass && prevProps.loading && !loading) {
    //   this.buildReplayerLog();
    // }

    // if (encompass && prevProps.populatedRoom._id !== populatedRoom._id) {
    //   // eslint-disable-next-line react/no-did-update-set-state
    //   this.setState({ ...INITIAL_STATE, loading: false }, () => {
    //     this.buildReplayerLog();
    //   });
    // }

    if (encompass) {
      if (
        prevState.playing !== playing ||
        (!prevState.playing && changingIndex)
      ) {
        updateEnc('VMT_UPDATE_REPLAYER', this.state, this.relativeDuration);
      }
    }

    if (stopTime && playing) {
      // if stopTime was set (encompass selection was clicked on)
      // check if replayer has reached end of selection
      if (timeElapsed >= stopTime) {
        // stop replayer and clear stopTime if done
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ playing: false, stopTime: null });
      }
    }

    if (!prevState.playing && playing && logIndex < this.updatedLog.length) {
      // switched from stopped to playing
      this.playing();
    } else if (!playing && this.interval) {
      // switched from playing to stopped
      clearInterval(this.interval);
    }
    if (prevState.logIndex !== logIndex) {
      this.setActiveMember(this.updatedLog[logIndex] || {});
    }
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.onEncMessage);
    if (this.interval) {
      clearInterval(this.interval);
    }
    document.removeEventListener('webkitfullscreenchange', this.resizeListener);
    document.removeEventListener('mozfullscreenchange', this.resizeListener);
    document.removeEventListener('fullscreenchange', this.resizeListener);
    document.removeEventListener('MSFullscreenChange', this.resizeListener);
  }

  buildReplayerLog = () => {
    this.updatedLog = [];
    this.tabsLoaded = 0;
    const { populatedRoom } = this.props;
    const { updatedLog, relativeDuration, endTime } = buildReplayerLog(
      populatedRoom.log,
      populatedRoom.tabs
    );
    this.updatedLog = updatedLog;
    this.relativeDuration = relativeDuration;
    this.endTime = endTime;
    this.setState({
      startTime: dateAndTime.toDateTimeString(this.updatedLog[0].timestamp),
      currentMembers: [this.updatedLog[0].user],
      currentTabId: this.updatedLog[0].tab,
    });
    this.setState({ loading: false });
  };

  beginCreatingActivity = () => {
    // create a new activity that belongs to the current user
    // const { tabs } = this.state;
    this.setState({
      isCreatingActivity: true,
    });
  };

  closeCreate = () => {
    this.setState({
      isCreatingActivity: false,
    });
  };

  playing = () => {
    // eslint-disable-next-line consistent-return
    this.interval = setInterval(() => {
      const { currentMembers, playbackSpeed } = this.state;
      const { populatedRoom } = this.props;
      let {
        timeElapsed,
        logIndex,
        startTime,
        absTimeElapsed,
        currentTabId,
      } = this.state;
      let updatedMembers = [...currentMembers];
      timeElapsed += PLAYBACK_FIDELITY * playbackSpeed;
      absTimeElapsed += PLAYBACK_FIDELITY * playbackSpeed;
      const nextEvent = this.updatedLog[logIndex + 1];
      if (!nextEvent) {
        return this.setState({ playing: false });
      }
      if (timeElapsed >= nextEvent.relTime) {
        // WHAT IF ITS GREAT THAN THE NEXT...NEXT EVENT (THIS HAPPENS WHEN WE INCREASE THE PLAY SPEED) ???? NOT SURE HOW TO HANDLE
        if (nextEvent.tab) {
          populatedRoom.tabs.forEach((tab) => {
            if (tab._id === nextEvent.tab) {
              currentTabId = tab._id;
            }
          });
        }
        logIndex += 1;
        if (nextEvent.autogenerated) {
          if (nextEvent.text.includes('joined')) {
            if (!updatedMembers.some((mem) => mem._id === nextEvent.user._id)) {
              updatedMembers.push(nextEvent.user);
            }
          } else if (nextEvent.text.includes('left')) {
            updatedMembers = updatedMembers.filter((u) => {
              if (!u) return false;
              return u._id !== nextEvent.user._id;
            });
          }
        }
        if (this.updatedLog[logIndex].synthetic) {
          startTime = dateAndTime.toDateTimeString(nextEvent.timestamp);
          absTimeElapsed = 0;
        }
      }
      this.setState({
        logIndex,
        timeElapsed,
        startTime,
        absTimeElapsed,
        currentTabId,
        changingIndex: false,
        currentMembers: updatedMembers,
      });
    }, PLAYBACK_FIDELITY);
  };

  setTabLoaded = () => {
    const { populatedRoom, encompass, updateEnc } = this.props;
    this.tabsLoaded += 1;
    if (this.tabsLoaded === populatedRoom.tabs.length) {
      this.setState({ allTabsLoaded: true }, () => {
        if (encompass) {
          // let encompass know the room / ggbApplet has finished loading
          updateEnc('VMT_ON_REPLAYER_LOAD', this.state, this.relativeDuration);
        }
      });
    }
  };

  // records latest math state per tab
  setMathState = (newState) => {
    const { currentTabId } = this.state;
    this.setState((prevState) => ({
      mathState: { ...prevState.mathState, [currentTabId]: newState },
    }));
  };

  // sets starting point for math states from each tab
  _setInitialMathState = () => {
    const { populatedRoom } = this.props;
    populatedRoom.tabs.forEach((tab) => {
      if (tab.tabType === 'geogebra' || tab.tabType === 'pyret') {
        this.setState({
          mathState: { [tab._id]: tab.startingPointBase64 || tab.desmosLink },
        });
      } else if (tab.tabType === 'desmos') {
        this.setState({
          mathState: { [tab._id]: tab.startingPoint },
        });
      }
    });
  };

  // Takes a % of total progress and goes to the nearest timestamp
  goToTime = (percent, doAutoPlay = false, stopTime = null) => {
    const { populatedRoom } = this.props;
    let { currentTabId } = this.state;
    let logIndex;
    let timeElapsed = percent * this.relativeDuration;
    if (percent === 1) {
      // I.e. if 100% then go to the last event
      logIndex = this.updatedLog.length - 1;
      timeElapsed = this.relativeDuration;
    } else {
      this.updatedLog.some((entry, i) => {
        if (entry.relTime > timeElapsed) {
          logIndex = i === 0 ? 0 : i - 1;
          return true;
        }
        return false;
      });
    }
    if (populatedRoom.tabs) {
      populatedRoom.tabs.forEach((tab) => {
        if (this.updatedLog[logIndex]) {
          if (tab._id === this.updatedLog[logIndex].tab) {
            currentTabId = tab._id;
          }
        }
      });
    }

    const { logIndex: previousIndex } = this.state;
    const updatedMembers = this.deriveCurrentMembers(previousIndex, logIndex);
    this.setState({
      timeElapsed,
      currentMembers: updatedMembers,
      logIndex,
      currentTabId,
      playing: doAutoPlay,
      stopTime,
      changingIndex: true,
    });
    // setTimeout(() => this.setState({playing:}))
  };

  deriveCurrentMembers = (startIndex, endIndex) => {
    const { currentMembers } = this.state;
    let updatedMembers = [...currentMembers];
    if (endIndex - startIndex > 0) {
      for (let i = startIndex + 1; i <= endIndex; i++) {
        const nextEvent = this.updatedLog[i];
        if (nextEvent.autogenerated) {
          if (nextEvent.text.includes('joined')) {
            updatedMembers.push(nextEvent.user);
          } else if (nextEvent.text.includes('left')) {
            updatedMembers = updatedMembers.filter((u) => {
              if (!u) return false;
              return u._id !== nextEvent.user._id;
            });
          }
        }
      }
    } else {
      for (let i = startIndex - 1; i >= endIndex; i--) {
        const nextEvent = this.updatedLog[i];
        if (nextEvent.autogenerated) {
          if (nextEvent.text.includes('left')) {
            updatedMembers.push(nextEvent.user);
          } else if (nextEvent.text.includes('joined')) {
            updatedMembers = updatedMembers.filter((u) => {
              if (!u) return false;
              return u._id !== nextEvent.user._id;
            });
          }
        }
      }
    }
    return updatedMembers;
  };

  pausePlay = () => {
    this.setState((prevState) => ({
      playing: !prevState.playing,
    }));
  };

  reset = () => {
    this.setState({ changingIndex: false });
  };

  resizeListener = () => {
    // Hitting the escape key when in full screen mode causes
    // this.state.isFullscreen to remain true. This gets them back in sync
    const { isFullscreen } = this.state;
    if (!document.fullscreenElement && isFullscreen) {
      this.setState({ isFullscreen: false });
    }
  };

  setCurrentMembers = () => {
    const { currentMembers } = this.state;
    this.setState({ currentMembers });
  };

  setSpeed = (speed) => {
    this.setState({ playbackSpeed: speed });
  };

  changeTab = (id) => {
    // why is this a promise?
    return new Promise((resolve) => {
      this.setState({ currentTabId: id }, () => {
        resolve();
      });
    });
  };

  goBack = () => {
    const { history } = this.props;
    if (history.length > 1) {
      // go back to the previous screen, if there is one
      history.goBack();
    } else {
      // if no previous screen, we're in a separately opened window or tab
      window.close();
    }
  };

  toggleFullscreen = () => {
    const { isFullscreen } = this.state;
    if (isFullscreen) {
      document.exitFullscreen().then(() => {
        this.setState({ isFullscreen: false });
      });
    } else {
      this.setState({
        isFullscreen: true,
      });
    }
  };

  toggleSimpleChat = () => {
    this.setState((prevState) => ({
      isSimplified: !prevState.isSimplified,
    }));
  };

  setActiveMember = (evnt) => {
    const { activeMember } = this.state;
    // if a member takes control, set them as active
    if (evnt.messageType === 'TOOK_CONTROL') {
      // console.log('Setting member: ', evnt.user && evnt.user._id);
      this.setState({ activeMember: evnt.user && evnt.user._id });
      // if there is a mathspace event, noted by a description, the user who did it was in control
    } else if (evnt.description) {
      this.setState({ activeMember: evnt.user && evnt.user._id });
    } else if (
      // if the active user leaves or released control, reset the activeMember
      (evnt.messageType === 'RELEASED_CONTROL' ||
        evnt.messageType === 'LEFT_ROOM') &&
      activeMember === evnt.user._id
    ) {
      this.setState({ activeMember: null });
    }

    // if the replayer jumps ahead or back, look for mathspace interactions and set active from that
  };

  onEncMessage = (event) => {
    const allowedOrigin = window.location.origin;
    const { origin, data } = event;
    if (allowedOrigin !== origin) {
      return;
    }

    const { messageType } = data;
    if (messageType === 'VMT_PAUSE_REPLAYER') {
      // pause replayer
      this.setState({ playing: false });
    } else if (messageType === 'VMT_GO_TO_TIME') {
      const { timeElapsed, doAutoPlay, stopTime } = data;

      if (typeof timeElapsed === 'number') {
        // is this the best way to set time?
        // or should we just set this.state.timeElapsed?
        const percentage = timeElapsed / this.relativeDuration;
        this.goToTime(percentage, doAutoPlay, stopTime);
      }
    }
  };

  render() {
    const { populatedRoom, encompass, user } = this.props;
    const {
      playing,
      playbackSpeed,
      logIndex,
      timeElapsed,
      startTime,
      changingIndex,
      isFullscreen,
      showControls,
      currentTabId,
      currentMembers,
      allTabsLoaded,
      errorMessage,
      isCreatingActivity,
      mathState,
      isSimplified,
      activeMember,
    } = this.state;
    if (errorMessage) {
      return (
        <Error fullPage>
          <h2>This room does not have any activity to replay yet</h2>
          <Button theme="Danger" click={this.goBack}>
            Go Back
          </Button>
        </Error>
      );
    }
    if (this.updatedLog.length === 0) {
      return <Loading message="Preparing the replayer..." />;
    }
    const replayer = (
      <ReplayerControls
        playing={playing}
        pausePlay={this.pausePlay}
        speed={playbackSpeed}
        setSpeed={this.setSpeed}
        index={logIndex}
        log={this.updatedLog}
        goToTime={this.goToTime}
        reset={this.reset}
        duration={this.relativeDuration || 0}
        settings={
          <Settings
            setSpeed={this.setSpeed}
            speed={playbackSpeed}
            settingsHidden={!showControls}
            isFullscreen={isFullscreen}
            toggleFullscreen={this.toggleFullscreen}
          />
        }
        slider={
          <Slider
            data-testid="new-reference"
            progress={(timeElapsed / this.relativeDuration) * 100}
            log={this.updatedLog}
            duration={this.relativeDuration || 0}
            playing={playing}
            goToTime={this.goToTime}
          />
        }
        clock={
          <Clock
            startTime={startTime}
            playing={playing}
            duration={this.relativeDuration || 0}
            relTime={timeElapsed}
            changingIndex={changingIndex}
          />
        }
      />
    );

    const chat = (
      <ChatReplayer
        roomId={populatedRoom._id}
        log={this.updatedLog}
        index={logIndex}
        isSimplified={isSimplified}
        changingIndex={changingIndex}
        reset={this.reset}
        setCurrentMembers={this.setCurrentMembers}
      />
    );
    const graphs = populatedRoom.tabs.map((tab, i) => (
      <TabTypes.MathspaceReplayer
        type={tab.tabType}
        log={this.updatedLog}
        index={logIndex}
        changingIndex={changingIndex}
        playing={playing}
        reset={this.reset}
        changeTab={this.changeTab}
        currentTabId={currentTabId}
        setTabLoaded={this.setTabLoaded}
        tab={tab}
        key={tab._id}
        tabId={i}
        isFullscreen={isFullscreen}
        inView={currentTabId === tab._id}
        style={{
          pointerEvents: 'none',
        }}
        setMathState={this.setMathState}
      />
    ));
    return (
      <Fragment>
        <div>{isFullscreen}</div>
        <WorkspaceLayout
          graphs={graphs}
          // user={user}
          chat={this.updatedLog.length > 0 ? chat : null}
          tabs={
            <Tabs
              tabs={populatedRoom.tabs}
              currentTabId={currentTabId}
              onChangeTab={this.changeTab}
            />
          }
          currentMembers={
            currentMembers.length > 0 ? (
              <CurrentMembers
                members={populatedRoom.members}
                currentMembers={currentMembers}
                expanded
                activeMember={activeMember}
                inControl={activeMember}
              />
            ) : null
          }
          bottomLeft={replayer}
          // activeMember={event.user}  // not used in Layout
          replayerControls={replayer}
          currentTabId={currentTabId}
          roomName={`${populatedRoom.name} Replayer`}
          bottomRight={
            // 21 Sep 2022: note that Tools no longer needs a replayer prop. Instead, we just don't give event props for buttons that shouldn't appear.
            <Tools
              onClickExit={this.goBack}
              lastEvent={this.updatedLog[logIndex]}
              onClickCreateTemplate={this.beginCreatingActivity}
              isSimplified={isSimplified}
              onToggleSimpleChat={this.toggleSimpleChat}
              exitText="Exit Replayer"
            />
          }
          replayer
          loaded={allTabsLoaded}
          isFullscreen={isFullscreen}
          membersExpanded
          chatExpanded
          instructionsExpanded
          encompass={encompass}
        />
        {isCreatingActivity && (
          <CreationModal
            closeModal={this.closeCreate}
            isCreatingActivity
            populatedRoom={populatedRoom}
            currentTabs={populatedRoom.tabs || []}
            user={user}
            mathState={mathState}
            currentTabId={currentTabId}
          />
        )}
        {!allTabsLoaded && this.updatedLog.length > 0 ? (
          <Loading message="Preparing the replayer..." />
        ) : null}
      </Fragment>
    );
  }
}

SharedReplayer.propTypes = {
  encompass: PropTypes.bool,
  // match: PropTypes.shape({}).isRequired,
  populatedRoom: PropTypes.shape({
    _id: PropTypes.string,
    log: PropTypes.arrayOf(PropTypes.shape({})),
    members: PropTypes.arrayOf(PropTypes.shape({})),
    name: PropTypes.string,
    tabs: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
  user: PropTypes.shape({}).isRequired,
  updateEnc: PropTypes.func,
  history: PropTypes.shape({
    length: PropTypes.number,
    goBack: PropTypes.func,
    push: PropTypes.func,
  }).isRequired,
};

SharedReplayer.defaultProps = {
  encompass: false,
  updateEnc: null,
};

export default SharedReplayer;
