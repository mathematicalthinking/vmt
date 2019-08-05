import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import WorkspaceLayout from '../../Layout/Workspace/Workspace';
import ReplayerControls from './ReplayerControls';
import DesmosReplayer from './DesmosReplayer';
import GgbReplayer from './GgbReplayer';
import ChatReplayer from './ChatReplayer';
import Clock from './Clock';
import Slider from './Slider';
import Settings from './Settings';
import API from '../../utils/apiRequests';
import CurrentMembers from '../../Components/CurrentMembers/CurrentMembers';
import Loading from '../../Components/Loading/Loading';
import Tabs from '../Workspace/Tabs';
import Tools from '../Workspace/Tools/Tools';
import buildReplayerLog from './SharedReplayer.utils';
import buildLog from '../../utils/buildLog';

const PLAYBACK_FIDELITY = 100;
const INITIAL_STATE = {
  playing: false,
  playbackSpeed: 1,
  logIndex: 0,
  timeElapsed: 0, // MS
  absTimeElapsed: 0,
  changingIndex: false,
  currentMembers: [],
  allTabsLoaded: false,
  startTime: '',
  loading: true,
  currentTabId: null,
  multipleTabTypes: false,
  isFullscreen: false,
  stopTime: null,
  showControls: true,
};
class SharedReplayer extends Component {
  state = INITIAL_STATE;
  log = [];
  updatedLog = [];
  tabs = [];
  tabsLoaded = 0;
  endTime = 0;

  componentDidMount() {
    document.addEventListener('webkitfullscreenchange', this.resizeListener);
    document.addEventListener('mozfullscreenchange', this.resizeListener);
    document.addEventListener('fullscreenchange', this.resizeListener);
    document.addEventListener('MSFullscreenChange', this.resizeListener);
    // @TODO We should never populate the tabs events before getting here
    // we dont need them for the regular room activity only for playback
    const { encompass, room } = this.props;
    if (!encompass) {
      API.getPopulatedById('rooms', room._id, false, true)
        .then(res => {
          // creae a log combining events and chat messages
          const populatedRoom = res.data.result;
          this.tabs = populatedRoom.tabs;
          this.log = buildLog(populatedRoom.tabs, populatedRoom.chat);
          this.setState(
            {
              currentTabId: populatedRoom.tabs[0]._id,
            },
            () => {
              this.buildReplayerLog();
            }
          );
          // consider deleting tab.events and room.chat here since we have all of the information in the log now
          // dispatch(updatedRoom(id, room));
          // dispatch(loading.success());
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.log(err);
        });
    } else {
      this.buildLog();
      // listen for messages from encompasss
      window.addEventListener('message', this.onEncMessage);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { encompass, room, updateEnc } = this.props;
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

    if (encompass && prevProps.room._id !== room._id) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ ...INITIAL_STATE, loading: false }, () => {
        this.buildReplayerLog();
      });
    }

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
    // if (
    //   this.props.changingIndex && // UH OH THIS IS THE SAME NAME AS A PIECE OF STATE WHATS GOING HERE????
    //   this.log[this.props.index].tab !==
    //     this.props.tabs[this.props.currentTab]._id
    // ) {
    //   let tabStates = { ...this.state.tabState };
    //   tabStates[this.props.tabs[prevProps.currentTab]._id] = {
    //     construction: this.calculator.getState(),
    //     lastIndex: prevProps.index,
    //   };
    //   this.setState({ tabStates });
    //   // let startIndex;
    //   // if (tabStates[log[this.props.index].tab]) {
    //   //   startIndex = tabStates[log[this.props.index].tab].lastIndex;
    //   // }
    //   // else {startIndex = prevProps.index}
    //   let tabIndex;
    //   // find the target tab index
    //   this.props.tabs.forEach((tab, i) => {
    //     if (tab._id === this.props.log[this.props.index].tab) {
    //       tabIndex = i;
    //     }
    //   });
    //   // We've promisified changeTab() so we can ensure we wait for the state to be updated before proceeding
    //   this.props.changeTab(tabIndex);
    // }
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

    const { updatedLog, relativeDuration, endTime } = buildReplayerLog(
      this.log,
      this.tabs
    );
    this.updatedLog = updatedLog;
    this.relativeDuration = relativeDuration;
    this.endTime = endTime;
    this.setState({
      startTime: moment
        .unix(this.updatedLog[0].timestamp / 1000)
        .format('MM/DD/YYYY h:mm:ss A'),
      currentMembers: [this.updatedLog[0].user],
    });
    this.setState({ loading: false });
  };

  playing = () => {
    // eslint-disable-next-line consistent-return
    this.interval = setInterval(() => {
      const { currentMembers, playbackSpeed } = this.state;
      const { room } = this.props;
      let {
        timeElapsed,
        logIndex,
        startTime,
        absTimeElapsed,
        currentTab,
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
          room.tabs.forEach((tab, i) => {
            if (tab._id === nextEvent.tab) {
              currentTab = i;
            }
          });
        }
        logIndex += 1;
        if (nextEvent.autogenerated) {
          if (nextEvent.text.includes('joined')) {
            updatedMembers.push({ user: nextEvent.user });
          } else if (nextEvent.text.includes('left')) {
            updatedMembers = updatedMembers.filter(u => {
              return u.user._id !== nextEvent.user._id;
            });
          }
        }
        if (this.updatedLog[logIndex].synthetic) {
          startTime = moment(nextEvent.timestamp).format(
            'MM/DD/YYYY h:mm:ss A'
          );
          absTimeElapsed = 0;
        }
      }
      this.setState({
        logIndex,
        timeElapsed,
        startTime,
        absTimeElapsed,
        currentTab,
        changingIndex: false,
        currentMembers: updatedMembers,
      });
    }, PLAYBACK_FIDELITY);
  };

  setTabLoaded = () => {
    const { room, encompass, updateEnc } = this.props;
    this.tabsLoaded += 1;
    if (this.tabsLoaded === room.tabs.length) {
      this.setState({ allTabsLoaded: true }, () => {
        if (encompass) {
          // let encompass know the room / ggbApplet has finished loading
          updateEnc('VMT_ON_REPLAYER_LOAD', this.state, this.relativeDuration);
        }
      });
    }
  };

  // Takes a % of total progress and goes to the nearest timestamp
  goToTime = (percent, doAutoPlay = false, stopTime = null) => {
    const { room } = this.props;
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
    room.tabs.forEach(tab => {
      if (tab._id === this.updatedLog[logIndex].tab) {
        currentTabId = tab._id;
      }
    });
    this.setState({
      timeElapsed,
      logIndex,
      currentTabId,
      playing: doAutoPlay,
      stopTime,
      changingIndex: true,
    });
    // setTimeout(() => this.setState({playing:}))
  };

  pausePlay = () => {
    this.setState(prevState => ({
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

  setCurrentMembers = currentMembers => {
    this.setState({ currentMembers });
  };

  setSpeed = speed => {
    this.setState({ playbackSpeed: speed });
  };

  changeTab = id => {
    // why is this a promise?
    return new Promise(resolve => {
      this.setState({ currentTabId: id }, () => {
        resolve();
      });
    });
  };

  goBack = () => {
    const { history } = this.props;
    history.goBack();
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

  onEncMessage = event => {
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
    const { room, user, encompass } = this.props;
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
    } = this.state;
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
            // absTimeElapsed={absTimeElapsed}
          />
        }
        // currentMembers={this.state.currentMembers}
        // setCurrentMembers={this.setCurrentMembers}
      />
    );

    const chat = (
      <ChatReplayer
        roomId={room._id}
        log={this.updatedLog}
        index={logIndex}
        changingIndex={changingIndex}
        reset={this.reset}
        setCurrentMembers={this.setCurrentMembers}
      />
    );
    const graphs = this.tabs.map((tab, i) => {
      if (tab.tabType === 'geogebra') {
        return (
          <GgbReplayer
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
          />
        );
      }
      return (
        <DesmosReplayer
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
          inView={currentTabId === tab._id}
        />
      );
    });
    const event = this.updatedLog[logIndex] || {};
    return (
      <Fragment>
        <div>{isFullscreen}</div>
        <WorkspaceLayout
          graphs={graphs}
          user={user}
          chat={this.updatedLog.length > 0 ? chat : null}
          tabs={
            <Tabs
              tabs={room.tabs}
              changeTabs={this.changeTab}
              currentTabId={currentTabId}
              participantCanCreate={false}
              replayer
              memberRole="participant" // this controls the user's ability to make a new tab...we don't want them to make a new a tab in the replayer no matter what their role is
            />
          }
          currentMembers={
            currentMembers.length > 0 ? (
              <CurrentMembers
                members={room.members}
                currentMembers={currentMembers}
                expanded
                activeMember={
                  event.user && event.user._id ? event.user._id : event.user
                }
              />
            ) : null
          }
          bottomLeft={replayer}
          activeMember={event.user}
          replayerControls={replayer}
          currentTabId={currentTabId}
          roomName={`${room.name} Replayer`}
          bottomRight={
            <Tools
              goBack={this.goBack}
              toggleControl={this.toggleControl}
              lastEvent={this.updatedLog[logIndex]}
              replayer
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
        {!allTabsLoaded && this.updatedLog.length > 0 ? (
          <Loading message="Preparing the replayer..." />
        ) : null}
      </Fragment>
    );
  }
}

SharedReplayer.propTypes = {
  encompass: PropTypes.bool,
  match: PropTypes.shape({}).isRequired,
  room: PropTypes.shape({}).isRequired,
  user: PropTypes.shape({}).isRequired,
  updateEnc: PropTypes.func,
  history: PropTypes.shape({}).isRequired,
};

SharedReplayer.defaultProps = {
  encompass: false,
  updateEnc: null,
};

export default SharedReplayer;
