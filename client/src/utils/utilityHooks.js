/* eslint-disable prettier/prettier */
import React from 'react';
import html2canvas from 'html2canvas';
import { debounce } from 'lodash';
import { useQuery } from 'react-query';
import API from 'utils/apiRequests';
import buildLog from 'utils/buildLog';

/**
 * Custom hook for sorting table data
 * @param {array} items - The data array. Each element represents a row as an object, with the properties (keys) representing the table columns
 * @param {object} [config = null] - Optional specification of an initial sorting of the form { key, direction }
 * @returns {array} items - The data sorted by the requested column (key)
 * @returns {object} sortConfig - The current sorting: { key, direction }
 * @returns {function} requestSort - A function that takes a key and sorts the items accordingly
 */

// from https://www.smashingmagazine.com/2020/03/sortable-tables-react/

export const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = React.useState(config);

  const sortedItems = React.useMemo(() => {
    // eslint-disable-next-line prefer-const
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (
          a[sortConfig.key].toString().toLowerCase() <
          b[sortConfig.key].toString().toLowerCase()
        ) {
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

  const resetSort = (key, direction) => {
    if (key && direction) setSortConfig({ key, direction });
    else if (key && !direction) requestSort(key);
  };

  return { items: sortedItems, requestSort, sortConfig, resetSort };
};

/**
 * Custom hook that implements taking and accessing screen snapshots. The hook supports maintaining multiple snapshots via what we will call a 'snapshotStore'. The
 * snapshotStore is indexed by client-provided keys (anything that can be stringified) and keeps track of snapshots and their timestamps. Note that the snapshotStore is meant to be a black box
 * (i.e., no guarantee of its structure or type), which is why we provide accessor functions.  The hook also provides a ref that must be placed on the DOM element to
 * be 'photographed' as well as functions related to taking snapshots and accessing them. In the various functions, note that the hook can work in one of two
 * modes: the snapshotStore is held by the client and provided to each function OR the hook maintains the snapshotStore itself.
 * @param {function} callback - The function called when a successful snapshot is taken. Parameter is the updated snapshotStore.
 * @param {object} [initialStore = {}] - Optional specification of an initial snapshotStore
 * @returns {ref} elementRef - Ref that should be placed on the DOM element to be snapshot
 * @returns {function} startSnapshots - Function that takes a key, an optional timeframe (default is 5s), and an optional snapshotStore.
 * Takes a snapshot every timeframe milliseconds, calling the callback function with the provided snapshotStore updated with the new snapshot.
 * @returns {function} takeSnapshot - Similar to startSnapshot (takes a key and optional snapshotStore), but takes a single snapshot. If no snapshotStore is provided,
 * the hook maintains its own store.
 * @returns {function} cancelSnapshots - Cleanup function that stops the startSnapshots timer as well as prevents any other snapshots from being taken.
 * @returns {function} getSnapshot - Given a key and optional snapshotStore, returns the indexed snapshot. If no snapshotStore is provided, the hook keeps track
 * of the snapshots internally.
 * @returns {function} getTimestamp - Given a key and optional snapshotStore, returns the indexed timestamp (i.e., when the corresponding snapshot was taken) either
 * from the provided snapshotStore or the one being maintained by the hook.
 * @returns {function} getKeys - Given a snapshotStore, returns an array of keys. If no parameter is provided, returns the keys from the hook-maintained snapshotStore.
 */

// NOTE: There are console.log statements kept for debugging in case something goes wrong with snapshots (i.e., a snapshot doesn't show up for a user and we want to
// quickly know why). These logs are kept because they only show up in the console if something is going wrong.

export function useSnapshots(callback, initialStore = {}) {
  const timer = React.createRef();
  const cancelSnapshot = React.createRef();
  const elementRef = React.createRef();
  const referenceObject = React.createRef();

  referenceObject.current = initialStore;
  cancelSnapshot.current = false;

  const startSnapshots = (key, milliseconds = 5000, snapshotObj) => {
    if (!timer.current) {
      timer.current = setInterval(() => {
        takeSnapshot(key, snapshotObj);
      }, milliseconds);
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

  const cancelSnapshots = () => {
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
    cancelSnapshots,
    getSnapshot,
    getTimestamp,
    takeSnapshot,
    getKeys,
  };
}

/**
 * Custom hook that uses react-query to pull room data from the DB
 * @param {string} roomID - The ID of the room
 * @param {boolean} [shouldBuildLog=false] - Whether we should build a log from the full set of room events
 * @param {object} [options={}] - See the docs for react-query's UseQuery for these options.
 */
export function usePopulatedRoom(roomId, shouldBuildLog = false, options = {}) {
  return useQuery(
    [roomId, { shouldBuildLog }], // index the query both by the room id and whether we have all the events & messages
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
