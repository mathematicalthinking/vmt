/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */
import React from 'react';
import html2canvas from 'html2canvas';
// import throttle from 'lodash/throttle';

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
  // let timer = null;
  const elementRef = React.createRef();

  // const startSnapshots = () => {
  //   console.log(elementRef.current);
  //   if (!elementRef.current) return;
  //   if (!timer) {
  //     timer = setInterval(() => {
  //       htmltoimage
  //         .toPng(elementRef.current)
  //         .then((dataURL) => {
  //           // adapted from https://stackoverflow.com/questions/15327959/get-height-and-width-dimensions-from-base64-png
  //           // const header = window
  //           //   .atob(dataURL.slice(22).slice(0, 50))
  //           //   .slice(16, 24);
  //           // const uint8 = Uint8Array.from(header, (c) => c.charCodeAt(0));
  //           // const dataView = new DataView(uint8.buffer);
  //           // console.log(`${dataView.getInt32(0)} x ${dataView.getInt32(4)}`);
  //           callback({ snapshot: dataURL });
  //         })
  //         .catch((err) => console.error(err));
  //     }, 5000);
  //   }
  // };

  // const takeSnapshot = throttle(() => {
  //   if (!elementRef.current) return;
  //   htmltoimage
  //     .toPng(elementRef.current)
  //     .then((dataURL) => {
  //       callback({ dataURL, timestamp: Date.now() });
  //     })
  //     .catch((err) => console.error(err));
  // }, 5000);

  const takeSnapshot = () => {
    if (!elementRef.current) return;
    console.log('Element ref: ', elementRef.current);
    html2canvas(elementRef.current, {
      // html2canvas config
      // logging: true,
      imageTimeout: 17000,
      // scale: 1,
      windowWidth: elementRef.current.scrollWidth,
      windowHeight: elementRef.current.scrollHeight,
    }).then((canvas) => {
      const dataURL = canvas.toDataURL();
      callback({ dataURL, timestamp: Date.now() });
    });
  };

  // const takeSnapshot = () => {
  //   if (!elementRef.current) return;
  //   const canvas = elementRef.current;

  //   console.log('Element ref: ', canvas);
  //   canvas.focus();
  //   // console.log('URI: ', URI);
  //   canvas
  //     .toBlob((dataURL) => {
  //       callback({ dataURL, timestamp: Date.now() });
  //     })
  //     .catch((err) => console.error(err));
  // };

  // const stopSnapshots = () => {
  //   if (timer) {
  //     clearInterval(timer);
  //     timer = null;
  //   }
  //   takeSnapshot.cancel();
  // };

  // Keeping saving and extraction details inside the hook so that
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
    // startSnapshots,
    // stopSnapshots,
    extractDataURL,
    extractTimestamp,
    takeSnapshot,
  };
}
