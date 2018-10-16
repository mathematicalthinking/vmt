import React, { Component } from 'react';
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
import * as actions from '../../../store/actions/';
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
    event.preventDefault();
    // const roomIds = this.state.rooms.map(room => room.id);
    const newResource = {
      name: this.state[`${this.props.resource}Name`],
      description: this.state.description,
      // rooms: roomIds,
      members: [{user: {_id: this.props.userId, username: this.props.username}, role: 'teacher'}], // @TODO Do we want to default the creator to a teacher?
      creator: this.props.userId,
      isPublic: this.state.isPublic,
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
    }} else {
      newResource.template = this.state.makeTemplate;
      newResource.templateIsPublic = this.state.templateIsPublic;
      // BECAUSE ACTIVITIES AND ROOMS ARE PRETTY MUCH THE SAME AN IF?ELSE BLOCK WOULD ACTUALLY BE MORE EFFICIENT
      switch (this.props.resource) {
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
  }

  render() {
    const { resource } = this.props;
    let displayResource;
    if (resource === 'activities') {
      displayResource = 'Activity'
    } else { displayResource = resource.charAt(0).toUpperCase() + resource.slice(1, resource.length - 1); }
    // @IDEA ^ while I've never seen this done before...maybe it'd be cleaner to have a file of static content and just import it in so we don't have these long strings all over
    return (
      <Aux>
        <Modal
          show={this.state.creating}
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
                  in your rooms without seeing any personal information about your students.
                </div>
              </div>
              <div className={classes.Submit}>
                <Button click={this.submitForm}>Submit</Button>
                <Button click={e => {e.preventDefault(); this.setState({creating: false})}}>Cancel</Button>
              </div>
            </form>
          </div>
        </Modal>
        <Button click={this.showModal} data-testid={`create-${displayResource}`}>Create A New {displayResource}</Button>
        {(resource === 'activities') ? <Button click={this.showModal}>Select an existing {displayResource}</Button> : null}
        {(resource === 'rooms') ? <Button click={this.showModal}>Create from an Activity</Button> : null}
      </Aux>
    )
  }
}

const mapStateToProps = store => {
  return {
    myRooms: store.user.rooms,
    rooms: store.rooms.rooms,
    userId: store.user._id,
    username: store.user.username,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    createCourse: body => dispatch(actions.createCourse(body)),
    createRoom: body => dispatch(actions.createRoom(body)),
    createActivity: body => dispatch(actions.createActivity(body)),
    createCourseTemplate: body => dispatch(actions.createCourseTemplate(body)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewResource);
