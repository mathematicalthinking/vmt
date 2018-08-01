import React, { Component } from 'react';
import TextInput from '../../../Components/Form/TextInput/TextInput';
import Dropdown from '../../../Components/UI/Dropdown/Dropdown';
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
    courseName: '',
    description: '',
    // rooms: [],
    isPublic: false,
    makeTemplate: false,
    templateIsPublic: false,
    creating: false,
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
      name: this.state.courseName,
      description: this.state.description,
      // rooms: roomIds,
      creator: this.props.userId,
      members: [{user: this.props.userId, role: 'teacher'}], // @TODO Do we want to default the creator to a teacher?
      isPublic: this.state.isPublic,
      template: this.state.makeTemplate,
      templateIsPublic: this.state.templateIsPublic,
    }
    // update backend via redux so we can add this to the global state of courses
    switch (this.props.resource) {
      case 'course' :
        this.props.createCourse(newResource);
        break;
      case 'room' :
        this.props.createRoom(newResource);
        break;
      default:;
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
    console.log(resource)
    const displayResource = resource.charAt(0).toUpperCase() + resource.slice(1);
    // const displayResource = "RESOURCE";
    const templateDetails = (resource === 'course') ? "Every room you add to this course will also be added to your template (along with the files associated with the room). Course members and activity in the rooms will not be saved to the template. This allow you to resuse this template for multiple groups of students." : '';
    return (
      <Aux>
        <Modal
          show={this.state.creating}
          closeModal={() => this.setState({creating: false})}
        >
          <div className={classes.Container}>
            <h3 className={classes.Title}>Create a New {displayResource}</h3>
            <form className={classes.Form}>
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
              <div>
                <div className={classes.RadioButtons}>
                  <RadioBtn name='public' checked={this.state.isPublic} check={() => this.setState({isPublic: true})}>Public</RadioBtn>
                  <RadioBtn name='private' checked={!this.state.isPublic} check={() => this.setState({isPublic: false})}>Private</RadioBtn>
                </div>
                <div className={classes.PrivacyDesc}>
                  Marking your {resource} as public allows other VMT users to view the activity
                  in your rooms without seeing any personal information about your students.
                </div>
              </div>
              <div className={classes.Template}>
                <div className={classes.Checkbox}>
                  <Checkbox checked={this.state.makeTemplate} change={() => this.setState(prevState => ({makeTemplate: !prevState.makeTemplate}))}>Create a Template From this {displayResource}</Checkbox>
                </div>
                {this.state.makeTemplate ? <div className={classes.RadioButtons}>
                  <RadioBtn name='Tpublic' checked={this.state.templateIsPublic} check={() => this.setState({templateIsPublic: true})}>Public</RadioBtn>
                  <RadioBtn name='Tprivate' checked={!this.state.templateIsPublic} check={() => this.setState({templateIsPublic: false})}>Private</RadioBtn>
                </div> : null}
                Creating a template will copy this {resource} into your template folder.
                {templateDetails}
              </div>
              <div className={classes.Submit}>
                <Button click={this.submitForm}>Submit</Button>
                <Button click={e => {e.preventDefault(); this.setState({creating: false})}}>Cancel</Button>
              </div>
            </form>
          </div>
        </Modal>
        <Button click={() => {this.setState({creating: true})}}>Create New {displayResource}</Button>
        <Button>Create From Template</Button>
      </Aux>
    )
  }
}

const mapStateToProps = store => {
  return {
    myRooms: store.userReducer.myRooms,
    rooms: store.roomsReducer.rooms,
    userId: store.userReducer.userId,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    createCourse: body => dispatch(actions.createCourse(body)),
    createRoom: body => dispatch(actions.createRoom(body)),
    // createCourseTemplate: body => dispatch(actions.createCourseTemplate),
    // createRoomTemplate: body => dispatch(actions.createRoomTemplate),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewResource);
