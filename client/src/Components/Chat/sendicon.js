import React from 'react';
const sendIcon = ({height, width, viewBox}) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox={viewBox}>
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
      <path d="M0 0h24v24H0z" fill="none"/>
    </svg>
  )
}

export default sendIcon;