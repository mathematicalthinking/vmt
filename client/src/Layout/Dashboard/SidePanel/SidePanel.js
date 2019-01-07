import React from 'react';
import {
  // Button,
  Avatar,
  Aux,
} from '../../../Components/';
import { Link } from 'react-router-dom';
import classes from './sidePanel.css';
import capitalize from 'lodash/capitalize';

const SidePanel = React.memo(({
  image, name, subTitle, alt,
  additionalDetails, toggleView,
  toggleEdit, owner, editButton, editing,
  buttons, accountType, bothRoles, view,
}) => {
  let details = Object.keys(additionalDetails).map(key => {
    return (
      <div key={key} className={classes.KeyContainer}>
        <span className={classes.KeyName}>{key} </span><span className={classes.KeyValue}>{additionalDetails[key]}</span>
      </div>
    )
  })

  return (
    <Aux>
      <div className={classes.Top}>
        {image
          ? <img className={classes.Image} src={image} alt={alt} />
          : <Avatar className={classes.Image} size='large'/>
        }
        <div className={classes.Details}>
          <div className={classes.spMain}>{name}</div>
          <div className={classes.spSecondary}>{subTitle}</div>
          <div className={classes.spAdditional}>{details}</div>
         {editButton ? <div className={classes.Edit}>{editButton}</div> : null}
        </div>
        <div className={classes.spButtons}>{buttons}</div>
        <div className={classes.ViewOpts}></div>
      </div>
      <div className={classes.Bottom}>
        {accountType === 'participant' && !bothRoles ? <div className={classes.CreateForParticipant}><Link to='facilitator' data-testid='become-facilitator'>become a facilitator</Link></div> : null}
        {bothRoles ?
        <div className={classes.ToggleView}>
          <span>View: {capitalize(view)}<i onClick={toggleView} className={["fas fa-sync", classes.Icon].join(' ')}></i></span>
        </div> : null }
      </div>
    </Aux>
  )
})

export default SidePanel