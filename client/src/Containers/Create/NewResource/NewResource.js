import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { hri } from 'human-readable-ids';
import Step1 from './Step1';
import StepDisplay from './StepDisplay';
import { NewResource, FromActivity } from '../../../Layout';
import { getUserResources, populateResource }from '../../../store/reducers';
import { Modal } from '../../../Components/'; 
import Aux from '../../../Components/HOC/Auxil';
import Button from '../../../Components/UI/Button/Button';
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
import { runInThisContext } from 'vm';

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
    creating: false,
    selecting: false,
    mode: '',
    step: 0, // step of the creation process
  }

  startCreation = () => this.setState({creating: true, selecting: false})

  select = (mode) => this.setState({selecting: true, creating: false, mode,})

  submitForm = ({name, description, privacySetting, dueDate, ggb, ggbFile, desmosLink}) => {
    let { resource } = this.props;
    let theme = imageThemes[Math.floor(Math.random()*imageThemes.length)];
    let newResource = {
      name: name,
      description: description,
      members: [{user: {_id: this.props.userId, username: this.props.username}, role: 'facilitator'}],
      creator: this.props.userId,
      privacySetting: privacySetting,
      image: `http://tinygraphs.com/${shapes[resource]}/${name}?theme=${theme}&numcolors=4&size=220&fmt=svg`
    }
    if (newResource.privacySetting === 'private') {
      newResource.entryCode = hri.random();
    }
    switch (resource) {
      case 'courses' :
        this.props.createCourse(newResource);
        break;
      case 'activities' :
        newResource.ggbFile = ggbFile;
        newResource.desmosLink = desmosLink;
        newResource.roomType = ggb ? 'geogebra' : 'desmos';
        if (this.props.courseId) {
          newResource.course = this.props.courseId;
          delete newResource.members
        }
        this.props.createActivity(newResource);
        break;
      case 'rooms' :
        newResource.ggbFile = ggbFile;
        newResource.desmosLink = desmosLink;
        newResource.dueDate = dueDate;
        if (this.props.courseId) newResource.course = this.props.courseId;
        newResource.roomType = ggb ? 'geogebra' : 'desmos';
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

  closeModal = () => {
    this.setState({creating: false,})
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
    let steps = [<Step1 resource={displayResource}/>]

    return (
      <Aux> {
        this.state.creating 
        ? <Modal show={this.state.creating} closeModal={this.closeModal}>
            <StepDisplay activeStep={this.state.step} />
            {steps[this.state.step]}
          </Modal>
        : <div className={classes.Button}>
             <Button theme={'Small'} click={this.startCreation} data-testid={`create-${displayResource}`}>
               Create <span className={classes.Plus}><i className="fas fa-plus"></i></span>
             </Button>
          </div>
      }
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
