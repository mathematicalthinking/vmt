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

  const startSnapshots = (key) => {
    if (!timer.current) {
      timer.current = setInterval(() => {
        takeSnapshot(key);
      }, 5000);
    }
  };

  // adapted from https://stackoverflow.com/questions/475074/regex-to-parse-or-validate-base64-data
  const _isWellFormedPNG = (dataURL) => {
    return /^data:image\/png;base64,(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)/g.test(
      dataURL
    );
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
    (key) => {
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
            referenceObject.current = {
              ...referenceObject.current,
              [_hash(key)]: { dataURL, timestamp: Date.now(), key: _hash(key) },
            };
            callback(referenceObject.current);
          } else console.log('snapshot not well formed');
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
  // code inside this custom hook
  const getSnapshot = (key) => {
    const hashedKey = _hash(key);
    return referenceObject.current[hashedKey]
      ? referenceObject.current[hashedKey].dataURL
      : null;
  };

  const getTimestamp = (key) => {
    const hashedKey = _hash(key);
    return referenceObject.current[hashedKey]
      ? referenceObject.current[hashedKey].timestamp
      : 0;
  };

  const getKeys = () => {
    return Object.keys(referenceObject.current).map((key) => _dehash(key));
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
 * @function usePopulatedRoom A custom hook that uses react-query to pull room data from the DB
 * @param roomID @type string The ID of the room
 * @param shouldBuildLog @type boolean @default false Whether we should build a log from the full set of room events
 * @param options @type object @default {} See the docs for react-query's UseQuery for these options.
 */
export function usePopulatedRoom(roomId, shouldBuildLog = false, options = {}) {
  return useQuery(
    roomId,
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
