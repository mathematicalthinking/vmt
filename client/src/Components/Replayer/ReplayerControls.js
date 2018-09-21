import React from 'react';
import classes from './replayer.css';
import glb from '../../global.css';
const replayer = ({playing, event, startTime, endTime, pausePlay, goToIndex}) => {
  const index = 0
  const duration = endTime - startTime;
  const progress = (event.timeStamp - startTime) / duration;
  const pausePlayButton = playing ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i>;
  // const progress = (index / (duration - 1)) * 100
  const disableBack = (event.timeStamp === startTime);
  const disableForward = (event.timeStamp === endTime);

  return (
    <div className={classes.Container}>
      <div className={classes.Log}>

      </div>
      <div className={classes.ProgressBar}>
        <div className={classes.Progress} style={{width: progress + '%'}}></div>
      </div>
      <div className={[classes.Controls, glb.FlexRow].join(' ')}>
        <button disabled={disableBack} onClick={() => goToIndex(0)} className={classes.Button}><i className="fas fa-fast-backward"></i></button>
        <button disabled={disableBack} onClick={() => goToIndex(index - 1)} className={classes.Button}><i className="fas fa-backward"></i></button>
        <button onClick={pausePlay} className={classes.Button}>{pausePlayButton}</button>
        <button disabled={disableForward} onClick={() => goToIndex(index + 1)} className={classes.Button}><i className="fas fa-forward"></i></button>
        <button disabled={disableForward} onClick={() => goToIndex(duration - 1)} className={classes.Button}><i className="fas fa-fast-forward"></i></button>
      </div>
    </div>
      )
}

export default replayer;
