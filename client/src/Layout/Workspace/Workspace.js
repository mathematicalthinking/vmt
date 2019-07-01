import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './workspace.css';

class WorkspaceLayout extends Component {
  state = { offSet: 0 };
  Graph = React.createRef();

  componentDidMount() {
    this.setOffSet();
    window.addEventListener('resize', this.setOffSet);
  }
  componentDidUpdate(prevProps) {
    const { isFullscreen } = this.props;
    if (isFullscreen && !prevProps.isFullscreen) {
      this.Graph.current.requestFullscreen();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setOffSet);
  }

  setOffSet = () => {
    const coords = this.Graph.current.getBoundingClientRect();
    this.setState({ offSet: coords.x - 18 }); // -18 for width of arrow head
  };
  render() {
    const {
      chat,
      tabs,
      bottomRight, // rename to tools
      bottomLeft,
      currentMembers,
      referFromCoords,
      referToCoords,
      graphs,
      replayer,
      currentTab,
      roomName,
      loaded,
      activity,
      // encompass,
      chatExpanded,
      membersExpanded,
      referToEl,
      graphCoords,
    } = this.props;
    const { offSet } = this.state;
    let x2;
    let y2;
    if (referToCoords && graphCoords) {
      y2 = referToCoords.top;
      x2 = referToCoords.left;
      if (graphCoords.height < referToCoords.top) {
        y2 = graphCoords.height;
      } else if (graphCoords.top > referToCoords.top) {
        y2 = graphCoords.top;
      }
      if (graphCoords.left - offSet > referToCoords.left) {
        x2 = graphCoords.left - offSet;
      } else if (
        graphCoords.right - offSet < referToCoords.left &&
        referToEl.elementType !== 'chat_message'
      ) {
        x2 = graphCoords.right - offSet;
      }
    }
    let membersHeight = 'auto';
    let chatHeight = '43%';
    let flexB = '0';
    if (!chatExpanded) {
      chatHeight = 'auto';
      if (membersExpanded) {
        membersHeight = '33%';
      }
    }
    // This is annoying but the flexx basis behavior is not consistant across browsers and it is messing up how
    // the right panel elements collapse and expand....there's gotta be a better way to do this
    if (typeof InstallTrigger !== 'undefined' && chatExpanded) {
      // If this is Firefox
      flexB = 'auto';
    }
    return (
      <div
        className={classes.PageContainer}
        style={{ visibility: loaded || activity ? 'visible' : 'hidden' }}
      >
        {/* {!encompass ? <div className={classes.Background} /> : null} */}
        <div className={classes.Container}>
          <div className={classes.Left}>
            <div className={classes.TabsAndTitle}>
              <div className={classes.WorkspaceTabs}>{tabs}</div>
              <h2 className={classes.Title}>{roomName}</h2>
            </div>
            <div
              ref={this.Graph}
              className={replayer ? classes.ReplayerTop : classes.Top}
              style={{ position: 'relative' }}
            >
              {graphs.map((graph, i) => {
                return (
                  <div
                    key={graph.key}
                    className={replayer ? classes.ReplayerGraph : classes.Graph}
                    style={{
                      zIndex: currentTab === i ? 100 : 0,
                      position: 'absolute',
                      top: 0,
                      left: 1,
                      bottom: 1,
                      right: 1,
                    }}
                  >
                    {graph}
                  </div>
                );
              })}
              {replayer ? (
                <div className={classes.ReplayerBottom}>{bottomLeft}</div>
              ) : null}
            </div>
            {!replayer ? (
              <div className={classes.Bottom}>{bottomLeft}</div>
            ) : null}
          </div>
          <div className={classes.Right}>
            <div
              className={classes.Chat}
              style={{ height: chatHeight, flexBasis: flexB }}
            >
              {chat}
            </div>
            <div className={activity ? classes.ActivityTools : classes.Tools}>
              {bottomRight}
            </div>
            <div className={classes.Members} style={{ height: membersHeight }}>
              {currentMembers}
            </div>
          </div>
          {referToCoords && referFromCoords ? (
            <div className={classes.ReferenceLine}>
              <svg height="100%" width="100%" style={{ zIndex: 1000 }}>
                <defs>
                  <marker
                    id="arrow"
                    markerWidth="10"
                    markerHeight="10"
                    refX="8"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path d="M0,0 L0,6 L9,3 z" fill="#2D91F2" />
                  </marker>
                </defs>
                <line
                  data-testid="reference-line"
                  style={{ zIndex: 2500 }}
                  x2={x2}
                  y2={y2}
                  x1={referFromCoords.left}
                  y1={referFromCoords.top}
                  stroke="#2D91F2"
                  strokeWidth="3"
                  markerEnd="url(#arrow)"
                />
              </svg>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

WorkspaceLayout.propTypes = {
  chat: PropTypes.element,
  tabs: PropTypes.element.isRequired,
  bottomRight: PropTypes.element.isRequired, // rename to tools
  bottomLeft: PropTypes.element.isRequired,
  currentMembers: PropTypes.element,
  referFromCoords: PropTypes.shape({}),
  referToCoords: PropTypes.shape({}),
  graphs: PropTypes.arrayOf(PropTypes.element).isRequired,
  replayer: PropTypes.bool,
  currentTab: PropTypes.number.isRequired,
  roomName: PropTypes.string.isRequired,
  loaded: PropTypes.bool,
  activity: PropTypes.bool,
  isFullscreen: PropTypes.bool,
  // encompass: PropTypes.bool,
  chatExpanded: PropTypes.bool,
  membersExpanded: PropTypes.bool,
  graphCoords: PropTypes.shape({
    left: PropTypes.number,
    right: PropTypes.number,
    height: PropTypes.number,
    top: PropTypes.number,
  }),
  referToEl: PropTypes.shape({
    elementType: PropTypes.string.isRequired,
  }),
};

WorkspaceLayout.defaultProps = {
  activity: false,
  currentMembers: null,
  chat: null,
  replayer: false,
  loaded: true,
  isFullscreen: false,
  // encompass: false,
  referFromCoords: null,
  referToCoords: null,
  chatExpanded: true,
  referToEl: null,
  membersExpanded: true,
  graphCoords: null,
};
export default WorkspaceLayout;
