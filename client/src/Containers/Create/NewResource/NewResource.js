import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { hri } from 'human-readable-ids';
// @TODO Make these import less verbose
import TextInput from '../../../Components/Form/TextInput/TextInput';
import RadioBtn from '../../../Components/Form/RadioBtn/RadioBtn';
// import Checkbox from '../../../Components/Form/Checkbox/Checkbox';
import Aux from '../../../Components/HOC/Auxil';
import Modal from '../../../Components/UI/Modal/Modal';
import Button from '../../../Components/UI/Button/Button';
import classes from '../create.css';
import { connect } from 'react-redux';
import {
  createCourse, 
  createRoom, 
  createActivity, 
  createCourseTemplate,
  updateUser,
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
  courses: 'isogrids/hexa16',
  rooms: 'spaceinvaders',
}

class NewResource extends Component {
  state = {
    roomName: '',
    courseName: '',
    description: '',
    // rooms: [],
    isPublic: false,
    makeTemplate: false,
    templateIsPublic: false,
    creating: false,
    desmosLink: '',
    dueDate: '',
    ggb: true, // false = desmos
  }

  changeHandler = event => {
    this.setState({
      [event.target.name]: event.target.value,
    })
  }

  showModal = () => {
    this.setState({creating: true})
  }

  submitForm = event => {
    let { resource } = this.props;
    event.preventDefault();
    let theme = imageThemes[Math.floor(Math.random()*imageThemes.length)];
    let newResource = {
      name: this.state[`${this.props.resource}Name`],
      description: this.state.description,
      // rooms: roomIds,
      members: [{user: {_id: this.props.userId, username: this.props.username}, role: 'facilitator'}], // @TODO Do we want to default the creator to a facilitator?
      creator: this.props.userId,
      isPublic: this.state.isPublic,
      image: `http://tinygraphs.com/${shapes[resource]}/${this.state[`${this.props.resource}Name`]}?theme=${theme}&numcolors=4&size=220&fmt=svg`
    }
    // update backend via redux so we can add this to the global state of courses
    if (this.props.template) {
      switch (this.props.resource) {
        case 'courses' :
        this.props.createCourseTemplate(newResource);
        break;
        case 'rooms' :
        this.props.createRoomTemplate(newResource);
        break;
        default:;
      }
    } else {
      newResource.template = this.state.makeTemplate;
      newResource.templateIsPublic = this.state.templateIsPublic;
      // BECAUSE ACTIVITIES AND ROOMS ARE PRETTY MUCH THE SAME AN IF?ELSE BLOCK WOULD ACTUALLY BE MORE EFFICIENT
      switch (resource) {
        case 'courses' :
          newResource.entryCode = hri.random();
          this.props.createCourse(newResource);
          break;
        case 'activities' :
          newResource.ggbFile = this.state.ggbFile;
          newResource.desmosLink = this.state.desmosLink
          newResource.roomType = this.state.ggb ? 'geogebra' : 'desmos';
          if (this.props.courseId) {
            newResource.course = this.props.courseId;
            delete newResource.members
          }
          console.log('bout to creat and activity: image: ', newResource.image)
          this.props.createActivity(newResource);
          break;
        case 'rooms' :
          newResource.entryCode = hri.random();
          newResource.ggbFile = this.state.ggbFile;
          newResource.desmosLink = this.state.desmosLink;
          newResource.dueDate = this.state.dueDate;
          if (this.props.courseId) newResource.course = this.props.courseId;
          newResource.roomType = this.state.ggb ? 'geogebra' : 'desmos';
          this.props.createRoom(newResource);
          break;
        default: break;
      }
    }
    this.setState({creating: false})
    if (this.props.intro) {
      this.props.updateUser({accountType: 'facilitator'})
      this.props.history.push(`/myVMT/${resource}`)
    }
  }

  render() {
    let { resource, intro } = this.props;
    let displayResource;
    if (resource === 'activities') {
      displayResource = 'Activity'
    } else { displayResource = resource.charAt(0).toUpperCase() + resource.slice(1, resource.length - 1); }
    // @IDEA ^ while I've never seen this done before...maybe it'd be cleaner to have a file of static content and just import it in so we don't have these long strings all over
    return (
      this.state.creating ? 
      <Modal
      show={true}
      closeModal={() => this.setState({creating: false})}
      >
            <div className={classes.Container}>
              <h3 className={classes.Title}>Create a New {displayResource} {this.props.template ? 'Template' : null}</h3>
              <form className={classes.Form}>
                <div className={classes.FormSection}>
                  <TextInput
                    name={`${resource}Name`}
                    label={`${displayResource} Name`}
                    change={this.changeHandler}
                    width='40%'
                  />
                  <TextInput
                    name='description'
                    label='Description'
                    change={this.changeHandler}
                    width='80%'
                    />
                </div>
                {(resource === 'activities' || resource === 'rooms') ?
                  <div className={classes.FormSection}>
                    <div className={classes.RadioButtons}>
                      <RadioBtn name='geogebra' checked={this.state.ggb} check={() => this.setState({ggb: true})}>GeoGebra</RadioBtn>
                      <RadioBtn name='desmos' checked={!this.state.ggb} check={() => this.setState({ggb: false})}>Desmos</RadioBtn>
                    </div>
                    {this.state.ggb ?
                      <div>
                        <div>Import a GeoGebra workspace</div>
                        <div><Button>Select a Geogebra File</Button></div>
                      </div> :
                      <TextInput
                      name='desmosLink'
                      label='Paste a Desmos workspace'
                      change={this.changeHandler}
                      width='80%'/>
                    }
                  </div>
                : null}
                {(resource === 'rooms') ?
                  <div className={classes.FormSection}>
                    <TextInput label='Due Date (Optional)' name='dueDate' type='date' date={this.setDate} />
                  </div>
                : null}
                <div className={classes.FormSection}>
                  <div className={classes.RadioButtons}>
                    <RadioBtn name='public' checked={this.state.isPublic} check={() => this.setState({isPublic: true})}>Public</RadioBtn>
                    <RadioBtn name='private' checked={!this.state.isPublic} check={() => this.setState({isPublic: false})}>Private</RadioBtn>
                  </div>
                  <div className={classes.PrivacyDesc}>
                    Marking your {resource} as public allows other VMT users to view the activity
                    in your rooms without seeing any personal information about your participants.
                  </div>
                </div>
                <div className={classes.Submit}>
                  <div className={classes.Button}><Button m={5} click={this.submitForm}>Submit</Button></div>
                  <div className={classes.Button}><Button m={5} click={e => {e.preventDefault(); this.setState({creating: false})}}>Cancel</Button></div>
                </div>
              </form>
            </div>
          </Modal>
           :
          <Aux>
            <div className={classes.Button}><Button m={5} click={this.showModal} data-testid={`create-${displayResource}`}>Create <span className={classes.Plus}><i className="fas fa-plus"></i></span></Button></div>
            {(resource === 'activities' && !intro) ? <div className={classes.Button}><Button m={5} click={this.showModal}>Select an existing {displayResource}</Button></div> : null}
            {(resource === 'rooms' && !intro) ? <div className={classes.Button}><Button m={5} click={this.showModal}>Create from an Activity</Button></div> : null}
          </Aux>
        
          )
        }
}

let mapStateToProps = store => {
  return {
    myRooms: store.user.rooms,
    rooms: store.rooms.rooms,
    userId: store.user._id,
    username: store.user.username,
  }
}

export default withRouter(connect(mapStateToProps, {
  createCourse, 
  createRoom, 
  createActivity, 
  createCourseTemplate,
  updateUser,
})(NewResource));
