import React from 'react';

// STATUS and ROLE must be kept consistent with server/constants/status.js and server/constants/role.js
export const STATUS = {
  ARCHIVED: 'archived',
  TRASHED: 'trashed',
  SUSPENDED: 'suspended',
  DEFAULT: 'default',
};

export const ROLE = {
  FACILITATOR: 'facilitator',
  PARTICIPANT: 'participant',
  GUEST: 'guest',
};

export const GRAPH_HEIGHT = window.innerHeight - 400;

export const GOOGLE_ICONS = (
  iconType,
  customClassNames = null,
  customStyle = null,
  others // onClick, data-testid, etc. ...
) => {
  let googleIconName = '';
  // eslint-disable-next-line react/destructuring-assignment, default-case
  switch (iconType.toUpperCase()) {
    /* PREVIOUSLY USED GOOGLE_ICONS */
    // case 'PREVIEW':
    //   googleIconName = 'open_in_new';
    //   break;
    // case 'REPLAYER':
    //   googleIconName = 'replay';
    //   break;
    // case 'ARCHIVE':
    //   googleIconName = 'archive';
    //   break;
    // case 'UNARCHIVE':
    //   googleIconName = 'output';
    //   break;
    case 'PREVIEW':
      googleIconName = 'preview';
      break;
    case 'REPLAYER':
      googleIconName = 'autoplay';
      break;
    case 'ARCHIVE':
      googleIconName = 'archive';
      break;
    case 'UNARCHIVE':
      googleIconName = 'unarchive';
      break;
  }

  return (
    <span
      className={`material-symbols-outlined ${Array.isArray(customClassNames) &&
        customClassNames.join(', ')}`}
      style={customStyle}
      {...others}
    >
      {googleIconName}
    </span>
  );
};
