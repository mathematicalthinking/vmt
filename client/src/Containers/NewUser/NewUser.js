import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import TextInput from '../../Components/Form/TextInput/TextInput';
import glb from '../../global.css';
import * as actions from '../../store/actions/';
import { connect } from 'react-redux';
class NewUser extends Component {
  state = {
    firstName: {type: 'text', label: 'First Name', value:''},
    lastName: {type: 'text', label: 'Last Name', value:''},
    username: {type: 'text', label: 'Username', value:''},
    email: {type: 'email', label: 'Email', value:''},
    password: {type: 'password', label: 'Password', value:'', name: 'password'},
  }
  // pass to text inputs to update state from user input
  changeHandler = event => {
    let updatedState = {...this.state};
    updatedState[event.target.name].value = event.target.value;
    this.setState(updatedState);
    console.log(this.state)
  }

  signUp = () => {
    const newUser = {
      firstName: this.state.firstName.value,
      lastName: this.state.lastName.value,
      username: this.state.username.value,
      email: this.state.email.value,
      password: this.state.password.value,
    }
    // dispatch redux action so we can update global state that this new user
    // is now signed in
    this.props.signUp(newUser);

  }

  render() {
    if (this.props.loggedIn) {
    }
    const formList = Object.keys(this.state)
    const formElements = formList.map(elem => (
        <TextInput change={this.changeHandler} type={this.state[elem].type} label={this.state[elem].label} name={elem} />
      )
    )
    return (
      // after creating a user redirect to login @TODO figure out if this is for creating students or for signing up on your own
      // the answer will determine where/if we redirect to
      this.props.loggedIn ? <Redirect to='/'/> :
      <div className='col-md-4'>
        <h2>Create A New User</h2>
        <div className={glb.FlexCol}>
          {formElements}
        </div>
        <button onClick={this.signUp} classNamee='btn btn-default'>Create</button>
      </div>
    )
  }
}

const mapStateToProps = store => {
  return {
    loggedIn: store.userReducer.loggedIn,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    signUp: body => dispatch(actions.signUp(body)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewUser);
