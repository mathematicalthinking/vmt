import React, { Component } from 'react';
import TextInput from '../../../Components/Form/TextInput/TextInput';
import RadioBtn from '../../../Components/Form/RadioBtn/RadioBtn';
import Checkbox from '../../../Components/Form/Checkbox/Checkbox';
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
    ggb: true, // false = desmos
  }

  changeHandler = event => {
    this.setState({
      [event.target.name]: event.target.value,
    })
  }

  submitForm = event => {
    event.preventDefault();
    // const roomIds = this.state.rooms.map(room => room.id);
    const newResource = {
      name: this.state[`${this.props.resource}Name`],
      description: this.state.description,
      // rooms: roomIds,
      creator: this.props.userId,
      isPublic: this.state.isPublic,
    }
    // update backend via redux so we can add this to the global state of courses
    if (this.props.template) {
      switch (this.props.resource) {
        case 'course' :
          this.props.createCourseTemplate(newResource);
          break;
        case 'room' :
          this.props.createRoomTemplate(newResource);
          break;
        default:;
    }} else {
      newResource.members = [{user: this.props.userId, role: 'teacher'}]; // @TODO Do we want to default the creator to a teacher?
      newResource.template = this.state.makeTemplate;
      newResource.templateIsPublic = this.state.templateIsPublic;
      switch (this.props.resource) {
        case 'course' :
          console.log(newResource)
          this.props.createCourse(newResource);
          break;
        case 'room' :
          newResource.tabs = [{ggbFile: this.state.ggbFile, desmosLink: this.state.desmosLink}]
          newResource.roomType = this.state.ggb ? 'geogebra' : 'desmos';
          this.props.createRoom(newResource);
        break;
        default:;
      }
    }
    this.setState({creating: false})
  }
  // this will be passed down to the dropdown menu and when we make a selection
  // it will pass a list of selected rooms back up and then we can synch our state
  // updateRooms = rooms => {
  //   this.setState({
  //     rooms: rooms
  //   })
  // }

  render() {
    // @TODO DO we want to allow selecting of rooms for course at the time of course creation? If so, uncomment Below and any reference to state.rooms
    // prepare dropdown list of rooms
    // const roomsSelected = this.state.rooms.map(room => (
    //   // sel- to differentiate between dropdown ids
    //   <div id={`sel-${room.id}`}>{room.name}</div>
    // ))
    // i find this to be annoying...why wont .map just return an empty array
    // if this.props.myRooms does not exist
    // let myRooms;
    // if (this.props.myRooms) {
    //   myRooms = this.props.myRooms.map(room => ({
    //     id: room._id, name: room.name,
    //   }))
    // }
    // const publicRooms = this.props.rooms.map(room => ({
    //   id: room._id, name: room.name
    // }))
    const resource = this.props.resource;
    const displayResource = resource.charAt(0).toUpperCase() + resource.slice(1);
    // const displayResource = "RESOURCE";
    const templateDetails = (resource === 'course') ? "Every room you add to this course will also be added to your template (along with the files associated with the room). Course members and activity in the rooms will not be saved to the template. This allow you to resuse this template for multiple groups of students." : '';
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
              {(resource === 'room') ?
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

              {!this.props.template ? <div className={classes.FormSection}>
                <div className={classes.Checkbox}>
                  <Checkbox checked={this.state.makeTemplate} change={() => this.setState(prevState => ({makeTemplate: !prevState.makeTemplate}))}>Create a Template From this {displayResource}</Checkbox>
                </div>
                {this.state.makeTemplate ? <div className={classes.RadioButtons}>
                  <RadioBtn name='Tpublic' checked={this.state.templateIsPublic} check={() => this.setState({templateIsPublic: true})}>Public</RadioBtn>
                  <RadioBtn name='Tprivate' checked={!this.state.templateIsPublic} check={() => this.setState({templateIsPublic: false})}>Private</RadioBtn>
                </div> : null}
                Creating a template will copy this {resource} into your template folder.
                {templateDetails}
              </div> : null}
              <div className={classes.Submit}>
                <Button click={this.submitForm}>Submit</Button>
                <Button click={e => {e.preventDefault(); this.setState({creating: false})}}>Cancel</Button>
              </div>
            </form>
          </div>
        </Modal>
        <Button click={() => {this.setState({creating: true})}}>Create New {displayResource} {this.props.template ? 'Template' : null}</Button>
        {!this.props.template ? <Button click={() => this.setState({creating: true})}>Create From Template</Button> : null}
      </Aux>
    )
  }
}

const mapStateToProps = store => {
  return {
    myRooms: store.user.rooms,
    rooms: store.rooms.rooms,
    userId: store.user.id,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    createCourse: body => dispatch(actions.createCourse(body)),
    createRoom: body => dispatch(actions.createRoom(body)),
    createCourseTemplate: body => dispatch(actions.createCourseTemplate(body)),
    createRoomTemplate: body => dispatch(actions.createRoomTemplate(body)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewResource);
