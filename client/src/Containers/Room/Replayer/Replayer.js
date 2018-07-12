import React, { Component } from 'react';
import classes from './replayer.css';
import glb from '../../../global.css';
import ContentBox from '../../../Components/UI/ContentBox/ContentBox';
const replayer = props => {

  const pausePlay = props.playing ? <i class="fas fa-pause"></i> : <i className="fas fa-play"></i>;
  const progress = (props.index / props.duration) * 100
  console.log(progress)
  return (
    <div className={classes.Container}>
      <ContentBox title="Replayer">
        <div className={classes.ProgressBar}>
          <div className={classes.Progress} style={{width: progress + '%'}}></div>
        </div>
        <div className={[classes.Controls, glb.FlexRow].join(' ')}>
          <button onClick={props.backAll} className='button'><i class="fas fa-fast-backward"></i></button>
          <button onClick={props.backOne} className='button'><i class="fas fa-backward"></i></button>
          <button onClick={props.play} className='button'>{pausePlay}</button>
          <button onClick={props.forwardOne} className=''><i class="fas fa-forward"></i></button>
          <button onClick={props.forwarAll} className=''><i class="fas fa-fast-forward"></i></button>
          </div>
        </ContentBox>
      </div>
      )
}

export default replayer;
