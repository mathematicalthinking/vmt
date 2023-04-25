import React from 'react';

export const GOOGLE_ICONS = {
  PREVIEW: 'preview',
  REPLAYER: 'autoplay',
  ARCHIVE: 'archive',
  UNARCHIVE: 'unarchive',
};

export const getGoogleIcons = (
  iconType,
  customClassNames = null,
  customStyle = null,
  others // onClick, data-testid, etc. ...
) => {
  return (
    <span
      className={`material-symbols-outlined ${Array.isArray(customClassNames) &&
        customClassNames.join(', ')}`}
      style={customStyle}
      {...others}
    >
      {iconType}
    </span>
  );
};
