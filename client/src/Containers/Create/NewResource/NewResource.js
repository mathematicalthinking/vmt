import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { hri } from 'human-readable-ids';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
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
      activities: this.state.activities,
      image: `http://tinygraphs.com/${shapes[resource]}/${this.state.name}?theme=${theme}&numcolors=4&size=220&fmt=svg`
    }
    if (newResource.privacySetting === 'private') {
      newResource.entryCode = hri.random();
    }
    console.log(resource)
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
  
  setPrivacy = (privacySetting) => {
    this.setState({privacySetting,})
  }
  nextStep = (direction) => {
    this.setState({
      step: this.state.step + 1,
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

    if (resource === 'rooms') {

    }
    let stepTitles = ['Enter Details', this.state.copying ? 'Select 1 or More Activities to Copy' : 'Enter Details']
    let steps = [
      <Step1 displayResource={displayResource} changeHandler={this.changeHandler}/>, 
      <Step2 displayResource={displayResource} check={this.setCopying} copying={this.state.copying} addActivity={this.addActivity}/>,
      <Step3 displayResource={displayResource} check={this.setPrivacy} privacySetting={this.state.privacySetting} />
    ]

    return (
      <Aux> 
        {this.state.creating 
          ? <Modal show={this.state.creating} closeModal={this.closeModal}>
              <div className={classes.Container}>
                <h2>Create a {displayResource}</h2>
                {steps[this.state.step]}
              </div>
              <div className={classes.Row}>
                { this.state.step > 0 ? <Button click={this.prevStep}>Back</Button> : null }
                { this.state.step < 2 ? <Button click={this.nextStep}>Next</Button> : <Button data-testId='create' click={this.submitForm}>Create</Button> }
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
