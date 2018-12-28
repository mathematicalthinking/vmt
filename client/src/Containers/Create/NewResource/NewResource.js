import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { hri } from 'human-readable-ids';
import Step1 from './Step1';
import Step2Copy from './Step2Copy';
import Step2New from './Step2New'
import Step3 from './Step3';
import DueDate from './DueDate'
import StepDisplay from './StepDisplay';
import { NewResource, FromActivity } from '../../../Layout';
import { getUserResources, populateResource }from '../../../store/reducers';
import { Modal, Aux, Button, } from '../../../Components/';
import classes from '../create.css';
import { connect } from 'react-redux';
import {
  createCourse,
  createRoom,
  createActivity,
  createCourseTemplate,
  updateUser,
  createRoomFromActivity,
  copyActivity,
} from '../../../store/actions/';

const imageThemes = [
  'frogideas', 'duskfalling',
  'sugarsweets', 'heatwave',
  'daisygarden', 'seascape',
  'summerwarmth', 'bythepool',
  'berrypie',
]

const shapes = {
  activities: 'isogrids',
  courses: 'labs/isogrids/hexa16',
  rooms: 'spaceinvaders',
}

class NewResourceContainer extends Component {
  
  state = {
    // rooms: [],
    creating: false, // true will open modal and start creation process
    copying: false, 
    ggb: true,
    step: 0, // step of the creation process
    name: '',
    description: '',
    desmosGraph: '',
    ggbFile: '',
    dueDate: '',
    activities: [],
    privacySetting: 'public',
  }

  startCreation = () => this.setState({creating: true,})

  changeHandler = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    })
  }

  setCopying = (event) => {
    this.setState({copying: event.target.name === 'copy'})
  }

  submitForm = () => {
    let { resource } = this.props;
    let theme = imageThemes[Math.floor(Math.random()*imageThemes.length)];
    let newResource = {
      name: this.state.name,
      description: this.state.description,
      creator: this.props.userId,
      privacySetting: this.state.privacySetting,
      activities: this.state.activities.length > 0 ? this.state.activities : null,
      image: `http://tinygraphs.com/${shapes[resource]}/${this.state.name}?theme=${theme}&numcolors=4&size=220&fmt=svg`
    }
    if (newResource.privacySetting === 'private') {
      newResource.entryCode = hri.random();
    }
    switch (resource) {
      case 'courses' :
        this.props.createCourse(newResource);
        break;
      case 'activities' :
        newResource.ggbFile = this.state.ggbFile;
        newResource.desmosLink = this.state.desmosLink;
        newResource.roomType = this.state.ggb ? 'geogebra' : 'desmos';
        if (this.props.courseId) {
          newResource.course = this.props.courseId;
          delete newResource.members
        }
        this.props.createActivity(newResource);
        break;
      case 'rooms' :
        newResource.ggbFile = this.state.ggbFile;
        newResource.desmosLink = this.state.desmosLink;
        newResource.members = [{user: {_id: this.props.userId, username: this.props.username}, role: 'facilitator'}];
        newResource.dueDate = this.state.dueDate;
        if (this.props.courseId) newResource.course = this.props.courseId;
        newResource.roomType = this.state.ggb ? 'geogebra' : 'desmos';
        this.props.createRoom(newResource);
        break;
      default: break;
    }
    this.setState({creating: false})
    if (this.props.intro) {
      this.props.updateUser({accountType: 'facilitator'})
      this.props.history.push(`/myVMT/${resource}`)
    }
  }

  redirectToActivity = () => {
    this.props.history.push('/community/activities/selecting')
  }

  addActivity = (event, id) => {
    let updatedActivities;
    if (this.state.activities.indexOf(id) >= 0) {
      updatedActivities = this.state.activities.filter(acId => acId !== id); 
    } else {
      updatedActivities = [...this.state.activities, id]
    }
    this.setState({activities: updatedActivities})
  }

  setGgb = (event) => {
    this.setState({ggb: event.target.name === 'geogebra'})
  }
  
  setDueDate = dueDate => {
    this.setState({dueDate,})
  }
  setPrivacy = (privacySetting) => {
    this.setState({privacySetting,})
  }
  nextStep = (direction) => {
    let copying = this.state.copying;
    if (this.state.step === 0) {
      if (direction === 'copy') {
        copying = true;
      }
    }
    this.setState({
      step: this.state.step + 1,
      copying: copying,
    })
  }
  
  prevStep = () => {
    this.setState({
      step: this.state.step - 1 || 0,
    })
  }
  
  closeModal = () => {
    this.setState({
      copying: false,
      step: 0,
      creating: false,
    })
  }

  render() {
    // Intro = true if and only if we've navigated from the "Become a Facilitator" page
    let { resource, intro, courseId } = this.props;
    let displayResource;
    if (resource === 'activities') {
      displayResource = 'Activity'
    } else { displayResource = resource.charAt(0).toUpperCase() + resource.slice(1, resource.length - 1); }

    let steps = [
      <Step1 displayResource={displayResource} changeHandler={this.changeHandler}/>, 
      this.state.copying 
        ? <Step2Copy displayResource={displayResource} addActivity={this.addActivity}/>
        : <Step2New setGgb={this.setGgb} ggb={this.state.ggb}/>,
      <Step3 displayResource={displayResource} check={this.setPrivacy} privacySetting={this.state.privacySetting} />
    ]

    let stepDisplays = steps.map((step) => <div className={classes.Step}></div>);

    if (resource === 'rooms') {
      steps.splice(2, 0, <DueDate dueDate={this.state.dueDate} selectDate={this.setDueDate} />)
    }

    let buttons;
    if (this.state.step === 0 ) {
      buttons = <div className={classes.Row}>
        <Button click={() => {this.nextStep('copy')}}m={5}>Copy existing Activities</Button>
        <Button click={() => {this.nextStep('new')}} m={5}>Create a New {displayResource}</Button>
      </div>
    } else if (this.state.step === steps.length - 1) {
      buttons = <div className={classes.Row}>
        <Button data-testId='create' click={this.submitForm}>Create</Button>
      </div>
    } else {
      buttons = <Button click={this.nextStep}>Next</Button>
    }

    return (
      <Aux> 
        {this.state.creating 
          ? <Modal show={this.state.creating} closeModal={this.closeModal}>
              {this.state.step > 0 ? <i onClick={() => this.setState({step: this.state.step - 1})} className={["fas", "fa-arrow-left", classes.BackIcon].join(' ')}></i> : null}
              <div className={classes.Container}>
                <h2 className={classes.ModalTitle}>Create {resource === 'activities' ? 'an' : 'a'} {displayResource}</h2>
                {steps[this.state.step]}
              </div>
              {buttons}
              <div className={classes.stepDisplay}>
                {stepDisplays}
              </div>
            </Modal>
          : null
          } 
        <div className={classes.Button}>
          <Button theme={'Small'} click={this.startCreation} data-testid={`create-${displayResource}`}>
            Create <span className={classes.Plus}><i className="fas fa-plus"></i></span>
          </Button>
        </div>
      </Aux>

      //   {this.state.creating ? <NewResource
      //     step={this.state.step}
      //     resource={resource}
      //     displayResource={displayResource}
      //     show={this.state.creating}
      //     ggb={this.state.ggb}
      //     close={() => this.setState({creating: false})}
      //     submit={this.submitForm}
      //   /> : null}
      //   <div className={classes.Button}>
      //     <Button theme={'Small'} click={this.create} data-testid={`create-${displayResource}`}>
      //       Create <span className={classes.Plus}><i className="fas fa-plus"></i></span>
      //     </Button>
      //   </div>
    )
  }
}

let mapStateToProps = (store, ownProps) => {
  return {
    myRooms: store.user.rooms,
    rooms: store.rooms.rooms, // ????
    userId: store.user._id,
    username: store.user.username,
    userActivities: getUserResources(store, 'activities') || [],
    course: ownProps.match.params.course_id ? populateResource(store, 'courses', ownProps.match.params.course_id, ['activities']) : null,
  }
}

export default withRouter(connect(mapStateToProps, {
  createCourse,
  createRoom,
  createActivity,
  createCourseTemplate,
  updateUser,
  createRoomFromActivity,
  copyActivity,
})(NewResourceContainer));
