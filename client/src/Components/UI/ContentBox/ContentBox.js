import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import classes from './contentBox.css';
import Icons from './Icons/Icons';
import Aux from '../../HOC/Auxil';
import Expand from './expand.js';


class ContentBox extends PureComponent{
  
  state = {
    showOverlay: false,
    selectAnimation: false,
    selected: false,
    expanded: false,
  }

  toggleExpand = (event) => {
    event.preventDefault();
    console.log('toggling expand')
    this.setState(prevState => ({
      expanded: !prevState.exapnded
    }))
  }
  
  hoverOnSelect = () => {
    this.setState({showOverlay: true})
  }

  select = () => {
    if (this.state.selected) return;
    this.setState({selectAnimation: true})
    this.props.select(this.props.id)
    setTimeout(this.setState({selected: true}), 400)
  }
  render() {
    let { selecting } = this.props;
    let alignClass = classes.Center;
    let animatedClass = '';
    let selectedClass = '';
    let selectedClassPlus = '';
    if (this.props.align === 'left') alignClass = classes.Left;
    if (this.props.align === 'right') alignClass = classes.Right;
    if (this.state.selectAnimation) animatedClass = classes.Selecting;
    if (this.state.selected) {
      selectedClassPlus = classes.SelectedPlus;
      selectedClass = classes.Selected;
    };
    const notifications = (this.props.notifications > 0) ? <div className={classes.Notification} data-testid="content-box-ntf">{this.props.notifications}</div> : null;
    return (
    <Aux>
      <Link 
        to={selecting ? "#" : this.props.link}
        className={[classes.Container, selectedClass].join(" ")} 
        style={{height: this.state.expanded ? 150 : 50}}
      >
      <div 
        data-testid={`content-box-${this.props.title}`} 
        className={classes.SubContainer}
        onClick={selecting ? this.select : null}
        onMouseEnter={selecting ? this.hoverOnSelect : null}
        onMouseLeave={selecting ? () => {this.setState({showOverlay: false})} : null}
      >
        {this.state.showOverlay ? 
          <div className={classes.SelectOverlay} data-testid={`overlay-${this.props.title}`}>
            <i className={[classes.Plus, "fas fa-plus", animatedClass, selectedClassPlus].join(" ")}></i>
          </div> 
        : null}
        {notifications}
        <div className={classes.TitleIcons}>
          <div className={classes.Icons}>
            <Icons image={this.props.image} lock={this.props.locked} roomType={this.props.roomType}/>
          </div>
          <div className={classes.Title} data-testid="">{this.props.title}</div>
        </div>
        <div className={[classes.Content, alignClass].join(' ')}>
          {/* // Maybe separate all of this out ot its own component or revert back passing in this.props.children */}
          {this.props.details && this.state.expanded ?
            <div className={classes.Expanded}>
              <div>{this.props.details.description || ''}</div>
              {this.props.details.facilitators.length > 0 ? <div>Facilitators: {this.props.details.facilitators.map(facilitator => facilitator)}</div> : null}
              {this.props.details.entryCode ? <div>Entry Code: {this.props.details.entryCode}</div> : null}
            </div> 
          : <div className={classes.Expand}><Expand clickHandler={this.toggleExpand}/></div>}
        </div>
      </div>
      </Link>
    </Aux>
    )
  }
}

export default ContentBox;
