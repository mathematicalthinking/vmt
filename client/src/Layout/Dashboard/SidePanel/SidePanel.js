import React from 'react';
import { Button } from '../../../Components/';
import { Link } from 'react-router-dom';
import classes from './sidePanel.css';
const SidePanel = React.memo(({
  image, title, subTitle,
  additionalDetails, toggleView,
  toggleEdit, owner, editInfo, editing,
  buttons, user, bothRoles, view,
}) => {
  let details = Object.keys(additionalDetails).map(key => {
    return (
      <div>
        <b>{key}: </b>{additionalDetails[key]}
      </div>)
  })
  return (
    <div className={classes.Container}>
      <div className={classes.Top}>
        <div className={classes.Image}><img src={image} alt={title} /></div>
        <div className={classes.Details}>
          <div className={classes.spMain}>{title}</div>
          <div className={classes.spSecondary}>{subTitle}</div>
          <div className={classes.spAdditional}>{details}</div>
          { owner && editInfo.action ? <div  className={classes.Edit} onClick={toggleEdit}>{editInfo.text} <i className="fas fa-edit"></i></div>: null}
        </div>
        <div className={classes.spButtons}>
          {buttons}
        </div>
        <div className={classes.ViewOpts}></div>
      </div>
      {owner && bothRoles ? <div className={classes.CreateForParticipant}><Link to='facilitator' data-testid='become-facilitator'>become a facilitator</Link></div> : null}
      {bothRoles ? 
      <div>
        <div>view as...</div>
        <Button m={5} click={toggleView} active={view === 'facilitator'}>Facilitator</Button>
        <Button m={5} click={toggleView} active={view === 'participant'}>Participant</Button>
      </div> : null }
    </div>
  )
})

export default SidePanel