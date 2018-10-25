import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import classes from './contentBox.css';
import Icons from './Icons/Icons';
import Aux from '../../HOC/Auxil';
class ContentBox extends PureComponent{
  
  state = {
    showOverlay: false,
  }
  
  hoverOnSelect = () => {
    console.log('mouse enter')
    this.setState({showOverlay: true})
  }
  render() {
    let alignClass = classes.Center;
    if (this.props.align === 'left') alignClass = classes.Left;
    if (this.props.align === 'right') alignClass = classes.Right;
    const notifications = (this.props.notifications > 0) ? <div className={classes.Notification} data-testid="content-box-ntf">{this.props.notifications}</div> : null;
    return (
    <Aux>
      <Link 
        to={this.props.link} 
        data-testid='content-box' 
        onMouseEnter={this.props.selecting ? this.hoverOnSelect : null} 
        onMouseLeave={this.props.selecting ? () => {this.setState({showOverlay: false})} : null} >
      <div className={classes.Container} onClick={this.toggleCollapse}>
        {this.state.showOverlay ? <div className={classes.SelectOverlay}><i className="fas fa-plus"></i></div> : null}
        <div className={classes.Icons}><Icons image={this.props.image} lock={this.props.locked} roomType={this.props.roomType}/></div>
        {notifications}
        <div className={classes.Title} data-testid="content-box-title">{this.props.title}</div>
        <div className={[classes.Content, alignClass].join(' ')}>
          {/* // Maybe separate all of this out ot its own component or revert back passing in this.props.children */}
          {this.props.details ?
            <div>
              <div>{this.props.details.description || ''}</div>
              {this.props.details.facilitators.length > 0 ? <div>Facilitators: {this.props.details.facilitators.map(facilitator => facilitator)}</div> : null}
              {this.props.details.entryCode ? <div>Entry Code: {this.props.details.entryCode}</div> : null}
            </div> : this.props.children}
        </div>
      </div>
      </Link>
    </Aux>
    )
  }
}

export default ContentBox;
