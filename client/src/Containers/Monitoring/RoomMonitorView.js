/* eslint-disable prettier/prettier */
import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { API } from '../../utils';
import SimpleChat from '../../Components/Chat/SimpleChat';
import classes from './monitoringView.css';

/**
 * The RoomMonitor provides three views into a rooms: activity graph, thumbnail, and chat. Users can
 * select which tab (if more than one) and / or screen (if a DesmosActivity) they want to view.  Really, we don't need
 * chart because the Stats tab has this already.  Maybe just have a Thumbnail tile and a Chat tile. The Chat tile is always
 * the same, but the thumbnail changes depending on the tab/screen selection.
 *
 * Because this view appears in the lobby, I don't think we need the room title or actions menu on the thumbnail tile.
 * Instead, perhaps the drop-downs for tabs/screens should be there.
 *
 * We don't need to keep track of selections, as those might change as the room changes. However, we *DO* need to keep
 * the possible selections available in the drop-downs up to date. For example, if a new tab gets created, that should
 * be reflected in the dropdown.
 *
 * @TODO:
 *  - move MonitoringView and related files to this location so that all Monitoring code is together.
 *  - compare this component to MonitoringView and figure out places to break out shared components or functionality
 *
 */

function RoomMonitorView({ populatedRoom }) {
  //   const [chatType, setChatType] = React.useState(constants.DETAILED);
  const { isSuccess, data } = useQuery(
    populatedRoom._id,
    () =>
      API.getPopulatedById('rooms', populatedRoom._id, false, false).then(
        (res) => res.data.result
      ),
    { refetchInterval: 10000 }
  );

  /**
   *
   * FUNCTIONS THAT ARE USED TO SIMPLIFY THE RENDER LOGIC
   *
   */

  const _getMostRecentSnapshot = () => {
    if (!isSuccess) return null;
    const snapshotData = data.snapshot; // all the snapshots, indexed by tabIds
    if (!snapshotData) return null;
    let maxSoFar = 0;
    let result = null;
    Object.values(snapshotData).forEach((snapDatum) => {
      if (snapDatum.timestamp > maxSoFar) {
        maxSoFar = snapDatum.timestamp;
        result = snapDatum.dataURL;
      }
    });
    return result;
  };

  const _tabsAndScreens = () => {};
  const _thumbnail = () => {
    const snapshot = _getMostRecentSnapshot();
    return snapshot && snapshot !== '' ? (
      <img alt="Snapshot of room" src={snapshot} />
    ) : (
      <span className={classes.NoSnapshot}>No snapshot currently</span>
    );
  };

  return (
    <div className={classes.Container}>
      <div className={classes.TileGroup}>
        <div className={classes.Tile}>
          <div className={classes.TileContainer}>
            <div
              className={classes.Title}
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                marginBottom: '5px',
              }}
            >
              {isSuccess ? _tabsAndScreens() : 'Loading...'}
            </div>
            {isSuccess && _thumbnail()}
          </div>
        </div>
        <div className={classes.Tile}>
          <div className={classes.TileContainer}>
            <div
              className={classes.Title}
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                marginBottom: '5px',
              }}
            >
              {isSuccess ? 'Chat' : 'Loading...'}
            </div>
            <SimpleChat isSimplified={false} log={isSuccess ? data.chat : []} />
          </div>
        </div>
      </div>
    </div>
  );
}

RoomMonitorView.propTypes = {
  // @TODO clean up so only specify what we need
  populatedRoom: PropTypes.shape({}).isRequired,
};

RoomMonitorView.defaultProps = {};

export default RoomMonitorView;
