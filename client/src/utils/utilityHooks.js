/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */
import React from 'react';
import html2canvas from 'html2canvas';
import { debounce } from 'lodash';

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

export function useSnapshots(callback) {
  const timer = React.createRef();
  const cancelSnapshot = React.createRef();
  const elementRef = React.createRef();
  cancelSnapshot.current = false;

  const startSnapshots = () => {
    if (!elementRef.current) return;
    if (!timer.current) {
      timer.current = setInterval(() => {
        html2canvas(elementRef.current, {
          imageTimeout: 17000,
          windowWidth: elementRef.current.scrollWidth,
          windowHeight: elementRef.current.scrollHeight,
        })
          .then((canvas) => {
            if (!cancelSnapshot.current) {
              const dataURL = canvas.toDataURL();
              callback({ dataURL, timestamp: Date.now() });
            } else {
              cancelSnapshot.current = false;
            }
          })
          .catch((err) => console.error(err));
      }, 5000);
    }
  };

  // adapted from https://stackoverflow.com/questions/475074/regex-to-parse-or-validate-base64-data
  const _isWellFormedPNG = (dataURL) => {
    return /^data:image\/png;base64,(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)/g.test(
      dataURL
    );
  };

  const takeSnapshot = debounce(
    () => {
      if (!elementRef.current) return;
      html2canvas(elementRef.current, {
        imageTimeout: 17000,
        windowWidth: elementRef.current.scrollWidth,
        windowHeight: elementRef.current.scrollHeight,
      }).then((canvas) => {
        if (!cancelSnapshot.current) {
          const dataURL = canvas.toDataURL();
          if (dataURL && _isWellFormedPNG(dataURL))
            callback({ dataURL, timestamp: Date.now() });
        } else {
          cancelSnapshot.current = false;
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
  // without other information, this returns the most recent snapshot if more than one.
  const extractDataURL = (snapshot) => {
    return snapshot.dataURL;
  };

  const extractTimestamp = (snapshot) => {
    return snapshot.timestamp;
  };

  return {
    elementRef,
    startSnapshots,
    cancelSnaphots,
    extractDataURL,
    extractTimestamp,
    takeSnapshot,
  };
}
