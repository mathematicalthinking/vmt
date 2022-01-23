/* eslint-disable prettier/prettier */
import React from 'react';
import html2canvas from 'html2canvas';
import { debounce } from 'lodash';
import { useQuery } from 'react-query';
import API from 'utils/apiRequests';
import buildLog from 'utils/buildLog';

export const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = React.useState(config);

  const sortedItems = React.useMemo(() => {
    // eslint-disable-next-line prefer-const
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};

export function useSnapshots(callback, initialObject = {}) {
  const timer = React.createRef();
  const cancelSnapshot = React.createRef();
  const elementRef = React.createRef();
  const referenceObject = React.createRef();

  referenceObject.current = initialObject;
  cancelSnapshot.current = false;

  const startSnapshots = (key, snapshotObj) => {
    if (!timer.current) {
      timer.current = setInterval(() => {
        takeSnapshot(key, snapshotObj);
      }, 5000);
    }
  };

  // Commented code adapted from https://stackoverflow.com/questions/475074/regex-to-parse-or-validate-base64-data, but it seemed too
  // slow. Current code adapted from: https://hashnode.com/post/how-do-you-validate-a-base64-image-cjcftg4fy03s0p7wtn31oqjx7
  const _isWellFormedPNG = (dataURL) => {
    // return /^data:image\/png;base64,(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)/g.test(
    //   dataURL);
    return /^data:image\/png;base64,(?:[A-Za-z0-9]|[+/])+={0,2}/g.test(dataURL);
  };

  const _hash = (key) => {
    // Do conversion to a regular string so that javascript can distinguish them when used as object keys
    return String(JSON.stringify(key));
  };

  const _dehash = (key) => {
    let result = { currentTabId: '' };
    try {
      result = JSON.parse(key);
    } catch (e) {
      // handle the legacy case. @TODO This should NOT BE INSIDE THE HOOK!
      const tabAndScreen = key.split('SCREEN_');
      if (tabAndScreen.length === 2)
        result = {
          currentTabId: tabAndScreen[0],
          currentScreen: tabAndScreen[1] * 1, // convert string to number
        };
    }
    return result;
  };

  const takeSnapshot = debounce(
    (key, snapshotObj) => {
      // console.log('starting snapshot for', key);
      if (!elementRef.current) {
        console.log('no elementRef');
        return;
      }
      html2canvas(elementRef.current, {
        imageTimeout: 17000,
        windowWidth: elementRef.current.scrollWidth,
        windowHeight: elementRef.current.scrollHeight,
      }).then((canvas) => {
        if (!cancelSnapshot.current) {
          const dataURL = canvas.toDataURL();
          if (dataURL && _isWellFormedPNG(dataURL)) {
            const newSnap = {
              [_hash(key)]: {
                dataURL,
                timestamp: Date.now(),
                key: _hash(key),
              },
            };
            if (arguments.length < 1) {
              referenceObject.current = {
                ...referenceObject.current,
                ...newSnap,
              };
              callback(referenceObject.current);
            } else {
              callback({ ...snapshotObj, ...newSnap });
            }
          } else console.log('snapshot not well formed:', dataURL);
        } else {
          cancelSnapshot.current = false;
          console.log('snapshot cancelled');
        }
      });
    },
    1000,
    { maxWait: 5000 }
  );

  const cancelSnaphots = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    cancelSnapshot.current = true;
  };

  // Keep saving and extraction details inside the hook so that
  // if (when) we change how we store snapshots, we only have to adjust
  // code inside this custom hook.

  // Note that if referenceObject is not being used, referenceObject.current will be {}
  const getSnapshot = (key, snapshotObj) => {
    const refObj = snapshotObj || referenceObject.current;
    const hashedKey = _hash(key);
    return refObj[hashedKey] ? refObj[hashedKey].dataURL : null;
  };

  const getTimestamp = (key, snapshotObj) => {
    const refObj = snapshotObj || referenceObject.current;
    const hashedKey = _hash(key);
    return refObj[hashedKey] ? refObj[hashedKey].timestamp : 0;
  };

  const getKeys = (snapshotObj) => {
    const refObj = snapshotObj || referenceObject.current;
    return Object.keys(refObj).map((key) => _dehash(key));
  };

  return {
    elementRef,
    startSnapshots,
    cancelSnaphots,
    getSnapshot,
    getTimestamp,
    takeSnapshot,
    getKeys,
  };
}

/**
 * A custom hook that uses react-query to pull room data from the DB
 * @param {string} roomID - The ID of the room
 * @param {boolean} [shouldBuildLog=false] - Whether we should build a log from the full set of room events
 * @param {object} [options={}] - See the docs for react-query's UseQuery for these options.
 */
export function usePopulatedRoom(roomId, shouldBuildLog = false, options = {}) {
  return useQuery(
    [roomId, { shouldBuildLog }],
    () =>
      API.getPopulatedById('rooms', roomId, false, shouldBuildLog).then(
        (res) => {
          const populatedRoom = res.data.result;
          if (shouldBuildLog)
            populatedRoom.log = buildLog(
              populatedRoom.tabs,
              populatedRoom.chat
            );
          return populatedRoom;
        }
      ),
    options
  );
}
