import React, { useContext } from 'react';
import { QueryClient, useQuery } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import html2canvas from 'html2canvas';
import debounce from 'lodash/debounce';
import keyBy from 'lodash/keyBy';
import throttle from 'lodash/throttle';
import { API, buildLog } from 'utils';
import { ModalContext } from 'Components';
import * as actionTypes from 'store/actions/actionTypes';

const timeFrameFcns = {
  all: () => true,
  lastDay: (diff) => diff <= 24 * 60 * 60 * 1000,
  last2Days: (diff) => diff <= 2 * 24 * 60 * 60 * 1000,
  lastWeek: (diff) => diff <= 7 * 24 * 60 * 60 * 1000,
  last2Weeks: (diff) => diff <= 2 * 7 * 24 * 60 * 60 * 1000,
  lastMonth: (diff) => diff <= 30 * 24 * 60 * 60 * 1000,
  last3Months: (diff) => diff <= 3 * 30 * 24 * 60 * 60 * 1000,
  last6Months: (diff) => diff <= 6 * 30 * 24 * 60 * 60 * 1000,
  last9Months: (diff) => diff <= 9 * 30 * 24 * 60 * 60 * 1000,
  lastYear: (diff) => diff <= 365 * 24 * 60 * 60 * 1000,
  afterDay: (diff) => diff > 24 * 60 * 60 * 1000,
  afterWeek: (diff) => diff > 7 * 24 * 60 * 60 * 1000,
  after2Weeks: (diff) => diff > 2 * 7 * 24 * 60 * 60 * 1000,
  afterMonth: (diff) => diff > 30 * 24 * 60 * 60 * 1000,
  afterYear: (diff) => diff > 365 * 24 * 60 * 60 * 1000,
};

export const timeFrames = {
  ALL: 'all',
  LASTDAY: 'lastDay',
  LAST2DAYS: 'last2Days',
  LASTWEEK: 'lastWeek',
  LAST2WEEKS: 'last2Weeks',
  LAST3MONTHS: 'last3Months',
  LAST6MONTHS: 'last6Months',
  LAST9MONTHS: 'last9Months',
  LASTMONTH: 'lastMonth',
  LASTYEAR: 'lastYear',
  AFTERDAY: 'afterDay',
  AFTERWEEK: 'afterWeek',
  AFTER2WEEKS: 'after2Weeks',
  AFTERMONTH: 'afterMonth',
  AFTERYEAR: 'afterYear',
};

/**
 * Custom hook for sorting and filtering table data.  Note that filter must be one of all, lastDay, lastWeek, last2Weeks, lastMonth, or lastYear. Adapted from https://www.smashingmagazine.com/2020/03/sortable-tables-react/.
 * @param {array} [items = []] - The data array. Each element represents a row as an object, with the properties (keys) representing the table columns
 * @param {object} [config = null] - Optional specification of an initial sorting of the form { key, direction, filter }
 * @returns {array} items - The data sorted by the requested column (key), in the requested direction, filtered by the requested filter.
 * @returns {object} sortConfig - The current sorting: { key, direction, filter }. Note that filter must be one of all, lastDay, lastWeek, last2Weeks, lastMonth, or lastYear.
 * @returns {function} requestSort - Takes a key and sorts the items accordingly. If not direction is supplied, the current direction is reversed.
 * @returns {function} resetSort - Takes a sortConfig object. That object is merged with the current sortConfig then the items are sorted and filtered appropriately.
 */

export const useSortableData = (items = [], config = null) => {
  const [sortConfig, setSortConfig] = React.useState(config);

  const withinTimeframe = (item) => {
    if (
      !sortConfig ||
      !item[sortConfig.key] ||
      !sortConfig.filter ||
      !sortConfig.filter.timeframe ||
      !sortConfig.filter.key ||
      !timeFrameFcns[sortConfig.filter.timeframe]
    )
      return true;
    const now = new Date();
    const then = new Date(item[sortConfig.filter.key]);
    return then.toString() !== 'Invalid Date'
      ? timeFrameFcns[sortConfig.filter.timeframe](Math.abs(then - now))
      : true;
  };

  const matchesCustomFilter = (item) => {
    if (
      !sortConfig ||
      !sortConfig.filter ||
      (!sortConfig.filter.filterFcn &&
        typeof sortConfig.filter.filterFcn !== 'function')
    )
      return true;
    return sortConfig.filter.filterFcn(item);
  };

  const sortedItems = React.useMemo(() => {
    // eslint-disable-next-line prefer-const
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const first =
          typeof a[sortConfig.key] === 'string'
            ? a[sortConfig.key].toLowerCase()
            : a[sortConfig.key];

        const second =
          typeof b[sortConfig.key] === 'string'
            ? b[sortConfig.key].toLowerCase()
            : b[sortConfig.key];

        if (first < second) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (first > second) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems.filter(
      (item) => withinTimeframe(item) && matchesCustomFilter(item)
    );
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
    setSortConfig({ ...sortConfig, key, direction });
  };

  const resetSort = ({ key, direction, filter, ...others }) => {
    if (key && !direction && !filter) requestSort(key);
    else if (sortConfig)
      setSortConfig({
        key: key || sortConfig.key,
        direction: direction || sortConfig.direction,
        filter: filter || sortConfig.filter,
        ...others,
      });
    else setSortConfig({ key, direction, filter, ...others });
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
      if (!elementRef.current) {
        // eslint-disable-next-line no-console
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
              if (!cancelSnapshot.current) callback(referenceObject.current);
            } else if (!cancelSnapshot.current)
              callback({ ...snapshotObj, ...newSnap });
            cancelSnapshot.current = false;
            // eslint-disable-next-line no-console
          } else console.log('snapshot not well formed:', dataURL);
        } else {
          cancelSnapshot.current = false;
          // eslint-disable-next-line no-console
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

  const resetSnapshots = () => {
    cancelSnapshots();
    cancelSnapshot.current = false;
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
    cancelSnapshots: resetSnapshots,
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

/**
 * Hook that takes an array of roomIds and returns those rooms in an object key'd by the ids. The object keys are in the same
 * order as the original roomIds array.
 *
 * The hook uses the useMergedData hook so that it builds up a cache of responses and so we only pull from the DB rooms that have changed since the
 * last request.
 *
 * If usePopulatedRoom receives an initialCache in the options, it'll make sure that all data merging includes that initial cache (fourth arg to useMergedData) and
 * will key the query on the full set of ids (ie., all the ids from the initial cache). Note that this assumes that initialCache's keys are a superset of
 * roomIds.
 */
export function usePopulatedRooms(
  roomIds,
  shouldBuildLog = false,
  options = {}
) {
  const initialCache = options.initialCache || {};
  const queryKey = options.initialCache
    ? Object.keys(options.initialCache)
    : roomIds;
  return useMergedData(
    [queryKey, { shouldBuildLog }], // index the query both by the room id and whether we have all the events & messages
    async (lastQueryTimes) => {
      // all of our API calls return the full xhttp object, with the data we want in the data>results field
      const {
        data: { results },
      } = await API.findAllMatchingIdsPopulated(
        'rooms',
        roomIds,
        shouldBuildLog,
        lastQueryTimes
      );
      const roomArray = shouldBuildLog
        ? results.map((room) => {
            const log = buildLog(room.tabs, room.chat);
            return { ...room, log };
          })
        : results;

      const roomsById = keyBy(roomArray, '_id');
      const orderedRoomsById = roomIds.reduce(
        (acc, id) => (roomsById[id] ? { ...acc, [id]: roomsById[id] } : acc),
        {}
      );
      return orderedRoomsById;
    },
    (results) => Object.keys(results),
    (cache, fetchedData) => ({ ...initialCache, ...cache, ...fetchedData }),
    options
  );
}

/**
 * Hook to an app-level modal that can be called from anywhere.
 * @returns { Object }
 * {
 *    show - function to show the modal. Takes a component (e.g., JSX) and a set of options that get handed to the Modal
 *    showBig - same as show, except renders the component inside of a BigModal
 *    hide - function to hide the modal/bigModal
 * }
 *
 * NOTE: If the component given to show or showBig contains state, it is up to that component or its client to clear out the state
 * on unmount. Otherwise, the next time the component is placed in the modal, the old state might show.
 */

export function useAppModal() {
  const modalContext = useContext(ModalContext);

  return {
    show: modalContext.show,
    showBig: modalContext.showBig,
    hide: modalContext.hide,
  };
}

/**
 * Hook to store the UI state of a component so that if the user navigates away and back, that state can be restored.
 * The hook takes a key that must be unique to that component and an optional initial value. Usage is similar to
 * React.useState:
 *
 * const [uiState, setUIState] = useUIState()
 *
 * The client component would extract the particular state variables from uiState. If any of those states change, setUIState should
 * be called.
 *
 * This hook has two key implementation pieces to ensure it works as expected:
 * 1. uiState in the Redux store is updated only when the component unmounts. This prevents an infinite loop with the
 * component asking uiState to change, but that change triggering further changes to the component, which would then trigger changes to
 * uiState.
 * 2. the uiState before unmount is stored in a ref.
 *
 */

export function useUIState(key, initialValue = {}) {
  const dispatch = useDispatch();
  const [_uiState, setUIState] = React.useState(
    useSelector((store) => store.user.uiState && store.user.uiState[key]) ||
      initialValue
  );

  // This ref mirrors the state so that we can return it on unmount
  // cf. https://stackoverflow.com/a/65840250/14894260
  const stateMonitor = React.useRef(_uiState);
  React.useEffect(() => {
    stateMonitor.current = _uiState;
  }, [_uiState]);

  // On unmount, dispatch the current UI state to the redux store
  React.useEffect(() => {
    return () => {
      dispatch({
        type: actionTypes.SAVE_COMPONENT_UI_STATE,
        key,
        // this MUST be a ref or else we won't capture the correct state (i.e., cannot be _uiState because then its initial value will always be returned)
        value: stateMonitor.current,
      });
    };
  }, []);

  return [_uiState, setUIState];
}

/**
 * A custom hook that fetches data, merging results from previous fetches.  The hook assumes that the fetchFcn might sometimes not return all documents
 * in a key bc they hadn't been updated since the last query.
 * The hook therefore uses a provided merge function to combine the new data coming in from the fetch with its own cache. The hook also keeps
 * track of the last query times organized by a provided extractIds function.
 *
 * key - The key index of the query. Should be an array of objects, one field of which is the unique identifier extracted by extractIdsFcn
 * fetchFcn - A function to do the query
 * extractIdsFcn - A function to extract all the unique identifiers from each object returned from the query
 * mergeFcn - A function that merges the cached data with the new data.
 * options - useQuery options
 *
 */

export function useMergedData(
  key,
  fetchFcn,
  extractIdsFcn,
  mergeFcn,
  options = {}
) {
  const queryClientRef = React.useRef(null);
  if (!queryClientRef.current)
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          cacheTime: 24 * 60 * 60 * 1000, // one day
        },
      },
    });
  const queryClient = queryClientRef.current;
  const lastQueryTimes = queryClient.getQueryData([key, 'lastQueryTimes']);

  const { data, ...others } = useQuery(key, () => fetchFcn(lastQueryTimes), {
    onSuccess: (newData) => {
      queryClient.setQueryData([key, 'mergedData'], (cache) =>
        mergeFcn(cache, newData)
      );

      const newDataIds = extractIdsFcn(newData);
      const updatedLastQueryTimes = newDataIds.reduce(
        (acc, id) => ({
          ...acc,
          [id]: Date.now(),
        }),
        {}
      );
      queryClient.setQueryData([key, 'lastQueryTimes'], {
        ...lastQueryTimes,
        ...updatedLastQueryTimes,
      });
    },
    ...options,
  });
  return { data: queryClient.getQueryData([key, 'mergedData']), ...others };
}

/**
 * A custom hook for keeping track of user activity. If the user is idle (i.e., has not typed, clicked, or scrolled) for
 * a specified amount of time (default 30 min), the onInactivity function is called. The function is also called if the
 * user's screen is hidden for the specified amount of time; once the user returns to that screen, they are logged out.
 * This latter approach is meant to handle browsers where Javascript timers stop when the tab isn't visible.
 */
export function useActivityDetector(
  onInactivity,
  onActivity,
  timeout = 1800000,
  throttleDelay = 5000
) {
  let activityTimer;
  let lastActivityTime = Date.now();

  const resetTimer = throttle(() => {
    clearTimeout(activityTimer);
    onActivity();
    activityTimer = setTimeout(onInactivity, timeout);
    lastActivityTime = Date.now();
  }, throttleDelay);

  const checkForInactivity = () => {
    const currentTime = Date.now();
    const timeElapsed = currentTime - lastActivityTime;

    if (timeElapsed > timeout) {
      clearTimeout(activityTimer);
      onInactivity();
    } else {
      resetTimer();
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkForInactivity(); // Check inactivity upon returning to the tab
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('click', resetTimer);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set the initial timer
    resetTimer();

    return () => {
      clearTimeout(activityTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}

/**
 * A custom hook for executing a callback the first time that some data changes. Note that the callback should be stable
 * or wrapped in useCallback.
 */
export function useExecuteOnFirstUpdate(data, callback) {
  const hasExecutedRef = React.useRef(false);

  React.useEffect(() => {
    if (!hasExecutedRef.current && data) {
      callback(data);
      hasExecutedRef.current = true;
    }
  }, [data, callback]);
}

/**
 * Custom hook that encapsulates the interaction between VMT and Pyret. Now used by only PyretActivity.
 *
 * @param
 * iframeRef -- the ref to the iframe containing Pyret
 * onMessage -- the function called when Pyret emits an event
 * initialState -- the string representing the state of Pyret when it loads
 *
 * @returns
 * iframeSrc -- the src parameter for the iframe (the URI for Pyret)
 * isReady -- whether the iframe is loaded
 * postMessage -- the function used by VMT to communicate with the Pyret instance
 * currentState -- the current state of the Pyret instance
 */

export function usePyret(iframeRef, onMessage = () => {}, initialState = '') {
  const iframeSrc = window.env.REACT_APP_PYRET_URL;
  const [isReady, setIsReady] = React.useState(false);
  const [currentState, setCurrentState] = React.useState({});

  const oldOnMessageRef = React.useRef(window.onmessage);

  React.useEffect(() => {
    const oldOnMessage = oldOnMessageRef.current;

    window.onmessage = (event) => {
      // Use the provided onMessage if the protocol is 'pyret'; use original windows.onmessage otherwise
      if (
        event.data.protocol === 'pyret' &&
        event.data.data.type === 'pyret-init'
      ) {
        setIsReady(true);
      } else if (event.data.protocol === 'pyret') {
        console.log('event.data', event.data);
        setCurrentState(event.data.data.currentState);
        onMessage(event.data);
      } else {
        console.log('Not a pyret');
        if (typeof oldOnMessage === 'function') {
          oldOnMessage(event);
        }
      }
    };

    return () => {
      window.onmessage = oldOnMessage; // Restore the old handler when the component unmounts
    };
  }, [onMessage]);

  React.useEffect(() => {
    if (isReady) {
      postMessage({
        protocol: 'pyret',
        data: { type: 'reset', state: initialState },
      });
    }
  }, [isReady, initialState]);

  function postMessage(data) {
    if (!iframeRef.current) {
      return;
    }
    iframeRef.current.contentWindow.postMessage(data, '*');
  }

  return {
    iframeSrc,
    postMessage,
    currentState,
    isReady,
  };
}
