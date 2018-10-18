import React, { Component } from 'react';
import TextInput from '../../../Components/Form/TextInput/TextInput';
import Dropdown from '../../../Components/UI/Dropdown/Dropdown';
import RadioBtn from '../../../Components/Form/RadioBtn/RadioBtn';
import Checkbox from '../../../Components/Form/Checkbox/Checkbox';
import Aux from '../../../Components/HOC/Auxil';
import Modal from '../../../Components/UI/Modal/Modal';
import Button from '../../../Components/UI/Button/Button';
import classes from '../create.css';
import glb from '../../../global.css';
import { connect } from 'react-redux';
import * as actions from '../../../store/actions/';
class NewTemplate extends Component {
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
    const newCourse = {
      name: this.state.courseName,
      description: this.state.description,
      // rooms: roomIds,
      creator: this.props.userId,
      members: [{user: this.props.userId, role: 'facilitator'}],
      isPublic: this.state.isPublic,
      template: this.state.makeTemplate,
      templateIsPublic: this.state.templateIsPublic,
    }
    // update backend via redux so we can add this to the global state of courses
    this.props.createCourse(newCourse);
    this.setState({creating: false})
  }
  // this will be passed down to the dropdown menu and when we make a selection
  // it will pass a list of selected rooms back up and then we can synch our state
  // updateRooms = rooms => {
  //   this.setState({
  //     rooms: rooms
  //   })
  // }

  closeModal = event => {
    event.preventDefault();
    this.setState({creating: false})
  }

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
    return (
      <Aux>
        <Modal
          show={this.state.creating}
          closeModal={this.closeModal}
        ><div className={classes.Container}>
          <h3 className={classes.Title}>Create a New Template</h3>
          <form className={classes.Form}>
            <TextInput
              name='courseName'
              label='Course Name'
              change={this.changeHandler}
              width='40%'
            />
            <TextInput
              name='description'
              label='Description'
              change={this.changeHandler}
              width='80%'
            />
            <div className={classes.RadioButtons}>
              <RadioBtn name='public' checked={this.state.isPublic} check={() => this.setState({isPublic: true})}>Public</RadioBtn>
              <RadioBtn name='private' checked={!this.state.isPublic} check={() => this.setState({isPublic: false})}>Private</RadioBtn>
            </div>
            <div className={classes.PrivacyDesc}>
              Marking your course as public allows other VMT users to view the activity
              in your rooms without seeing any personal information about your participants.
            </div>
            <div className={classes.Template}>
              <div className={classes.Checkbox}>
                <Checkbox checked={this.state.makeTemplate} change={() => this.setState(prevState => ({makeTemplate: !prevState.makeTemplate}))}>Create a Template From this Course</Checkbox>
              </div>
              {this.state.makeTemplate ? <div className={classes.RadioButtons}>
                <RadioBtn name='Tpublic' checked={this.state.templateIsPublic} check={() => this.setState({templateIsPublic: true})}>Public</RadioBtn>
                <RadioBtn name='Tprivate' checked={!this.state.templateIsPublic} check={() => this.setState({templateIsPublic: false})}>Private</RadioBtn>
              </div> : null}
              Creating a template will copy this course into your template folder. Every room you add to
              this course will also be added to your template (along with the files associated with the room). Course members and activity in the rooms will not be saved to the template. This allow you to resuse this template for multiple groups of participants.
            </div>
            <div className={classes.Submit}>
              <Button click={this.submitForm}>Submit</Button>
              <Button click={this.closeModal}>Cancel</Button>
            </div>
          </form>
        </div>
        </Modal>
        <Button click={() => {this.setState({creating: true})}}>Create Template</Button>
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
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewTemplate);
