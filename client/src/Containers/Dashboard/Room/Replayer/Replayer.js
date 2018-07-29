import React from 'react';
import classes from './replayer.css';
import glb from '../../../global.css';
import ContentBox from '../../../Components/UI/ContentBox/ContentBox';
const replayer = props => {

  const pausePlay = props.playing ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i>;
  const progress = (props.index / (props.duration - 1)) * 100
  const disableBack = (props.index === 0) ? true : false;
  const disableForward = (props.index >=  props.duration - 1);

  return (
    <div className={classes.Container}>
      <ContentBox title='Replayer' align='center'>
        <div className={classes.ProgressBar}>
          <div className={classes.Progress} style={{width: progress + '%'}}></div>
        </div>
        <div className={[classes.Controls, glb.FlexRow].join(' ')}>
          <button disabled={disableBack} onClick={() => props.goToIndex(0)} className='button'><i className="fas fa-fast-backward"></i></button>
          <button disabled={disableBack} onClick={() => props.goToIndex(props.index - 1)} className='button'><i className="fas fa-backward"></i></button>
          <button onClick={props.play} className='button'>{pausePlay}</button>
          <button disabled={disableForward} onClick={() => props.goToIndex(props.index + 1)} className=''><i className="fas fa-forward"></i></button>
          <button disabled={disableForward} onClick={() => props.goToIndex(props.duration - 1)} className=''><i className="fas fa-fast-forward"></i></button>
          </div>
        </ContentBox>
      </div>
      )
}

export default replayer;
