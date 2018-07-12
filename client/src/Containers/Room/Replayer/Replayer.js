import React, { Component } from 'react';
import classes from './replayer.css';
import glb from '../../../global.css';
import ContentBox from '../../../Components/UI/ContentBox/ContentBox';
class Replayer extends Component {

  render() {
    const pausePlay = this.props.playing ? <i class="fas fa-pause"></i> : <i className="fas fa-play"></i>;
      return (
      <div className={classes.Container}>
        <ContentBox title="Replayer">
          <div className={classes.ProgressBar}>

          </div>
          <div className={[classes.Controls, glb.FlexRow].join(' ')}>
            <button onClick={this.props.backAll} className='button'><i class="fas fa-fast-backward"></i></button>
            <button onClick={this.props.backOne} className='button'><i class="fas fa-backward"></i></button>
            <button onClick={this.props.play} className='button'>{pausePlay}</button>
            <button onClick={this.props.forwardOne} className=''><i class="fas fa-forward"></i></button>
            <button onClick={this.props.forwarAll} className=''><i class="fas fa-fast-forward"></i></button>
          </div>
        </ContentBox>
      </div>
    )
  }
}

export default Replayer;
